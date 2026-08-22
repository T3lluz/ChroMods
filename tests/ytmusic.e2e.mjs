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
  #guide { position: fixed; top: ${NAV_HEIGHT}px; bottom: 0; left: 0; width: 240px; background: #030303; z-index: 4; display: block; }
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
  <template id="layout-template">
    <ytmusic-app-layout id="layout" player-visible player-ui-state="MINIPLAYER">
      <ytmusic-nav-bar></ytmusic-nav-bar>
      <tp-yt-app-drawer id="guide" opened persistent>Guide</tp-yt-app-drawer>
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
  </template>
  <script>
    /* Polymer builds the layout with its state attributes already set and only
       then inserts it, so an attribute observer never sees them arrive. The
       template reproduces that. A "late" query param also holds the insert back
       by that many ms, which is the case only a settle pass can catch. */
    const buildLayout = () => {
      document.body.appendChild(document.getElementById("layout-template").content.cloneNode(true));
    };
    const late = Number(new URLSearchParams(location.search).get("late"));
    if (late > 0) setTimeout(buildLayout, late);
    else buildLayout();

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
        docked: document.documentElement.classList.contains("ytm-queue-docked"),
        collapsed: document.documentElement.classList.contains("ytm-queue-collapsed"),
        widthVar: document.documentElement.style.getPropertyValue("--chromods-ytm-queue-width").trim(),
        handle: document.querySelector(".ytm-queue-handle")
          ? {
              ...box(".ytm-queue-handle"),
              valueNow: Number(document.querySelector(".ytm-queue-handle").getAttribute("aria-valuenow")),
              visible: getComputedStyle(document.querySelector(".ytm-queue-handle")).display !== "none",
            }
          : null,
        toggle: document.querySelector(".ytm-queue-toggle")
          ? {
              ...box(".ytm-queue-toggle"),
              expanded: document.querySelector(".ytm-queue-toggle").getAttribute("aria-expanded"),
              label: document.querySelector(".ytm-queue-toggle").getAttribute("aria-label"),
            }
          : null,
      };
    };
  </script>
</body></html>`;

async function launch() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    /* A page viewport rather than the window's, so the narrow-window behaviour
       can be driven without resizing a real window. */
    viewport: { width: 1280, height: 900 },
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

  const serveFixture = (target) =>
    target.route("**/*", async (route) => {
      const url = route.request().url();
      if (url.startsWith("chrome-extension://")) return route.continue();
      if (/^https:\/\/music\.youtube\.com\//.test(url)) {
        return route.fulfill({ status: 200, contentType: "text/html", body: MUSIC_FIXTURE });
      }
      return route.abort();
    });

  try {
    /* A layout that lands well after the content script, with its state
       attributes already set: the observer has nothing to see, so only a settle
       pass can dock this. Done first so it cannot disturb anything else. */
    const latePage = await context.newPage();
    await serveFixture(latePage);
    await latePage.goto("https://music.youtube.com/?late=1200", { waitUntil: "domcontentloaded" });
    await latePage.waitForFunction(() => document.documentElement.classList.contains("ytm-queue-docked"), null, {
      timeout: 10000,
    });
    await latePage.close();
    results.push("a queue restored after the page settles still docks");

    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await serveFixture(page);
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

    await page.waitForFunction(() => document.documentElement.classList.contains("ytm-queue-docked"), null, {
      timeout: 20000,
    });
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

    /* Dragging the handle: the rail, the reserved column, and both controls all
       have to follow the pointer. */
    assert.ok(docked.handle?.visible, "The resize handle should be mounted");
    assert.equal(docked.handle.right, docked.rail.left, "The handle should sit on the rail's edge");
    assert.equal(docked.handle.valueNow, docked.rail.width);
    const dragTo = async (dx) => {
      const box = await page.locator(".ytm-queue-handle").boundingBox();
      const y = Math.round(box.y + box.height / 2);
      await page.mouse.move(Math.round(box.x + box.width / 2), y);
      await page.mouse.down();
      await page.mouse.move(Math.round(box.x + box.width / 2) + dx, y, { steps: 8 });
      await page.mouse.up();
    };
    await dragTo(-90);
    const widened = await page.evaluate(() => window.__measure());
    assert.ok(
      widened.rail.width >= docked.rail.width + 70,
      `Dragging left should widen the rail: ${docked.rail.width} -> ${widened.rail.width}`
    );
    assert.equal(widened.contentPaddingRight, `${widened.rail.width}px`, "The reserved column follows the rail");
    assert.equal(widened.handle.right, widened.rail.left, "The handle stays on the edge");
    assert.equal(widened.toggle.right, widened.rail.left, "The toggle stays on the edge");
    assert.equal(widened.handle.valueNow, widened.rail.width, "The handle reports its width");
    assert.ok(widened.browse.right <= widened.rail.left + 2, "Browse content still clears the rail");

    /* A pull past the limit must clamp rather than swallow the page. */
    await dragTo(-900);
    const clamped = await page.evaluate(() => window.__measure());
    assert.ok(clamped.rail.width > widened.rail.width, "The pull should still have widened the rail");
    assert.ok(
      clamped.rail.width <= Math.round(clamped.viewport.width * 0.45) + 1,
      `The rail should clamp to a share of the viewport, got ${clamped.rail.width}`
    );
    assert.ok(clamped.browse.right <= clamped.rail.left + 2, "A clamped rail still leaves the page room");
    /* What the clamp is really for: the browse column stays wide enough to read
       beside the guide, however hard the handle is pulled. */
    assert.ok(
      clamped.browse.width >= 540,
      `A clamped rail should leave a usable browse column, got ${clamped.browse.width}`
    );
    // Widening the rail must never be what makes it disappear.
    assert.equal(clamped.collapsed, false, "Dragging the rail wider must not tuck it away");
    results.push("dragging the handle resizes the rail, and the pull is clamped");

    /* The width is the user's, so it should survive a reload. */
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.classList.contains("ytm-queue-docked"), null, {
      timeout: 20000,
    });
    const reloaded = await page.evaluate(() => window.__measure());
    assert.equal(reloaded.rail.width, clamped.rail.width, "The dragged width should be remembered");

    /* Keyboard resizing, for anyone not dragging with a mouse. */
    await page.locator(".ytm-queue-handle").focus();
    await page.keyboard.press("ArrowRight");
    const narrowed = await page.evaluate(() => window.__measure());
    assert.ok(
      narrowed.rail.width < reloaded.rail.width,
      `ArrowRight should narrow the rail: ${reloaded.rail.width} -> ${narrowed.rail.width}`
    );
    await page.keyboard.press("Home");
    const reset = await page.evaluate(() => window.__measure());
    assert.equal(reset.rail.width, 360, "Home should reset the rail to its default width");
    results.push("the handle resizes from the keyboard and Home resets it");

    /* Collapsing: out of the way, but still one click from coming back. */
    await page.locator(".ytm-queue-toggle").click();
    await page.waitForFunction(() => document.documentElement.classList.contains("ytm-queue-collapsed"), null, {
      timeout: 5000,
    });
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => window.__measure());
    assert.ok(hidden.rail.left >= hidden.viewport.width - 2, `The rail should slide out: ${JSON.stringify(hidden.rail)}`);
    assert.equal(hidden.contentPaddingRight, "0px", "Collapsing gives the column back");
    assert.equal(hidden.toggle.right, hidden.viewport.width, "The toggle stays reachable at the edge");
    assert.equal(hidden.toggle.expanded, "false");
    assert.match(hidden.toggle.label, /show/i);
    assert.equal(hidden.handle.visible, false, "There is no edge left to drag");
    // The queue is only out of sight: it must still be mounted and populated.
    assert.equal(await page.locator("ytmusic-player-queue-item").count(), 20);
    await page.screenshot({ path: path.join(screenshotDir, "ytmusic-sticky-queue-collapsed.png") });

    await page.locator(".ytm-queue-toggle").click();
    await page.waitForFunction(() => !document.documentElement.classList.contains("ytm-queue-collapsed"), null, {
      timeout: 5000,
    });
    await page.waitForTimeout(300);
    const shown = await page.evaluate(() => window.__measure());
    assert.equal(shown.rail.right, shown.viewport.width, "The rail comes back to the edge");
    assert.equal(shown.contentPaddingRight, `${shown.rail.width}px`);
    results.push("the toggle collapses the rail out of the way and brings it back");

    /* A window too narrow to hold both should tuck the rail away by itself. */
    await page.setViewportSize({ width: 820, height: 900 });
    await page.waitForFunction(() => document.documentElement.classList.contains("ytm-queue-collapsed"), null, {
      timeout: 5000,
    });
    await page.waitForTimeout(300);
    const narrowWindow = await page.evaluate(() => window.__measure());
    assert.equal(narrowWindow.contentPaddingRight, "0px", "A narrow window keeps its full width");
    assert.equal(narrowWindow.toggle.expanded, "false");

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForFunction(() => !document.documentElement.classList.contains("ytm-queue-collapsed"), null, {
      timeout: 5000,
    });
    results.push("a narrow window tucks the rail away, and widening brings it back");

    /* ...unless the user asked it not to. */
    const settingsPage = await context.newPage();
    await settingsPage.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: "networkidle" });
    await settingsPage.evaluate(async () => {
      const stored = await chrome.storage.sync.get("chroModsSettings");
      const settings = stored.chroModsSettings ?? {};
      settings.subsettings = { ...(settings.subsettings ?? {}), ytmusicQueue: { autoCompact: false } };
      await chrome.storage.sync.set({ chroModsSettings: settings });
    });
    /* Back to the foreground first: Chromium throttles transitions in a
       background tab, so the reserved column would still be mid-slide. */
    await settingsPage.close();
    await page.bringToFront();
    await page.setViewportSize({ width: 820, height: 900 });
    await page.waitForTimeout(600);
    const pinned = await page.evaluate(() => window.__measure());
    assert.equal(pinned.collapsed, false, "With auto-collapse off the rail stays put on a narrow window");
    assert.equal(pinned.contentPaddingRight, `${pinned.rail.width}px`);
    await page.setViewportSize({ width: 1280, height: 900 });
    results.push("the popup's auto-collapse setting is honoured live");

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
