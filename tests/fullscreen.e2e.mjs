/* Drives the YouTube fullscreen transition in a real Chromium with ChroMods
   loaded. The watch page is a local fixture served for a youtube.com URL, so
   this runs offline and does not depend on YouTube's markup of the day.

   Run with: npm run test:fullscreen (needs `npx playwright install chromium`). */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, "..");
const userDataDir = path.join(__dirname, ".pw-profile-fullscreen");
const screenshotDir = path.join(__dirname, "screenshots");

fs.rmSync(userDataDir, { recursive: true, force: true });
fs.mkdirSync(screenshotDir, { recursive: true });

/* Only the parts of a watch page the transition looks for: the flexy wrapper it
   searches from, the player, and the inner video box it scales. */
const WATCH_FIXTURE = `<!DOCTYPE html>
<html lang="en" dark><head><meta charset="utf-8"><title>ChroMods fullscreen fixture</title>
<style>
  html, body { margin: 0; background: #0f0f0f; }
  ytd-app, #page-manager, ytd-watch-flexy, #columns, #primary { display: block; }
  #player-full-bleed-container, #full-bleed-container { display: block; position: relative; }
  #full-bleed-container { width: 854px; height: 480px; margin: 24px auto; }
  #movie_player { position: relative; width: 100%; height: 100%; background: #000; }
  .html5-video-container { position: absolute; inset: 0; }
  video { width: 100%; height: 100%; background: #1b3a5c; }
  .ytp-chrome-bottom { position: absolute; left: 0; bottom: 0; width: 100%; height: 40px; background: #333; }
  #enter-fullscreen { position: fixed; top: 4px; left: 4px; z-index: 9; }
</style></head>
<body>
  <button id="enter-fullscreen">fullscreen</button>
  <ytd-app><div id="page-manager"><ytd-watch-flexy><div id="columns"><div id="primary">
    <div id="player-full-bleed-container"><div id="full-bleed-container">
      <div id="movie_player" class="html5-video-player">
        <div class="html5-video-container"><video class="html5-main-video"></video></div>
        <div class="ytp-chrome-bottom"></div>
      </div>
    </div></div>
  </div></div></ytd-watch-flexy></div></ytd-app>
  <script>
    const player = document.getElementById("movie_player");
    const inner = player.querySelector(".html5-video-container");
    document.getElementById("enter-fullscreen").addEventListener("click", () => {
      player.requestFullscreen();
    });
    /* Samples every frame: the animation is a few hundred ms, so polling from
       the test runner would miss it. */
    window.__samplePlayer = (ms) => new Promise((resolve) => {
      const samples = [];
      const start = performance.now();
      const tick = () => {
        const playerTransform = getComputedStyle(player).transform;
        samples.push({
          animating: player.classList.contains("ytm-fs-animating"),
          scalingInner: inner.classList.contains("ytm-fs-scaling"),
          transform: playerTransform === "none" ? getComputedStyle(inner).transform : playerTransform,
          fullscreen: Boolean(document.fullscreenElement),
        });
        if (performance.now() - start < ms) requestAnimationFrame(tick);
        else resolve(samples);
      };
      requestAnimationFrame(tick);
    });
  </script>
</body></html>`;

function scaleOf(transform) {
  const numbers = /matrix\(([^)]+)\)/.exec(transform)?.[1]?.split(",").map(Number);
  return numbers ? numbers[0] : null;
}

function describe(samples) {
  const animating = samples.filter((sample) => sample.animating);
  const scales = animating.map((sample) => scaleOf(sample.transform)).filter((value) => value !== null);
  return {
    animatingFrames: animating.length,
    distinctTransforms: new Set(animating.map((sample) => sample.transform)).size,
    firstScale: scales[0] ?? null,
    lastScale: scales.at(-1) ?? null,
    settled: samples.at(-1),
  };
}

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

async function openFixture(context) {
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.route("**/*", async (route) => {
    const url = route.request().url();
    /* The content script fetches its CSS through the page, so extension
       requests have to reach the extension. */
    if (url.startsWith("chrome-extension://")) return route.continue();
    if (/^https:\/\/www\.youtube\.com\/watch/.test(url)) {
      return route.fulfill({ status: 200, contentType: "text/html", body: WATCH_FIXTURE });
    }
    return route.abort();
  });

  await page.goto("https://www.youtube.com/watch?v=chromods-fixture", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => (document.getElementById("chromods-styles")?.textContent ?? "").includes("ytm-fs-animating"),
    null,
    { timeout: 20000 }
  );
  return { page, pageErrors };
}

async function run() {
  const results = [];
  const { context } = await launch();

  try {
    const { page, pageErrors } = await openFixture(context);

    const enter = describe(
      await page.evaluate(async () => {
        const samples = window.__samplePlayer(900);
        document.getElementById("enter-fullscreen").click();
        return samples;
      })
    );

    assert.ok(enter.animatingFrames > 3, `Entering should animate, got ${JSON.stringify(enter)}`);
    // A UA !important rule pins the fullscreen element to transform: none, so a
    // single repeated transform means the FLIP was silently dropped.
    assert.ok(
      enter.distinctTransforms > 3,
      `Entering should interpolate the transform, got ${JSON.stringify(enter)}`
    );
    assert.ok(
      enter.firstScale > 0 && enter.firstScale < 0.95,
      `Entering should start scaled down, got ${JSON.stringify(enter)}`
    );
    assert.ok(enter.settled.fullscreen, "The player should end up in native fullscreen");
    assert.equal(enter.settled.animating, false, "The animating class should be cleaned up");
    assert.equal(enter.settled.scalingInner, false, "The inner scale class should be cleaned up");
    await page.screenshot({ path: path.join(screenshotDir, "youtube-fullscreen-entered.png") });
    results.push("entering fullscreen scales the inner video box up");

    const exit = describe(
      await page.evaluate(async () => {
        const samples = window.__samplePlayer(900);
        await document.exitFullscreen();
        return samples;
      })
    );

    assert.ok(exit.animatingFrames > 3, `Exiting should animate, got ${JSON.stringify(exit)}`);
    assert.ok(
      exit.distinctTransforms > 3,
      `Exiting should interpolate the transform, got ${JSON.stringify(exit)}`
    );
    assert.ok(exit.firstScale > 1.05, `Exiting should start scaled up, got ${JSON.stringify(exit)}`);
    assert.equal(exit.settled.fullscreen, false);
    assert.equal(exit.settled.animating, false, "The animating class should be cleaned up");
    results.push("exiting fullscreen scales the player back down");

    const leftovers = await page.evaluate(() => ({
      style: document.getElementById("movie_player").getAttribute("style") ?? "",
      classes: document.getElementById("movie_player").className,
    }));
    assert.doesNotMatch(leftovers.style, /position:\s*fixed/, `Player stayed pinned: ${leftovers.style}`);
    assert.doesNotMatch(leftovers.classes, /ytm-fs-/, `Player kept a transition class: ${leftovers.classes}`);
    results.push("the player is left with no pinned styles or transition classes");

    assert.deepEqual(pageErrors, [], "The fixture page should raise no JS errors");
    await page.close();
  } finally {
    await context.close();
  }

  console.log("\nFullscreen transition results:");
  for (const result of results) console.log(`  ✓ ${result}`);
}

run().catch((error) => {
  console.error("\nFullscreen transition test failed:\n", error);
  process.exit(1);
});
