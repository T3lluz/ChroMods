import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fakeChrome({ version = "1.5.0", stored = {}, tabs = [] } = {}) {
  const local = { ...stored };
  const badge = { text: null, color: null, title: null };
  const reloaded = { extension: 0, tabs: [] };
  return {
    runtime: {
      getManifest: () => ({ version }),
      reload: () => {
        reloaded.extension += 1;
      },
    },
    tabs: {
      query: async () => tabs,
      reload: async (id) => {
        reloaded.tabs.push(id);
      },
    },
    storage: {
      local: {
        get: async (key) => (key in local ? { [key]: local[key] } : {}),
        set: async (items) => Object.assign(local, items),
        remove: async (key) => {
          delete local[key];
        },
      },
    },
    action: {
      setBadgeText: async ({ text }) => {
        badge.text = text;
      },
      setBadgeBackgroundColor: async ({ color }) => {
        badge.color = color;
      },
      setTitle: async ({ title }) => {
        badge.title = title;
      },
    },
    __local: local,
    __badge: badge,
    __reloaded: reloaded,
  };
}

function loadUpdates(options = {}) {
  const source = fs.readFileSync(path.join(root, "scripts/updates.js"), "utf8");
  const chrome = fakeChrome(options);
  const context = {
    chrome,
    fetch: options.fetch,
    URL,
    URLSearchParams,
    AbortSignal,
    Date,
    console,
    /* Supplied by sites.js and dark-sites.js in the extension itself. */
    matchSiteFromUrl: options.matchSiteFromUrl,
    chromodsDarkHostFromUrl: options.chromodsDarkHostFromUrl,
    chromodsIsDarkHostEnabled: options.chromodsIsDarkHostEnabled,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  context.__chrome = chrome;
  context.evaluate = (expression) => vm.runInContext(expression, context);
  return context;
}

function jsonResponse(body, { status = 200, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    json: async () => body,
  };
}

const RELEASE = {
  tag_name: "v1.6.0",
  name: "ChroMods v1.6.0",
  body: "## Highlights\n- Adds an updater\n- Fixes chat drag\n",
  html_url: "https://github.com/T3lluz/ChroMods/releases/tag/v1.6.0",
  published_at: "2026-08-21T10:00:00Z",
  assets: [
    { name: "notes.txt", browser_download_url: "https://example.com/notes.txt" },
    { name: "chromods-1.6.0.zip", browser_download_url: "https://example.com/chromods-1.6.0.zip" },
  ],
};

test("version comparison handles v prefixes and multi-digit parts", () => {
  const api = loadUpdates();
  assert.equal(api.chromodsCompareVersions("1.6.0", "1.5.0"), 1);
  assert.equal(api.chromodsCompareVersions("v1.5.0", "1.5.0"), 0);
  assert.equal(api.chromodsCompareVersions("1.10.0", "1.9.9"), 1);
  assert.equal(api.chromodsCompareVersions("1.5", "1.5.1"), -1);
  assert.equal(api.chromodsCompareVersions("nightly", "1.5.0"), 0);
});

test("update state normalizes to the running manifest version", () => {
  const api = loadUpdates({ version: "1.5.0" });
  const state = api.chromodsNormalizeUpdateState({ latestVersion: "1.6.0", source: "bogus", checkedAt: "x" });
  assert.equal(state.currentVersion, "1.5.0");
  assert.equal(state.latestVersion, "1.6.0");
  assert.equal(state.source, null);
  assert.equal(state.checkedAt, 0);
  assert.equal(api.chromodsUpdateAvailable(state), true);
  assert.equal(api.chromodsUpdateAvailable(api.chromodsNormalizeUpdateState(null)), false);
});

test("a dismissed version hides the badge but keeps the update available", () => {
  const api = loadUpdates({ version: "1.5.0" });
  const state = api.chromodsNormalizeUpdateState({ latestVersion: "1.6.0", dismissedVersion: "1.6.0" });
  assert.equal(api.chromodsUpdateAvailable(state), true);
  assert.equal(api.chromodsUpdateNoticeVisible(state), false);
});

test("release parsing strips the tag prefix and prefers a zip asset", () => {
  const api = loadUpdates();
  const info = api.chromodsReleaseInfo(RELEASE);
  assert.equal(info.latestVersion, "1.6.0");
  assert.equal(info.source, "release");
  assert.equal(info.downloadUrl, "https://example.com/chromods-1.6.0.zip");
  assert.match(info.notes, /Adds an updater/);

  const noAsset = api.chromodsReleaseInfo({ ...RELEASE, assets: [] });
  assert.equal(noAsset.downloadUrl, "https://github.com/T3lluz/ChroMods/archive/refs/tags/v1.6.0.zip");
  assert.equal(api.chromodsReleaseInfo({ tag_name: "nightly" }), null);
});

test("the latest release wins over the branch manifest", async () => {
  const calls = [];
  const api = loadUpdates({
    fetch: async (url) => {
      calls.push(url);
      return jsonResponse(RELEASE);
    },
  });
  const info = await api.chromodsFetchLatestVersion();
  assert.equal(info.latestVersion, "1.6.0");
  assert.equal(calls.length, 1);
  assert.match(calls[0], /api\.github\.com\/repos\/T3lluz\/ChroMods\/releases\/latest/);
});

test("with no releases published, the branch manifest is the fallback", async () => {
  const api = loadUpdates({
    fetch: async (url) => {
      if (url.includes("api.github.com")) return jsonResponse({}, { status: 404 });
      return jsonResponse({ version: "1.7.0" });
    },
  });
  const info = await api.chromodsFetchLatestVersion();
  assert.equal(info.latestVersion, "1.7.0");
  assert.equal(info.source, "branch");
  assert.match(info.downloadUrl, /archive\/refs\/heads\/main\.zip$/);
  assert.match(info.url, /commits\/main$/);
});

test("a rate-limited check reports a readable reason", async () => {
  const api = loadUpdates({
    fetch: async () => jsonResponse({}, { status: 403, headers: { "x-ratelimit-remaining": "0" } }),
  });
  await assert.rejects(api.chromodsFetchLatestVersion(), /rate limit/i);
});

test("a successful check stores state and badges the toolbar icon", async () => {
  const api = loadUpdates({ version: "1.5.0", fetch: async () => jsonResponse(RELEASE) });
  const state = await api.chromodsCheckForUpdate({ force: true });
  assert.equal(state.latestVersion, "1.6.0");
  assert.equal(state.error, null);
  assert.ok(state.checkedAt > 0);
  assert.equal(api.__chrome.__local.chroModsUpdate.latestVersion, "1.6.0");
  assert.equal(api.__chrome.__badge.text, "NEW");
  assert.match(api.__chrome.__badge.title, /1\.6\.0/);
});

test("a failed check keeps the last known version and records the error", async () => {
  const api = loadUpdates({
    version: "1.5.0",
    stored: { chroModsUpdate: { latestVersion: "1.6.0", source: "release", checkedAt: 1 } },
    fetch: async () => {
      throw new Error("offline");
    },
  });
  const state = await api.chromodsCheckForUpdate({ force: true });
  assert.equal(state.latestVersion, "1.6.0");
  assert.match(state.error, /offline/);
  assert.equal(api.__chrome.__badge.text, "NEW");
});

test("an installed update clears the badge on the next service worker wake", async () => {
  const api = loadUpdates({
    version: "1.6.0",
    stored: { chroModsUpdate: { latestVersion: "1.6.0", source: "release", checkedAt: 10 } },
  });
  const state = await api.chromodsRefreshUpdateBadge();
  assert.equal(api.chromodsUpdateAvailable(state), false);
  assert.equal(api.__chrome.__badge.text, "");
});

test("unforced checks are throttled to the configured gap", async () => {
  let calls = 0;
  const api = loadUpdates({
    version: "1.5.0",
    stored: { chroModsUpdate: { latestVersion: "1.5.0", checkedAt: Date.now() } },
    fetch: async () => {
      calls += 1;
      return jsonResponse(RELEASE);
    },
  });
  await api.chromodsCheckForUpdate();
  assert.equal(calls, 0);
  await api.chromodsCheckForUpdate({ force: true });
  assert.equal(calls, 1);
});

test("dismissing pins the current latest version", async () => {
  const api = loadUpdates({
    version: "1.5.0",
    stored: { chroModsUpdate: { latestVersion: "1.6.0", source: "release", checkedAt: 10 } },
  });
  const state = await api.chromodsDismissUpdate();
  assert.equal(state.dismissedVersion, "1.6.0");
  assert.equal(api.__chrome.__badge.text, "");
});

test("update instructions match the installer's default folder", () => {
  const api = loadUpdates();
  assert.match(api.chromodsUpdateCommand("macOS"), /\$HOME\/\.chromods/);
  assert.match(api.chromodsUpdateCommand("Linux"), /\$HOME\/\.chromods/);
  assert.match(api.chromodsUpdateCommand("Windows"), /LOCALAPPDATA\\ChroMods/);

  const shell = fs.readFileSync(path.join(root, "install.sh"), "utf8");
  const powershell = fs.readFileSync(path.join(root, "install.ps1"), "utf8");
  assert.match(shell, /\$HOME\/\.chromods/);
  assert.match(powershell, /LOCALAPPDATA/);
});

test("the update one-liner is the install one-liner", () => {
  const api = loadUpdates();
  const unix = api.chromodsInstallCommand("macOS");
  const windows = api.chromodsInstallCommand("Windows");
  assert.match(unix, /^curl -fsSL https:\/\/raw\.githubusercontent\.com\/T3lluz\/ChroMods\/main\/install\.sh \| bash$/);
  assert.equal(api.chromodsInstallCommand("Linux"), unix);
  assert.match(windows, /^irm https:\/\/.+\/install\.ps1 \| iex$/);

  const shell = fs.readFileSync(path.join(root, "install.sh"), "utf8");
  const powershell = fs.readFileSync(path.join(root, "install.ps1"), "utf8");
  assert.ok(shell.includes(unix), "install.sh no longer documents this command");
  assert.ok(powershell.includes(windows), "install.ps1 no longer documents this command");
});

test("a reload settles the notice for the version it just installed", async () => {
  const installed = loadUpdates({
    version: "1.6.0",
    stored: { chroModsUpdate: { latestVersion: "1.6.0", dismissedVersion: "1.6.0", checkedAt: 10 } },
  });
  const settled = await installed.chromodsSettleInstalledVersion();
  assert.equal(settled.dismissedVersion, null, "a dismissal for an installed version is spent");
  assert.equal(installed.__chrome.__badge.text, "");

  /* A reload that did not bring the new files must keep warning. */
  const stale = loadUpdates({
    version: "1.5.0",
    stored: { chroModsUpdate: { latestVersion: "1.6.0", dismissedVersion: "1.6.0", checkedAt: 10 } },
  });
  const kept = await stale.chromodsSettleInstalledVersion();
  assert.equal(kept.dismissedVersion, "1.6.0");
  assert.equal(stale.__chrome.__badge.text, "");
});

const THEMED_TABS = [
  { id: 1, url: "https://www.youtube.com/watch?v=1" },
  { id: 2, url: "https://example.com/" },
  { id: 3, url: "chrome://extensions/" },
  { id: 4, url: "https://news.example.org/" },
  { id: 5 },
];

function tabMatchers() {
  return {
    matchSiteFromUrl: (url) => (/youtube\.com/.test(url) ? { id: "youtube" } : null),
    chromodsDarkHostFromUrl: (url) => {
      try {
        return new URL(url).hostname;
      } catch {
        return null;
      }
    },
    chromodsIsDarkHostEnabled: (sites, host) => Boolean(sites?.[host]),
  };
}

test("only the tabs ChroMods touches are picked for a refresh", () => {
  const api = loadUpdates(tabMatchers());
  /* Spread because the arrays come back from the sandbox realm. */
  const ids = (...args) => Array.from(api.chromodsThemedTabIds(...args));
  assert.deepEqual(ids(THEMED_TABS, null), [1], "an off-theme tab, a chrome page, and an id-less tab are skipped");
  assert.deepEqual(ids(THEMED_TABS, { "news.example.org": true }), [1, 4], "forced dark mode counts too");
  assert.deepEqual(ids(null, null), []);
});

test("a queued reload refreshes themed tabs once the worker is back", async () => {
  const api = loadUpdates({ ...tabMatchers(), tabs: THEMED_TABS });
  await api.chromodsRequestExtensionReload();
  assert.equal(api.__chrome.__reloaded.extension, 1);
  assert.equal(api.__chrome.__local.chroModsPendingReload.refreshTabs, true);

  assert.equal(await api.chromodsFinishPendingReload(), 1);
  assert.deepEqual(api.__chrome.__reloaded.tabs, [1]);
  assert.equal("chroModsPendingReload" in api.__chrome.__local, false, "the request is consumed once");
});

test("the worker's two entry points cannot refresh the same tabs twice", async () => {
  /* The top level and onInstalled both call this, and a reload fires both. */
  const api = loadUpdates({
    ...tabMatchers(),
    tabs: THEMED_TABS,
    stored: { chroModsPendingReload: { refreshTabs: true, at: Date.now() } },
  });
  const [first, second] = await Promise.all([
    api.chromodsFinishPendingReload(),
    api.chromodsFinishPendingReload(),
  ]);
  assert.equal(first, 1);
  assert.equal(second, 1, "the second caller shares the first result");
  assert.deepEqual(api.__chrome.__reloaded.tabs, [1], "the tab is reloaded exactly once");
});

test("a stale or tab-less reload request refreshes nothing", async () => {
  const stale = loadUpdates({
    ...tabMatchers(),
    tabs: THEMED_TABS,
    stored: { chroModsPendingReload: { refreshTabs: true, at: Date.now() - 10 * 60 * 1000 } },
  });
  assert.equal(await stale.chromodsFinishPendingReload(), 0);
  assert.deepEqual(stale.__chrome.__reloaded.tabs, []);

  const optedOut = loadUpdates({ ...tabMatchers(), tabs: THEMED_TABS });
  await optedOut.chromodsRequestExtensionReload({ refreshTabs: false });
  assert.equal(await optedOut.chromodsFinishPendingReload(), 0);
  assert.deepEqual(optedOut.__chrome.__reloaded.tabs, []);
});

test("release notes render as short plain lines", () => {
  const api = loadUpdates();
  const lines = Array.from(api.chromodsUpdateNoteLines(RELEASE.body));
  assert.deepEqual(lines, ["Adds an updater", "Fixes chat drag"]);
  assert.equal(api.chromodsUpdateNoteLines(null).length, 0);
});

test("relative check times stay human", () => {
  const api = loadUpdates();
  const now = Date.parse("2026-08-21T12:00:00Z");
  assert.equal(api.chromodsUpdateRelativeTime(0, now), "never");
  assert.equal(api.chromodsUpdateRelativeTime(now - 5000, now), "just now");
  assert.equal(api.chromodsUpdateRelativeTime(now - 5 * 60 * 1000, now), "5 min ago");
  assert.equal(api.chromodsUpdateRelativeTime(now - 3 * 60 * 60 * 1000, now), "3 h ago");
  assert.equal(api.chromodsUpdateRelativeTime(now - 2 * 24 * 60 * 60 * 1000, now), "2 d ago");
});
