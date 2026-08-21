const CHROMODS_UPDATE_REPO = { owner: "T3lluz", repo: "ChroMods", branch: "main" };

const CHROMODS_UPDATE_KEY = "chroModsUpdate";
const CHROMODS_RELOAD_KEY = "chroModsPendingReload";
const CHROMODS_UPDATE_ALARM = "chromods-update-check";
const CHROMODS_UPDATE_INTERVAL_MINUTES = 360;
/* Background alarms drive the badge; popup opens only re-check after this gap. */
const CHROMODS_UPDATE_MIN_GAP_MS = 30 * 60 * 1000;
const CHROMODS_UPDATE_TIMEOUT_MS = 10000;
/* A reload takes a second or two, but the service worker may not start until
   Chromium has an event for it, so allow a slow browser plenty of room. Being
   generous only means the tabs refresh late, which is what was asked for. */
const CHROMODS_RELOAD_MAX_AGE_MS = 5 * 60 * 1000;
const CHROMODS_UPDATE_CHECK = "chromods-update-check";
const CHROMODS_UPDATE_DISMISS = "chromods-update-dismiss";
const CHROMODS_UPDATE_BADGE = "NEW";
const CHROMODS_UPDATE_BADGE_COLOR = "#ff8f6b";
const CHROMODS_EXTENSIONS_URL = "chrome://extensions/";
const CHROMODS_SHORTCUTS_URL = "chrome://extensions/shortcuts";

function chromodsUpdateRepoUrl(...parts) {
  return ["https://github.com", CHROMODS_UPDATE_REPO.owner, CHROMODS_UPDATE_REPO.repo, ...parts].join("/");
}

function chromodsParseVersion(value) {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/^v/i, "");
  const parts = cleaned.split(/[.-]/).map((part) => Number.parseInt(part, 10));
  const numbers = [];
  for (const part of parts) {
    if (!Number.isFinite(part)) break;
    numbers.push(part);
  }
  return numbers;
}

function chromodsCompareVersions(a, b) {
  const left = chromodsParseVersion(a);
  const right = chromodsParseVersion(b);
  if (!left.length || !right.length) return 0;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function chromodsCurrentVersion() {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return "0.0.0";
  }
}

function chromodsUpdateText(value, limit = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, limit);
}

function chromodsNormalizeUpdateState(stored, currentVersion = chromodsCurrentVersion()) {
  const state = stored && typeof stored === "object" ? stored : {};
  const latest = chromodsUpdateText(state.latestVersion, 40);
  return {
    currentVersion: String(currentVersion || "0.0.0"),
    latestVersion: latest || null,
    source: state.source === "release" || state.source === "branch" ? state.source : null,
    name: chromodsUpdateText(state.name, 120) || null,
    notes: chromodsUpdateText(state.notes) || null,
    url: chromodsUpdateText(state.url, 500) || null,
    downloadUrl: chromodsUpdateText(state.downloadUrl, 500) || null,
    publishedAt: chromodsUpdateText(state.publishedAt, 40) || null,
    checkedAt: Number.isFinite(state.checkedAt) ? state.checkedAt : 0,
    error: chromodsUpdateText(state.error, 200) || null,
    dismissedVersion: chromodsUpdateText(state.dismissedVersion, 40) || null,
  };
}

function chromodsUpdateAvailable(state) {
  if (!state?.latestVersion) return false;
  return chromodsCompareVersions(state.latestVersion, state.currentVersion) > 0;
}

function chromodsUpdateNoticeVisible(state) {
  if (!chromodsUpdateAvailable(state)) return false;
  return state.dismissedVersion !== state.latestVersion;
}

function chromodsReleaseZipAsset(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const zip = assets.find((asset) => String(asset?.name || "").toLowerCase().endsWith(".zip"));
  return chromodsUpdateText(zip?.browser_download_url, 500) || null;
}

function chromodsReleaseInfo(release) {
  const tag = chromodsUpdateText(release?.tag_name, 40);
  const version = tag.replace(/^v/i, "");
  if (!chromodsParseVersion(version).length) return null;

  return {
    latestVersion: version,
    source: "release",
    name: chromodsUpdateText(release?.name, 120) || `v${version}`,
    notes: chromodsUpdateText(release?.body),
    url: chromodsUpdateText(release?.html_url, 500) || chromodsUpdateRepoUrl("releases", "latest"),
    downloadUrl:
      chromodsReleaseZipAsset(release) ||
      chromodsUpdateRepoUrl("archive", "refs", "tags", encodeURIComponent(tag) + ".zip"),
    publishedAt: chromodsUpdateText(release?.published_at, 40) || null,
  };
}

function chromodsBranchInfo(manifest) {
  const version = chromodsUpdateText(manifest?.version, 40);
  if (!chromodsParseVersion(version).length) return null;
  const branch = CHROMODS_UPDATE_REPO.branch;

  return {
    latestVersion: version,
    source: "branch",
    name: `v${version} on ${branch}`,
    notes: "",
    url: chromodsUpdateRepoUrl("commits", branch),
    downloadUrl: chromodsUpdateRepoUrl("archive", "refs", "heads", `${branch}.zip`),
    publishedAt: null,
  };
}

function chromodsUpdateHttpError(response) {
  const status = Number(response?.status) || 0;
  const remaining = response?.headers?.get?.("x-ratelimit-remaining");
  if (status === 403 && remaining === "0") return "GitHub rate limit reached — try again later";
  if (status === 404) return "Repository not found";
  return `GitHub returned ${status || "an error"}`;
}

/* A stalled request would otherwise hold the in-flight lock until the service
   worker is torn down, leaving the popup stuck on "Checking…". */
function chromodsUpdateAbortSignal() {
  try {
    return AbortSignal.timeout(CHROMODS_UPDATE_TIMEOUT_MS);
  } catch {
    return undefined;
  }
}

async function chromodsFetchLatestRelease(fetchImpl) {
  const request = fetchImpl || fetch;
  const response = await request(
    `https://api.github.com/repos/${CHROMODS_UPDATE_REPO.owner}/${CHROMODS_UPDATE_REPO.repo}/releases/latest`,
    {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
      signal: chromodsUpdateAbortSignal(),
    }
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(chromodsUpdateHttpError(response));
  return chromodsReleaseInfo(await response.json());
}

async function chromodsFetchBranchManifest(fetchImpl) {
  const request = fetchImpl || fetch;
  const url = `https://raw.githubusercontent.com/${CHROMODS_UPDATE_REPO.owner}/${CHROMODS_UPDATE_REPO.repo}/${CHROMODS_UPDATE_REPO.branch}/manifest.json`;
  const response = await request(`${url}?t=${Date.now()}`, {
    cache: "no-store",
    signal: chromodsUpdateAbortSignal(),
  });
  if (!response.ok) throw new Error(chromodsUpdateHttpError(response));
  return chromodsBranchInfo(await response.json());
}

/* Releases are the source of truth; before the first release, the manifest on
   the default branch still tells us whether the checkout is behind. */
async function chromodsFetchLatestVersion(fetchImpl) {
  const release = await chromodsFetchLatestRelease(fetchImpl);
  if (release) return release;
  const branch = await chromodsFetchBranchManifest(fetchImpl);
  if (branch) return branch;
  throw new Error("No published version found");
}

async function chromodsGetUpdateState() {
  const stored = await chrome.storage.local.get(CHROMODS_UPDATE_KEY);
  return chromodsNormalizeUpdateState(stored?.[CHROMODS_UPDATE_KEY]);
}

async function chromodsSetUpdateState(next) {
  const state = chromodsNormalizeUpdateState(next);
  await chrome.storage.local.set({ [CHROMODS_UPDATE_KEY]: state });
  return state;
}

async function chromodsApplyUpdateBadge(state) {
  const action = chrome.action;
  if (!action?.setBadgeText) return;
  const show = chromodsUpdateNoticeVisible(state);
  try {
    await action.setBadgeText({ text: show ? CHROMODS_UPDATE_BADGE : "" });
    if (show && action.setBadgeBackgroundColor) {
      await action.setBadgeBackgroundColor({ color: CHROMODS_UPDATE_BADGE_COLOR });
    }
    if (action.setTitle) {
      await action.setTitle({
        title: show ? `ChroMods — v${state.latestVersion} available` : "ChroMods",
      });
    }
  } catch {
    /* badge is cosmetic */
  }
}

let chromodsUpdateCheckInFlight = null;

async function chromodsRunUpdateCheck({ force = false, fetchImpl } = {}) {
  const previous = await chromodsGetUpdateState();
  if (!force && previous.checkedAt && Date.now() - previous.checkedAt < CHROMODS_UPDATE_MIN_GAP_MS) {
    await chromodsApplyUpdateBadge(previous);
    return previous;
  }

  let next;
  try {
    const latest = await chromodsFetchLatestVersion(fetchImpl);
    next = {
      ...previous,
      ...latest,
      currentVersion: chromodsCurrentVersion(),
      checkedAt: Date.now(),
      error: null,
    };
  } catch (error) {
    next = {
      ...previous,
      currentVersion: chromodsCurrentVersion(),
      checkedAt: Date.now(),
      error: String(error?.message || error || "Check failed"),
    };
  }

  const state = await chromodsSetUpdateState(next);
  await chromodsApplyUpdateBadge(state);
  return state;
}

function chromodsCheckForUpdate(options = {}) {
  if (chromodsUpdateCheckInFlight) return chromodsUpdateCheckInFlight;
  chromodsUpdateCheckInFlight = chromodsRunUpdateCheck(options).finally(() => {
    chromodsUpdateCheckInFlight = null;
  });
  return chromodsUpdateCheckInFlight;
}

async function chromodsDismissUpdate() {
  const state = await chromodsGetUpdateState();
  const next = await chromodsSetUpdateState({ ...state, dismissedVersion: state.latestVersion });
  await chromodsApplyUpdateBadge(next);
  return next;
}

/* Called on every service-worker wake so a freshly reloaded, up-to-date
   install drops the badge without waiting for the next network check. */
async function chromodsRefreshUpdateBadge() {
  const state = await chromodsGetUpdateState();
  await chromodsApplyUpdateBadge(state);
  return state;
}

/* Reloading an unpacked extension re-reads it from disk, so the version the
   popup was warning about is now the version that is running. */
async function chromodsSettleInstalledVersion() {
  const state = await chromodsGetUpdateState();
  if (!state.latestVersion) return chromodsApplyUpdateBadge(state).then(() => state);
  if (chromodsUpdateAvailable(state)) {
    await chromodsApplyUpdateBadge(state);
    return state;
  }
  const next = await chromodsSetUpdateState({ ...state, dismissedVersion: null });
  await chromodsApplyUpdateBadge(next);
  return next;
}

/* Content scripts in open tabs keep running the code from before the reload,
   so every tab ChroMods touches has to be reloaded as well. Whether a tab is
   themed depends on sites.js and dark-sites.js, which the service worker and
   the popup both load alongside this file. */
function chromodsThemedTab(tab, darkSites) {
  const url = String(tab?.url || "");
  if (!/^https?:\/\//i.test(url)) return false;
  if (typeof matchSiteFromUrl === "function" && matchSiteFromUrl(url)) return true;
  if (typeof chromodsDarkHostFromUrl !== "function") return false;
  if (typeof chromodsIsDarkHostEnabled !== "function") return false;
  const host = chromodsDarkHostFromUrl(url);
  return Boolean(host) && chromodsIsDarkHostEnabled(darkSites, host);
}

function chromodsThemedTabIds(tabs, darkSites) {
  return (Array.isArray(tabs) ? tabs : [])
    .filter((tab) => Number.isFinite(tab?.id) && chromodsThemedTab(tab, darkSites))
    .map((tab) => tab.id);
}

async function chromodsRefreshThemedTabs() {
  if (!chrome.tabs?.query) return 0;
  let darkSites = null;
  if (typeof chromodsGetDarkSites === "function") {
    darkSites = await chromodsGetDarkSites().catch(() => null);
  }
  const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }).catch(() => []);
  const ids = chromodsThemedTabIds(tabs, darkSites);
  await Promise.all(ids.map((id) => chrome.tabs.reload(id).catch(() => {})));
  return ids.length;
}

/* The popup cannot outlive chrome.runtime.reload(), so the intent to refresh
   tabs is parked in storage and picked up when the worker comes back. */
async function chromodsRequestExtensionReload({ refreshTabs = true } = {}) {
  await chrome.storage.local.set({
    [CHROMODS_RELOAD_KEY]: { refreshTabs: Boolean(refreshTabs), at: Date.now() },
  });
  chrome.runtime.reload();
}

async function chromodsRunPendingReload() {
  const stored = await chrome.storage.local.get(CHROMODS_RELOAD_KEY).catch(() => null);
  const pending = stored?.[CHROMODS_RELOAD_KEY];
  if (!pending) return 0;
  await chrome.storage.local.remove(CHROMODS_RELOAD_KEY).catch(() => {});
  const age = Date.now() - (Number(pending.at) || 0);
  if (!pending.refreshTabs || age < 0 || age > CHROMODS_RELOAD_MAX_AGE_MS) return 0;
  return chromodsRefreshThemedTabs();
}

let chromodsPendingReloadRun = null;

/* Called from both the worker's top level and onInstalled, because a reload is
   documented to fire onInstalled but the worker may also just start. A request
   is only ever meaningful once per worker instance, so the first caller wins
   and the other gets the same promise instead of reloading the tabs twice. */
function chromodsFinishPendingReload() {
  if (!chromodsPendingReloadRun) chromodsPendingReloadRun = chromodsRunPendingReload();
  return chromodsPendingReloadRun;
}

function chromodsUpdateRelativeTime(timestamp, now = Date.now()) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "never";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/* Release bodies are markdown; the popup shows them as a plain bullet list. */
function chromodsUpdateNoteLines(notes, limit = 6) {
  return chromodsUpdateText(notes)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.replace(/^[-*]\s+/, "").replaceAll("**", "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function chromodsWindowsPlatform(platform = "") {
  return String(platform || "").toLowerCase().includes("win");
}

/* Re-running the installer is the same command as installing: it refreshes the
   folder whether the user cloned it or unpacked a ZIP. */
function chromodsInstallCommand(platform = "") {
  const base = `https://raw.githubusercontent.com/${CHROMODS_UPDATE_REPO.owner}/${CHROMODS_UPDATE_REPO.repo}/${CHROMODS_UPDATE_REPO.branch}`;
  if (chromodsWindowsPlatform(platform)) return `irm ${base}/install.ps1 | iex`;
  return `curl -fsSL ${base}/install.sh | bash`;
}

/* Unpacked installs live wherever the user cloned them; install.sh and
   install.ps1 default to these paths, so the popup can show a real command. */
function chromodsUpdateCommand(platform = "") {
  if (chromodsWindowsPlatform(platform)) return 'git -C "$env:LOCALAPPDATA\\ChroMods" pull';
  return 'git -C "$HOME/.chromods" pull';
}
