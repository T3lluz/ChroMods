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

  let serviceWorker = context.serviceWorkers()[0];
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent("serviceworker", { timeout: 30000 });
  }

  const extensionId = getExtensionIdFromUrl(serviceWorker.url());
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

    await popupPage.waitForSelector("#features-list .feature-card", { timeout: 10000 });

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
      await chrome.storage.sync.set({ youtubeThemingSettings: defaults });
    });
    await popupPage.reload({ waitUntil: "networkidle" });
    await popupPage.waitForSelector("#features-list .feature-card", { timeout: 10000 });

    const featureCards = await popupPage.locator(".feature-card").count();
    assert.equal(featureCards, 4, "Expected 4 feature cards");

    const title = await popupPage.locator(".app-title").textContent();
    assert.match(title ?? "", /YouTube Theming/);

    const countText = await popupPage.locator("#feature-count").textContent();
    assert.match(countText ?? "", /4 of 4 enabled/);

    const theaterCard = popupPage.locator('.feature-card[data-feature="theater-mode"]');
    const theaterSubs = theaterCard.locator(".subsettings .subsetting-row");
    assert.equal(await theaterSubs.count(), 3, "Expected 3 theater subsettings");
    assert.equal(await theaterCard.locator(".subsetting-row").filter({ hasText: "Comments background" }).count(), 0);

    const feedCard = popupPage.locator('.feature-card[data-feature="feed-layout"]');
    assert.equal(await feedCard.locator(".subsettings .subsetting-row").count(), 1);

    await popupPage.screenshot({
      path: path.join(screenshotDir, "popup-dark-theater-subs.png"),
      fullPage: true,
    });

    await popupPage.locator('label[aria-label="Enable theming"]').click();
    await popupPage.waitForTimeout(250);
    assert.match(await popupPage.locator("#feature-count").textContent() ?? "", /All disabled/);

    await popupPage.locator('label[aria-label="Enable theming"]').click();
    await popupPage.waitForFunction(() => {
      const input = document.querySelector('input[data-feature="compact-sidebar"]');
      return input && !input.disabled;
    });
    await popupPage.locator('.feature-card[data-feature="compact-sidebar"] label.switch').click();
    assert.match(await popupPage.locator("#feature-count").textContent() ?? "", /3 of 4 enabled/);

    await theaterCard.locator('label[aria-label="Hover comments"]').click();
    await popupPage.waitForTimeout(250);
    assert.ok(await theaterCard.locator('select[data-subsetting="commentsSide"]').isDisabled());

    results.push({ name: "popup UI and theater subsettings", status: "pass" });
    await popupPage.close();

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
      return document.getElementById("youtube-theming-styles")?.textContent ?? "";
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

    await popupPage2
      .locator('.feature-card[data-feature="compact-sidebar"] label.switch')
      .click();
    await ytPage.waitForFunction(() => {
      return Boolean(document.getElementById("youtube-theming-toast"));
    }, { timeout: 10000 });

    results.push({ name: "Toggle shows glow toast on YouTube", status: "pass" });

    await popupPage2.locator('.feature-card[data-feature="theater-mode"] label[aria-label="Hover comments"]').click();

    await ytPage.waitForFunction(() => {
      const css = document.getElementById("youtube-theming-styles")?.textContent ?? "";
      return css.includes("Theater hover comments") && css.includes("#0f0f0f");
    }, { timeout: 10000 });

    assert.doesNotMatch(
      await ytPage.evaluate(() => document.getElementById("youtube-theming-styles")?.textContent ?? ""),
      /Theater glass|backdrop-filter.*ytd-comments/i
    );

    results.push({ name: "Hover comments use solid background only", status: "pass" });

    await popupPage2.locator('.feature-card[data-feature="feed-layout"] select[data-subsetting="columns"]').selectOption("5");
    await ytPage.waitForFunction(() => {
      const css = document.getElementById("youtube-theming-styles")?.textContent ?? "";
      return css.includes("--ytd-rich-grid-items-per-row: 5");
    }, { timeout: 10000 });

    results.push({ name: "Feed column count subsetting updates live CSS", status: "pass" });

    const searchInput = ytPage.locator("yt-searchbox input.ytSearchboxComponentInput, input[name='search_query']").first();
    if (await searchInput.count()) {
      await searchInput.focus();
      await ytPage.waitForTimeout(600);

      const voiceHidden = await ytPage.evaluate(() => {
        const voiceBtn =
          document.querySelector("#voice-search-button") ||
          document.querySelector('button[aria-label="Search with your voice"]') ||
          document.querySelector(".ytSearchboxComponentVoiceSearchButton");
        if (!voiceBtn) return true;
        return getComputedStyle(voiceBtn).display === "none";
      });
      assert.ok(voiceHidden, "Voice search button should be hidden with immersive search");

      await ytPage.screenshot({
        path: path.join(screenshotDir, "youtube-immersive-search-focused.png"),
        fullPage: false,
      });

      results.push({ name: "Immersive search hides voice button on focus", status: "pass" });
    } else {
      results.push({ name: "Immersive search hides voice button on focus", status: "skipped (no search input)" });
    }

    await popupPage2.locator('label[aria-label="Enable theming"]').click();
    await ytPage.waitForFunction(() => {
      const el = document.getElementById("youtube-theming-styles");
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
