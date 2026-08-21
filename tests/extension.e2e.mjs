import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, "..");
const screenshotDir = path.join(extensionPath, "tests", "screenshots");

fs.mkdirSync(screenshotDir, { recursive: true });

function getExtensionIdFromUrl(url) {
  const match = url.match(/chrome-extension:\/\/([a-p]{32})/);
  return match?.[1] ?? null;
}

async function expandAllSitePanels(page) {
  const chips = page.locator(".site-chip");
  const count = await chips.count();
  for (let i = 0; i < count; i++) {
    await chips.nth(i).click();
  }
  await page.waitForSelector(".feature-card", { timeout: 10000 });
}

function getExtensionIdFromPreferences(userDataDir) {
  const preferencesPath = path.join(userDataDir, "Default", "Preferences");
  if (!fs.existsSync(preferencesPath)) return null;

  try {
    const preferences = JSON.parse(fs.readFileSync(preferencesPath, "utf8"));
    const settings = preferences.extensions?.settings || {};
    for (const [id, extension] of Object.entries(settings)) {
      if (!extension.path) continue;
      if (path.resolve(extension.path) === extensionPath) return id;
    }
  } catch {
    return null;
  }
  return null;
}

async function launchWithExtension() {
  const userDataDir = path.join(extensionPath, "tests", ".pw-profile");
  fs.mkdirSync(userDataDir, { recursive: true });

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  const deadline = Date.now() + 30000;
  let extensionId = null;
  while (!extensionId && Date.now() < deadline) {
    extensionId =
      getExtensionIdFromUrl(context.serviceWorkers()[0]?.url() ?? "") ||
      getExtensionIdFromPreferences(userDataDir);
    if (!extensionId) await new Promise((resolve) => setTimeout(resolve, 100));
  }

  assert.ok(extensionId, "Could not resolve extension id");

  return { context, extensionId };
}

async function run() {
  const results = [];
  const { context, extensionId } = await launchWithExtension();

  try {
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`, {
      waitUntil: "networkidle",
    });

    await popupPage.waitForSelector(".site-panel-other", { timeout: 10000 });
    assert.equal(
      await popupPage.locator(".site-accordion-toggle[aria-expanded='true']").count(),
      0,
      "Site dropdowns should start closed on an unsupported tab"
    );
    await expandAllSitePanels(popupPage);

    await popupPage.evaluate(async () => {
      const defaults = {
        enabled: true,
        features: {
          "immersive-search": true,
          "theater-mode": true,
          "feed-layout": true,
          "compact-sidebar": true,
        },
        subsettings: {
          theater: {
            hideHeader: true,
            hoverComments: true,
            commentsSide: "left",
          },
          feed: { columns: "auto" },
        },
      };
      await chrome.storage.sync.set({ chroModsSettings: defaults });
    });
    await popupPage.reload({ waitUntil: "networkidle" });
    await popupPage.waitForSelector(".site-panel-other", { timeout: 10000 });
    await expandAllSitePanels(popupPage);

    const featureCards = await popupPage.locator(".feature-card").count();
    assert.equal(featureCards, 69, "Expected every non-transparency mod across all sites");

    const title = await popupPage.locator(".app-title").textContent();
    assert.match(title ?? "", /ChroMods/);
    assert.equal(await popupPage.locator(".site-chip").count(), 9, "Expected a chip for every supported site");
    assert.match(await popupPage.locator("#other-sites-title").textContent() ?? "", /Sites/);
    assert.equal(await popupPage.locator('.feature-card[data-feature="gh-no-tab-text"]').count(), 1);
    assert.equal(await popupPage.locator('.feature-card[data-feature="gh-glass-effect"]').count(), 1);
    assert.equal(await popupPage.locator('.feature-card[data-feature="g-search-zoom"]').count(), 1);
    assert.equal(await popupPage.locator('.feature-card[data-feature="ddg-immersive-search"]').count(), 1);
    assert.equal(await popupPage.locator('.feature-card[data-feature="ddg-immersive-popup"]').count(), 1);
    assert.equal(await popupPage.locator('.feature-card[data-feature="gh-transparency"]').count(), 0);
    assert.equal(await popupPage.locator('.feature-card[data-feature="g-transparency"]').count(), 0);
    assert.equal(await popupPage.locator('.feature-card[data-feature="ddg-transparency"]').count(), 0);

    await popupPage.locator("#settings-open").click();
    await popupPage.waitForFunction(() => document.getElementById("shell")?.classList.contains("is-settings-open"));
    assert.equal(await popupPage.locator("#shortcut-list .shortcut-row").count(), 2, "Expected two shortcut rows");
    assert.equal(await popupPage.locator("[data-dark-slider]").count(), 4, "Expected Dark Reader sliders");
    assert.equal(await popupPage.locator(".dark-slider-icon").count(), 4, "Expected an icon on each dark slider");
    assert.equal(await popupPage.locator("#dark-skip-native").count(), 1);

    // Updates: wait for the check the panel kicks off, then pin a known result
    // so the assertions don't depend on what GitHub currently publishes.
    //
    // Clicking Reload ChroMods is deliberately not covered here:
    // chrome.runtime.reload() permanently kills an extension loaded through
    // --load-extension, which is how Playwright loads one. Verified with a
    // two-file control extension, so it is the harness, not the extension.
    // The pieces are unit-tested in tests/updates.test.js instead.
    await popupPage.waitForFunction(() => !document.getElementById("update-check")?.disabled, null, {
      timeout: 20000,
    });
    assert.equal(await popupPage.locator("#update-details").isHidden(), true);
    // Reloading is worth doing with or without a pending update, so those
    // controls stay visible while the two-step instructions are hidden.
    assert.equal(await popupPage.locator("#update-reload").isVisible(), true);
    assert.equal(await popupPage.locator("#update-extensions").isVisible(), true);
    assert.equal(await popupPage.locator("#update-dismiss").isHidden(), true);
    await popupPage.evaluate(async () => {
      await chrome.storage.local.set({
        chroModsUpdate: {
          currentVersion: "0.0.1",
          latestVersion: "99.9.9",
          source: "release",
          notes: "## Highlights\n- Pretend release\n",
          url: "https://github.com/T3lluz/ChroMods/releases/tag/v99.9.9",
          downloadUrl: "https://github.com/T3lluz/ChroMods/releases/download/v99.9.9/chromods-99.9.9.zip",
          checkedAt: Date.now(),
          error: null,
          dismissedVersion: null,
        },
      });
    });
    await popupPage.waitForFunction(() => !document.getElementById("update-details")?.hidden, null, {
      timeout: 5000,
    });
    assert.match(await popupPage.locator("#update-headline").textContent() ?? "", /v99\.9\.9/);
    assert.deepEqual(await popupPage.locator("#update-notes li").allTextContents(), ["Pretend release"]);
    assert.match(
      (await popupPage.locator("#update-command-text").textContent()) ?? "",
      /install\.(sh|ps1)/,
      "the update command should be the installer one-liner"
    );
    assert.match(await popupPage.locator("#update-git-command").textContent() ?? "", /git -C .+ pull/);
    assert.equal(await popupPage.locator("#update-apply").isVisible(), true, "unpacked installs should offer Apply update");
    assert.match(await popupPage.locator("#update-apply").textContent() ?? "", /99\.9\.9/);
    assert.equal(await popupPage.locator(".version-pill.has-update").count(), 1);
    const updateBadge = await popupPage.evaluate(async () => {
      await chrome.runtime.sendMessage({ type: "chromods-update-check", force: false });
      return chrome.action.getBadgeText({});
    });
    assert.equal(updateBadge, "NEW", "toolbar icon should badge a pending update");
    await popupPage.locator("#update-dismiss").click();
    await popupPage.waitForFunction(() => document.getElementById("update-details")?.hidden, null, {
      timeout: 5000,
    });
    assert.equal(await popupPage.evaluate(() => chrome.action.getBadgeText({})), "");
    await popupPage.evaluate(() => chrome.storage.local.remove("chroModsUpdate"));

    await popupPage.locator("#settings-back").click();
    await popupPage.waitForFunction(() => !document.getElementById("shell")?.classList.contains("is-settings-open"));

    await popupPage.locator("#mod-search").fill("glass");
    await popupPage.waitForSelector(".search-result");
    await popupPage.waitForFunction(() => document.getElementById("shell")?.classList.contains("is-search-focused"));
    const searchHits = await popupPage.locator(".search-result-title").allTextContents();
    assert.ok(
      searchHits.some((text) => /glass/i.test(text)),
      `Expected glass mods in live search, got ${JSON.stringify(searchHits)}`
    );
    await popupPage.locator("#mod-search").fill("");
    await popupPage.locator("#mod-search").blur();
    await popupPage.waitForFunction(() => !document.getElementById("shell")?.classList.contains("is-search-focused"));

    const countText = await popupPage.locator("#feature-count").textContent();
    assert.match(countText ?? "", /6\/15/);

    const theaterCard = popupPage.locator('.feature-card[data-feature="theater-mode"]');
    const theaterSubs = theaterCard.locator(".subsettings .subsetting-row");
    assert.equal(await theaterSubs.count(), 4, "Expected 4 theater subsettings");
    assert.equal(await theaterCard.locator(".subsetting-row").filter({ hasText: "Comments background" }).count(), 0);

    const feedCard = popupPage.locator('.feature-card[data-feature="feed-layout"]');
    assert.equal(await feedCard.locator(".subsettings .subsetting-row").count(), 1);

    await popupPage.screenshot({
      path: path.join(screenshotDir, "popup-dark-theater-subs.png"),
      fullPage: true,
    });

    await popupPage.locator('label[aria-label="Enable YouTube"]').click();
    await popupPage.waitForTimeout(250);
    assert.match(await popupPage.locator("#feature-count").textContent() ?? "", /All disabled/);

    await popupPage.locator('label[aria-label="Enable YouTube"]').click();
    await popupPage.waitForFunction(() => {
      const input = document.querySelector('input[data-feature="compact-sidebar"]');
      return input && !input.disabled;
    });
    await popupPage.locator('.feature-card[data-feature="compact-sidebar"] label.switch').click();
    assert.match(await popupPage.locator("#feature-count").textContent() ?? "", /5\/15/);

    await theaterCard.locator('label[aria-label="Hover comments"]').click();
    await popupPage.waitForTimeout(250);
    assert.ok(await theaterCard.locator('select[data-subsetting="commentsSide"]').isDisabled());

    results.push({ name: "popup UI and theater subsettings", status: "pass" });
    await popupPage.close();

    const theaterFixture = await context.newPage();
    await theaterFixture.setContent(`
      <style>
        html, body { margin: 0; width: 100%; }
        ytd-app, #page-manager, ytd-watch-flexy, #player-full-bleed-container,
        #full-bleed-container, #movie_player { display: block; width: 100%; }
        #page-manager { margin-left: 80px; }
        #full-bleed-container { height: 360px; position: relative; }
        #movie_player { height: 100%; }
        .ytp-chrome-bottom { position: absolute; right: auto; height: 40px; }
      </style>
      <ytd-app>
        <div id="page-manager">
          <ytd-watch-flexy theater>
            <div id="player-full-bleed-container">
              <div id="full-bleed-container">
                <div id="movie_player" class="html5-video-player">
                  <div class="ytp-chrome-bottom"></div>
                </div>
              </div>
            </div>
          </ytd-watch-flexy>
        </div>
      </ytd-app>
    `);
    await theaterFixture.addStyleTag({
      path: path.join(extensionPath, "styles", "youtube", "theater-base.css"),
    });

    const theaterBounds = await theaterFixture.evaluate(() => {
      const pageManager = document.querySelector("#page-manager");
      const fullBleed = document.querySelector("#full-bleed-container");
      const pageManagerStyle = getComputedStyle(pageManager);
      const fullBleedStyle = getComputedStyle(fullBleed);
      return {
        pageManagerMarginLeft: pageManagerStyle.marginLeft,
        fullBleedHeight: fullBleedStyle.height,
        fullBleedTop: fullBleedStyle.top,
        toolbarHeight: getComputedStyle(document.querySelector("ytd-app"))
          .getPropertyValue("--ytd-toolbar-height")
          .trim(),
      };
    });
    assert.equal(theaterBounds.pageManagerMarginLeft, "0px", "Theater should clear sidebar margin");
    // 100dvh resolves to a fractional used value on fractional-DPI displays,
    // so compare within a pixel rather than as a string.
    const viewportHeight = theaterFixture.viewportSize().height;
    assert.ok(
      Math.abs(Number.parseFloat(theaterBounds.fullBleedHeight) - viewportHeight) < 1,
      `Theater player should fill the viewport, got ${theaterBounds.fullBleedHeight} for ${viewportHeight}px`
    );
    assert.equal(theaterBounds.fullBleedTop, "0px");
    assert.equal(theaterBounds.toolbarHeight, "0px");

    const exitBounds = await theaterFixture.evaluate(() => {
      document.querySelector("ytd-watch-flexy").removeAttribute("theater");
      const player = document.querySelector("#movie_player").getBoundingClientRect();
      const controls = document.querySelector(".ytp-chrome-bottom").getBoundingClientRect();
      return { playerRight: player.right, controlsRight: controls.right };
    });
    assert.ok(
      exitBounds.controlsRight <= exitBounds.playerRight + 1,
      `Controls should remain inside player after theater exit: ${JSON.stringify(exitBounds)}`
    );
    results.push({ name: "Theater zen layout clears margin and fills height", status: "pass" });
    await theaterFixture.close();

    const ytPage = await context.newPage();
    await ytPage.goto("https://www.youtube.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await ytPage.waitForTimeout(4000);

    await ytPage.evaluate(() => {
      const buttons = [...document.querySelectorAll("button, tp-yt-paper-button")];
      const accept = buttons.find((btn) => /accept all/i.test(btn.textContent?.trim() ?? ""));
      accept?.click();
    });
    await ytPage.waitForTimeout(500);

    const cssContent = await ytPage.evaluate(() => {
      return document.getElementById("chromods-styles")?.textContent ?? "";
    });
    assert.ok(cssContent.length > 500, "Content script should inject combined CSS on YouTube");
    assert.match(cssContent, /Immersive search|Compact feed|mini guide/i);
    assert.match(cssContent, /#voice-search-button/);
    assert.match(cssContent, /#content:has\(\.ytSearchboxComponentInputBoxHasFocus\) #page-manager/);
    assert.match(cssContent, /filter:\s*blur\(20px\)/);
    assert.doesNotMatch(cssContent, /Theater hover comments/i);

    results.push({ name: "YouTube CSS injection includes immersive search fixes", status: "pass" });

    const popupPage2 = await context.newPage();
    await popupPage2.goto(`chrome-extension://${extensionId}/popup/popup.html`);
    await expandAllSitePanels(popupPage2);

    await popupPage2
      .locator('.feature-card[data-feature="compact-sidebar"] label.switch')
      .click();
    await ytPage.waitForFunction(() => {
      const css = document.getElementById("chromods-styles")?.textContent ?? "";
      return /mini guide/i.test(css);
    }, { timeout: 10000 });
    await ytPage.waitForTimeout(300);
    assert.equal(
      await ytPage.locator("#chromods-toast, #youtube-theming-toast").count(),
      0,
      "Toggles should not inject page notifications"
    );

    results.push({ name: "Toggle updates cleanly without page toast", status: "pass" });

    await popupPage2.locator('.feature-card[data-feature="theater-mode"] label[aria-label="Hover comments"]').click();

    await ytPage.waitForFunction(() => {
      const css = document.getElementById("chromods-styles")?.textContent ?? "";
      return css.includes("Theater hover comments") && css.includes("#0f0f0f");
    }, { timeout: 10000 });

    assert.doesNotMatch(
      await ytPage.evaluate(() => document.getElementById("chromods-styles")?.textContent ?? ""),
      /Theater glass|backdrop-filter.*ytd-comments/i
    );

    results.push({ name: "Hover comments use solid background only", status: "pass" });

    await popupPage2.locator('.feature-card[data-feature="feed-layout"] select[data-subsetting="columns"]').selectOption("5");
    await ytPage.waitForFunction(() => {
      const css = document.getElementById("chromods-styles")?.textContent ?? "";
      return /repeat\(5/.test(css);
    }, { timeout: 10000 });

    results.push({ name: "Feed column count subsetting updates live CSS", status: "pass" });

    const searchInput = ytPage.locator("yt-searchbox input.ytSearchboxComponentInput, input[name='search_query']").first();
    if (await searchInput.count()) {
      await searchInput.focus();
      await searchInput.fill("jack");
      await ytPage.waitForTimeout(800);

      const voiceHidden = await ytPage.evaluate(() => {
        const voiceBtn =
          document.querySelector("#voice-search-button") ||
          document.querySelector('button[aria-label="Search with your voice"]') ||
          document.querySelector(".ytSearchboxComponentVoiceSearchButton");
        if (!voiceBtn) return true;
        return getComputedStyle(voiceBtn).display === "none";
      });
      assert.ok(voiceHidden, "Voice search button should be hidden with immersive search");

      const suggestionsLayout = await ytPage.evaluate(() => {
        const sb = document.querySelector("yt-searchbox:has(.ytSearchboxComponentInputBoxHasFocus)");
        const inputWrap = sb?.querySelector(".ytSearchboxComponentInputWrapper");
        const suggestions = sb?.querySelector("#i0, .ytSearchboxComponentSuggestionsContainer");
        if (!sb || !inputWrap || !suggestions) return { ok: false, reason: "missing nodes" };
        const sbStyle = getComputedStyle(sb);
        const suggStyle = getComputedStyle(suggestions);
        const inputRect = inputWrap.getBoundingClientRect();
        const suggRect = suggestions.getBoundingClientRect();
        const sbRect = sb.getBoundingClientRect();
        return {
          ok:
            sbStyle.height === "40px" &&
            suggStyle.position === "absolute" &&
            suggRect.top >= inputRect.bottom - 2 &&
            Math.abs(suggRect.left - sbRect.left) < 24 &&
            sbRect.top > 0 &&
            sbRect.top < window.innerHeight * 0.45,
          sbHeight: sbStyle.height,
          sbTop: sbRect.top,
          suggPosition: suggStyle.position,
          inputBottom: inputRect.bottom,
          suggTop: suggRect.top,
          leftDelta: Math.abs(suggRect.left - sbRect.left),
        };
      });
      assert.ok(suggestionsLayout.ok, `Suggestions should sit below search bar: ${JSON.stringify(suggestionsLayout)}`);

      await ytPage.screenshot({
        path: path.join(screenshotDir, "youtube-immersive-search-focused.png"),
        fullPage: false,
      });

      results.push({ name: "Immersive search hides voice button on focus", status: "pass" });
    } else {
      results.push({ name: "Immersive search hides voice button on focus", status: "skipped (no search input)" });
    }

    await popupPage2.locator('label[aria-label="Enable YouTube"]').click();
    await ytPage.waitForFunction(() => {
      const el = document.getElementById("chromods-styles");
      return !el || el.textContent.trim().length === 0;
    }, { timeout: 10000 });

    results.push({ name: "Disable theming clears styles", status: "pass" });
    await popupPage2.close();
    await ytPage.close();
  } finally {
    await context.close();
  }

  console.log("\nPlaywright E2E results:");
  for (const result of results) {
    console.log(`  ✓ ${result.name}`);
  }
  console.log(`\nScreenshots saved to ${screenshotDir}`);
}

run().catch((error) => {
  console.error("\nPlaywright E2E failed:\n", error);
  process.exit(1);
});
