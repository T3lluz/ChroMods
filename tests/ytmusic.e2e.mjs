/* Docks the YouTube Music queue in a real Chromium with ChroMods loaded. The
   page is a local fixture served for a music.youtube.com URL, so it runs
   offline and needs no account, but it keeps the parts of the real layout the
   mod fights with: a player page parked below the viewport, hidden with an
   inline style, holding the queue.

   Run with: npm run test:ytmusic (needs `npx playwright install chromium`). */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, "..");
const userDataDir = path.join(__dirname, ".pw-profile-ytmusic");
const screenshotDir = path.join(__dirname, "screenshots");

fs.rmSync(userDataDir, { recursive: true, force: true });
fs.mkdirSync(screenshotDir, { recursive: true });

const NAV_HEIGHT = 64;
const PLAYER_BAR_HEIGHT = 72;

const QUEUE_ITEMS = Array.from(
  { length: 20 },
  (_, index) => `<ytmusic-player-queue-item>Track ${index + 1}</ytmusic-player-queue-item>`
).join("");

/* Mirrors the live layout: #player-page is fixed under the nav bar, shifted a
   viewport down, and hidden with an inline style while you browse. */
const MUSIC_FIXTURE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>ChroMods YouTube Music fixture</title>
<style>
  html, body { margin: 0; background: #030303; color: #fff; font: 14px system-ui; }
  ytmusic-app-layout { display: block; --ytmusic-nav-bar-height: ${NAV_HEIGHT}px; --ytmusic-player-bar-height: ${PLAYER_BAR_HEIGHT}px; --ytmusic-guide-width: 240px; }
  ytmusic-nav-bar { position: fixed; inset: 0 0 auto 0; height: ${NAV_HEIGHT}px; background: #030303; z-index: 5; display: block; }
  ytmusic-player-bar { position: fixed; inset: auto 0 0 0; height: ${PLAYER_BAR_HEIGHT}px; background: #212121; z-index: 4; display: block; }
  #content { display: block; position: relative; margin: ${NAV_HEIGHT}px 0 0 240px; padding: 0 0 ${PLAYER_BAR_HEIGHT}px; }
  ytmusic-browse-response { display: block; height: 1200px; background: linear-gradient(#1a1a1a, #101010); }
  #player-page {
    display: block; position: fixed; top: ${NAV_HEIGHT}px; bottom: 0; left: 240px; right: 0;
    background: #030303; z-index: 2; transform: translateY(100vh);
  }
  #player-page .content { display: flex; height: 100%; padding: 24px; box-sizing: border-box; }
  #main-panel { display: flex; flex: 1 1 auto; background: #151515; }
  #side-panel { display: flex; flex-direction: column; width: 392px; min-width: 392px; margin-left: 56px; }
  #side-panel tp-yt-paper-tabs { display: block; height: 48px; background: #030303; }
  #tab-renderer { display: block; flex: 1 1 auto; }
  ytmusic-player-queue { display: block; }
  ytmusic-player-queue-item { display: block; height: 56px; border-bottom: 1px solid #222; }
</style></head>
<body>
  <ytmusic-app-layout id="layout" player-visible player-ui-state="MINIPLAYER">
    <ytmusic-nav-bar></ytmusic-nav-bar>
    <div id="content"><ytmusic-browse-response id="browse-page">Browse</ytmusic-browse-response></div>
    <ytmusic-player-page id="player-page" style="visibility: hidden;">
      <div class="content">
        <div id="main-panel">Album art</div>
        <div id="side-panel" class="side-panel">
          <tp-yt-paper-tabs>Up next</tp-yt-paper-tabs>
          <ytmusic-tab-renderer id="tab-renderer">
            <ytmusic-player-queue id="queue"><div id="contents" class="ytmusic-player-queue">${QUEUE_ITEMS}</div></ytmusic-player-queue>
          </ytmusic-tab-renderer>
        </div>
      </div>
    </ytmusic-player-page>
    <ytmusic-player-bar></ytmusic-player-bar>
  </ytmusic-app-layout>
  <script>
    /* The real app flips these two together when you open or leave the player. */
    window.__setPlayerPageOpen = (open) => {
      const layout = document.getElementById("layout");
      const page = document.getElementById("player-page");
      layout.toggleAttribute("player-page-open", open);
      layout.setAttribute("player-ui-state", open ? "PLAYER_PAGE_OPEN" : "MINIPLAYER");
      page.style.visibility = open ? "visible" : "hidden";
      if (open) page.style.transform = "none";
      else page.style.removeProperty("transform");
    };
    window.__measure = () => {
      const box = (selector) => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
        };
      };
      const rail = document.getElementById("player-page");
      const tab = document.getElementById("tab-renderer");
      const items = document.querySelectorAll("ytmusic-player-queue-item");
      const last = items[items.length - 1];
      return {
        railVisibility: getComputedStyle(rail).visibility,
        railTransform: getComputedStyle(rail).transform,
        rail: box("#player-page"),
        sidePanel: box("#side-panel"),
        mainPanelDisplay: getComputedStyle(document.getElementById("main-panel")).display,
        browse: box("ytmusic-browse-response"),
        contentPaddingRight: getComputedStyle(document.getElementById("content")).paddingRight,
        railScrolls: tab.scrollHeight > tab.clientHeight + 4,
        /* clientWidth, not innerWidth: a classic scrollbar sits outside the
           box a fixed right: 0 lands on. */
        viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
        navBottom: box("ytmusic-nav-bar").bottom,
        playerBarTop: box("ytmusic-player-bar").top,
        /* Whatever paints in the middle of the rail has to be the queue. */
        railHit: Boolean(
          document
            .elementFromPoint(document.documentElement.clientWidth - 60, Math.round(window.innerHeight / 2))
            ?.closest("ytmusic-player-queue-item")
        ),
        lastItemReachable: (() => {
          tab.scrollTop = tab.scrollHeight;
          const rect = last.getBoundingClientRect();
          const railRect = rail.getBoundingClientRect();
          return rect.bottom <= railRect.bottom + 2;
        })(),
      };
    };
  </script>
</body></html>`;

async function launch() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: null,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1280,900",
    ],
  });

  const deadline = Date.now() + 30000;
  let extensionId = null;
  while (!extensionId && Date.now() < deadline) {
    extensionId = context.serviceWorkers()[0]?.url().match(/chrome-extension:\/\/([a-p]{32})/)?.[1] ?? null;
    if (!extensionId) await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(extensionId, "Could not resolve extension id");
  return { context, extensionId };
}

async function run() {
  const results = [];
  const { context, extensionId } = await launch();

  try {
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (url.startsWith("chrome-extension://")) return route.continue();
      if (/^https:\/\/music\.youtube\.com\//.test(url)) {
        return route.fulfill({ status: 200, contentType: "text/html", body: MUSIC_FIXTURE });
      }
      return route.abort();
    });

    await page.goto("https://music.youtube.com/", { waitUntil: "domcontentloaded" });
    const injected = await page.waitForFunction(
      () => {
        const css = document.getElementById("chromods-styles")?.textContent ?? "";
        return css.includes("--chromods-ytm-queue-width") ? css : false;
      },
      null,
      { timeout: 20000 }
    );
    // YouTube Music is its own site, so the watch-page mods must stay off it.
    assert.doesNotMatch(await injected.jsonValue(), /ytd-watch-flexy/);
    results.push("music.youtube.com gets the YouTube Music mods, not YouTube's");

    const docked = await page.evaluate(() => window.__measure());
    assert.equal(docked.railVisibility, "visible", "The rail must beat the inline visibility: hidden");
    assert.equal(docked.railTransform, "none", "The rail must be pulled back into the viewport");
    assert.equal(docked.rail.right, docked.viewport.width, `Rail is not flush right: ${JSON.stringify(docked.rail)}`);
    assert.equal(docked.rail.top, docked.navBottom, "Rail should start below the nav bar");
    assert.equal(docked.rail.bottom, docked.playerBarTop, "Rail should stop above the player bar");
    assert.ok(docked.rail.width > 200, `Rail is too narrow: ${docked.rail.width}`);
    assert.equal(docked.mainPanelDisplay, "none", "The album-art column has no room in the rail");
    assert.ok(
      docked.browse.right <= docked.rail.left + 2,
      `Browse content runs under the rail: ${JSON.stringify(docked)}`
    );
    assert.equal(docked.contentPaddingRight, `${docked.rail.width}px`);
    assert.ok(docked.railHit, "Queue items should be the topmost thing in the rail");
    assert.ok(docked.railScrolls && docked.lastItemReachable, "A long queue should scroll inside the rail");
    await page.screenshot({ path: path.join(screenshotDir, "ytmusic-sticky-queue.png") });
    results.push("the queue docks on the right while browsing, and the page lays out beside it");

    /* Opening the full player must be left completely alone. */
    await page.evaluate(() => window.__setPlayerPageOpen(true));
    const opened = await page.evaluate(() => window.__measure());
    assert.equal(opened.mainPanelDisplay, "flex", "The full player keeps its album art");
    assert.equal(opened.contentPaddingRight, "0px", "The full player does not reserve a rail");
    assert.ok(opened.rail.width > docked.rail.width * 2, "The full player fills the page again");
    results.push("the full player page is untouched");

    /* And turning the mod off has to hand the page straight back. */
    await page.evaluate(() => window.__setPlayerPageOpen(false));
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: "networkidle" });
    await popup.evaluate(async () => {
      const stored = await chrome.storage.sync.get("chroModsSettings");
      const settings = stored.chroModsSettings ?? {};
      settings.features = { ...(settings.features ?? {}), "ytm-sticky-queue": false };
      await chrome.storage.sync.set({ chroModsSettings: settings });
    });
    await page.waitForFunction(
      () => !(document.getElementById("chromods-styles")?.textContent ?? "").includes("--chromods-ytm-queue-width"),
      null,
      { timeout: 10000 }
    );
    const off = await page.evaluate(() => window.__measure());
    assert.equal(off.railVisibility, "hidden");
    assert.equal(off.contentPaddingRight, "0px");
    results.push("switching the mod off restores YouTube Music's own layout");

    assert.deepEqual(pageErrors, [], "The fixture page should raise no JS errors");
    await popup.close();
    await page.close();
  } finally {
    await context.close();
  }

  console.log("\nYouTube Music sticky queue results:");
  for (const result of results) console.log(`  ✓ ${result}`);
}

run().catch((error) => {
  console.error("\nYouTube Music sticky queue test failed:\n", error);
  process.exit(1);
});
