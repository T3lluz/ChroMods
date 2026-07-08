import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const stylesDir = path.join(root, "styles");

const FORBIDDEN_PATTERNS = [
  { name: "@-moz-document", pattern: /@-moz-document/i },
  { name: "Firefox-only scrollbar-width", pattern: /scrollbar-width\s*:/i },
  { name: "Nested CSS ampersand", pattern: /&\s*[:{]/ },
];

const STYLE_FILES = fs
  .readdirSync(stylesDir)
  .filter((file) => file.endsWith(".css"));

const THEATER_FILES = [
  "theater-base.css",
  "theater-hide-header.css",
  "theater-hover-comments.css",
  "theater-comments-right.css",
];

const FEED_FILES = [
  "feed-layout-compact.css",
  "feed-layout-columns-auto.css",
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("manifest is valid Chrome MV3", () => {
  const manifest = JSON.parse(read("manifest.json"));
  assert.equal(manifest.manifest_version, 3);
  assert.ok(manifest.name);
  assert.ok(manifest.content_scripts?.[0]?.js?.includes("content-script.js"));
  assert.ok(manifest.action?.default_popup);
  assert.ok(manifest.host_permissions.some((p) => p.includes("youtube.com")));
});

test("all stylesheet modules exist", () => {
  for (const file of [...THEATER_FILES, ...FEED_FILES]) {
    assert.ok(fs.existsSync(path.join(stylesDir, file)), `missing ${file}`);
  }
  assert.ok(fs.existsSync(path.join(stylesDir, "immersive-search.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "compact-sidebar.css")));
  assert.doesNotMatch(
    fs.readdirSync(stylesDir).join("\n"),
    /theater-glass|theater-translucent|theater-solid/
  );
});

test("CSS files avoid Firefox-only syntax", () => {
  for (const file of STYLE_FILES) {
    const css = fs.readFileSync(path.join(stylesDir, file), "utf8");
    for (const rule of FORBIDDEN_PATTERNS) {
      assert.doesNotMatch(css, rule.pattern, `${file} contains ${rule.name}`);
    }
  }
});

test("theater hover comments uses solid opaque background", () => {
  const css = read("styles/theater-hover-comments.css");
  assert.match(css, /background:\s*#0f0f0f/);
  assert.match(css, /background:\s*#ffffff/);
  assert.doesNotMatch(css, /backdrop-filter/);
});

test("immersive search hides voice search and blurs page content on focus", () => {
  const css = read("styles/immersive-search.css");
  assert.match(css, /#voice-search-button/);
  assert.match(css, /#content:has\(\.ytSearchboxComponentInputBoxHasFocus\) #page-manager/);
  assert.match(css, /filter:\s*blur\(20px\)/);
  assert.match(css, /justify-content:\s*center/);
  assert.match(css, /transform:\s*scale\(1\.05\)/);
  assert.match(css, /transform:\s*scale\(1\.1\)/);
  assert.doesNotMatch(css, /ytd-app:has\(\.ytSearchboxComponentInputBoxHasFocus\)::before/);
});

test("theater hide header extends hover reveal zone", () => {
  const css = read("styles/theater-hide-header.css");
  assert.match(css, /padding-bottom:\s*140px/);
  assert.match(css, /focus-within/);
});

test("immersive search includes transform fallbacks for scale", () => {
  const css = read("styles/immersive-search.css");
  assert.match(css, /scale:\s*1\.05/);
  assert.match(css, /scale:\s*1\.1/);
});

test("popup assets exist and reference each other", () => {
  const html = read("popup/popup.html");
  assert.match(html, /popup\.css/);
  assert.match(html, /popup\.js/);
  assert.match(html, /id="master-toggle"/);
  assert.match(html, /id="features-list"/);
  assert.match(html, /id="feature-count"/);
});

test("content script maps features and theater subsettings", () => {
  const js = read("content-script.js");
  assert.match(js, /"theater-mode"/);
  assert.match(js, /theater-base\.css/);
  assert.match(js, /theater-hover-comments\.css/);
  assert.match(js, /subsettings/);
  assert.match(js, /"immersive-search"/);
  assert.match(js, /"feed-layout"/);
  assert.match(js, /"compact-sidebar"/);
  assert.match(js, /feed-layout-compact\.css/);
  assert.match(js, /showToast/);
  assert.match(js, /ytm-glow-out/);
  assert.match(js, /ytm-vignette/);
  assert.doesNotMatch(js, /theater-glass-comments|theater-translucent-comments|commentsBackground/);
});

test("background broadcasts settings changes to YouTube tabs", () => {
  const js = read("background.js");
  assert.match(js, /chrome\.storage\.onChanged/);
  assert.match(js, /broadcastSettings/);
  assert.match(js, /applySettings/);
});

test("popup triggers page toast on toggle", () => {
  const js = read("popup/popup.js");
  assert.match(js, /showPageToast/);
  assert.match(js, /action:\s*"showToast"/);
  assert.match(js, /notifyAllYouTubeTabs/);
});

test("popup defines theater and feed subsettings", () => {
  const js = read("popup/popup.js");
  assert.match(js, /hoverComments/);
  assert.match(js, /hideHeader/);
  assert.match(js, /commentsSide/);
  assert.match(js, /FEED_SUBSETTINGS/);
  assert.match(js, /columns/);
  assert.doesNotMatch(js, /commentsBackground|theater-glass|Glass \+ blur/);
});

test("popup CSS uses forced dark theme", () => {
  const css = read("popup/popup.css");
  assert.match(css, /color-scheme:\s*dark/);
  assert.doesNotMatch(css, /prefers-color-scheme:\s*light/);
  assert.doesNotMatch(css, /\.feature-card:hover/);
});
