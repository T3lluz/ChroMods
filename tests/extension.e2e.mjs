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
    const featureCards = await popupPage.locator(".feature-card").count();
    assert.equal(featureCards, 4, "Expected 4 feature cards");

    const title = await popupPage.locator(".app-title").textContent();
    assert.match(title ?? "", /YouTube Theming/);

    const countText = await popupPage.locator("#feature-count").textContent();
    assert.match(countText ?? "", /4 of 4 enabled/);

    // Theater subsettings visible
    const theaterCard = popupPage.locator('.feature-card[data-feature="theater-mode"]');
    const theaterSubs = theaterCard.locator(".subsettings .subsetting-row");
    assert.equal(await theaterSubs.count(), 4, "Expected 4 theater subsettings");

    const commentsBgRow = theaterCard.locator(".subsetting-row").filter({ hasText: "Comments background" });
    assert.equal(await commentsBgRow.locator("select").inputValue(), "glass");

    // Feed layout subsettings visible
    const feedCard = popupPage.locator('.feature-card[data-feature="feed-layout"]');
    const feedSubs = feedCard.locator(".subsettings .subsetting-row");
    assert.equal(await feedSubs.count(), 1, "Expected 1 feed layout subsetting");

    const columnsRow = feedCard.locator(".subsetting-row").filter({ hasText: "Videos per row" });
    assert.equal(await columnsRow.locator("select").inputValue(), "auto");

    const bodyBg = await popupPage.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    assert.ok(bodyBg, "Body should have computed background");

    const colorScheme = await popupPage.evaluate(() => {
      return getComputedStyle(document.documentElement).colorScheme;
    });
    assert.equal(colorScheme, "dark", "Popup should use dark color scheme");

    const bodyBox = await popupPage.locator("body").boundingBox();
    assert.ok(bodyBox, "Popup body should have dimensions");
    assert.ok(bodyBox.width >= 360 && bodyBox.width <= 400, `Unexpected popup width: ${bodyBox.width}`);
    assert.ok(bodyBox.height >= 300, `Popup too short: ${bodyBox.height}`);

    await popupPage.screenshot({
      path: path.join(screenshotDir, "popup-dark-theater-subs.png"),
      fullPage: true,
    });

    // Toggle master off
    await popupPage.locator('label[aria-label="Enable theming"]').click();
    await popupPage.waitForTimeout(250);
    const disabledCount = await popupPage.locator("#feature-count").textContent();
    assert.match(disabledCount ?? "", /All disabled/);

    const hiddenSubs = await theaterCard.locator(".subsettings").count();
    assert.equal(hiddenSubs, 0, "Subsettings should hide when master toggle is off");

    await popupPage.screenshot({
      path: path.join(screenshotDir, "popup-master-disabled.png"),
      fullPage: true,
    });

    // Toggle master back on and disable compact sidebar
    await popupPage.locator('label[aria-label="Enable theming"]').click();
    await popupPage.waitForFunction(() => {
      const input = document.querySelector('input[data-feature="compact-sidebar"]');
      return input && !input.disabled;
    });
    await popupPage
      .locator('.feature-card[data-feature="compact-sidebar"] label.switch')
      .click();
    await popupPage.waitForTimeout(250);
    const partialCount = await popupPage.locator("#feature-count").textContent();
    assert.match(partialCount ?? "", /3 of 4 enabled/);

    // Disable hover comments subsetting
    await theaterCard.locator('label[aria-label="Hover comments"]').click();
    await popupPage.waitForTimeout(250);
    const commentsBgDisabled = commentsBgRow.locator("select");
    assert.ok(await commentsBgDisabled.isDisabled());

    await popupPage.screenshot({
      path: path.join(screenshotDir, "popup-theater-subs-partial.png"),
      fullPage: true,
    });

    results.push({ name: "popup dark UI, toggles, and theater subsettings", status: "pass" });
    await popupPage.close();

    // YouTube content script injection
    const ytPage = await context.newPage();
    await ytPage.goto("https://www.youtube.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await ytPage.waitForTimeout(4000);

    const styleInjected = await ytPage.evaluate(() => {
      const el = document.getElementById("youtube-theming-styles");
      return Boolean(el && el.textContent && el.textContent.length > 500);
    });
    assert.ok(styleInjected, "Content script should inject combined CSS on YouTube");

    const cssContent = await ytPage.evaluate(() => {
      return document.getElementById("youtube-theming-styles")?.textContent ?? "";
    });
    assert.match(cssContent, /Theater base|Immersive search|Compact feed|mini guide/i);
    assert.doesNotMatch(cssContent, /Theater hover comments/i);

    await ytPage.screenshot({
      path: path.join(screenshotDir, "youtube-with-theming.png"),
      fullPage: false,
    });

    results.push({ name: "YouTube CSS injection respects theater subsettings", status: "pass" });

    // Re-enable hover comments via popup and verify CSS updates
    const popupPage2 = await context.newPage();
    await popupPage2.goto(`chrome-extension://${extensionId}/popup/popup.html`);
    await popupPage2
      .locator('.feature-card[data-feature="theater-mode"] label[aria-label="Hover comments"]')
      .click();
    await ytPage.waitForFunction(() => {
      const css = document.getElementById("youtube-theming-styles")?.textContent ?? "";
      return css.includes("Theater hover comments");
    }, { timeout: 10000 });

    const cssWithComments = await ytPage.evaluate(() => {
      return document.getElementById("youtube-theming-styles")?.textContent ?? "";
    });
    assert.match(cssWithComments, /Theater glass comments/i);
    assert.match(cssWithComments, /backdrop-filter:\s*blur\(20px\)/);

    // Switch comments background to solid
    await popupPage2
      .locator('.feature-card[data-feature="theater-mode"] select[data-subsetting="commentsBackground"]')
      .selectOption("solid");
    await ytPage.waitForFunction(() => {
      const css = document.getElementById("youtube-theming-styles")?.textContent ?? "";
      return css.includes("Theater solid comments") && !css.includes("Theater glass comments");
    }, { timeout: 10000 });

    results.push({ name: "Comments background options update live CSS", status: "pass" });

    // Feed column count subsetting
    await popupPage2
      .locator('.feature-card[data-feature="feed-layout"] select[data-subsetting="columns"]')
      .selectOption("5");
    await ytPage.waitForFunction(() => {
      const css = document.getElementById("youtube-theming-styles")?.textContent ?? "";
      return css.includes("--ytd-rich-grid-items-per-row: 5");
    }, { timeout: 10000 });

    results.push({ name: "Feed column count subsetting updates live CSS", status: "pass" });

    // Disable theming clears styles
    await popupPage2.locator('label[aria-label="Enable theming"]').click();
    await ytPage.waitForFunction(() => {
      const el = document.getElementById("youtube-theming-styles");
      return !el || el.textContent.trim().length === 0;
    }, { timeout: 10000 });

    const styleCleared = await ytPage.evaluate(() => {
      const el = document.getElementById("youtube-theming-styles");
      return !el || el.textContent.trim().length === 0;
    });
    assert.ok(styleCleared, "Disabling theming should clear injected CSS");

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
