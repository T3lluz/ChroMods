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
  "theater-glass-comments.css",
  "theater-translucent-comments.css",
  "theater-solid-comments.css",
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
});

test("CSS files avoid Firefox-only syntax", () => {
  for (const file of STYLE_FILES) {
    const css = fs.readFileSync(path.join(stylesDir, file), "utf8");
    for (const rule of FORBIDDEN_PATTERNS) {
      assert.doesNotMatch(css, rule.pattern, `${file} contains ${rule.name}`);
    }
  }
});

test("theater glass comments includes webkit backdrop filter and translucent background", () => {
  const css = read("styles/theater-glass-comments.css");
  assert.match(css, /-webkit-backdrop-filter\s*:\s*blur\(20px\)/);
  assert.match(css, /backdrop-filter\s*:\s*blur\(20px\)/);
  assert.match(css, /background-color:\s*rgb\(0 0 0 \/ 0\.53\)/);
});

test("theater translucent comments has no backdrop filter", () => {
  const css = read("styles/theater-translucent-comments.css");
  assert.match(css, /backdrop-filter:\s*none/);
  assert.match(css, /background-color:\s*rgb\(0 0 0 \/ 0\.75\)/);
});

test("immersive search includes transform fallbacks for scale", () => {
  const css = read("styles/immersive-search.css");
  assert.match(css, /transform:\s*scale\(1\.05\)/);
  assert.match(css, /transform:\s*scale\(1\.1\)/);
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
  assert.match(js, /theater-translucent-comments\.css/);
  assert.match(js, /subsettings/);
  assert.match(js, /"immersive-search"/);
  assert.match(js, /"feed-layout"/);
  assert.match(js, /"compact-sidebar"/);
  assert.match(js, /commentsBackground/);
  assert.match(js, /feed-layout-compact\.css/);
});

test("popup defines theater and feed subsettings", () => {
  const js = read("popup/popup.js");
  assert.match(js, /hoverComments/);
  assert.match(js, /commentsBackground/);
  assert.match(js, /hideHeader/);
  assert.match(js, /commentsSide/);
  assert.match(js, /FEED_SUBSETTINGS/);
  assert.match(js, /columns/);
});

test("popup CSS uses forced dark theme", () => {
  const css = read("popup/popup.css");
  assert.match(css, /color-scheme:\s*dark/);
  assert.doesNotMatch(css, /prefers-color-scheme:\s*light/);
  assert.doesNotMatch(css, /\.feature-card:hover/);
});
