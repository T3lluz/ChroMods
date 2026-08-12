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
  "theater-header-blur.css",
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
  assert.equal(manifest.name, "ChroMods");
  assert.ok(manifest.content_scripts?.[0]?.js?.includes("scripts/content-script.js"));
  assert.ok(manifest.content_scripts?.[0]?.js?.includes("scripts/sites.js"));
  assert.ok(manifest.action?.default_popup);
  assert.ok(manifest.host_permissions.some((p) => p.includes("youtube.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("github.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("google.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("duckduckgo.com")));
  for (const file of ["icons/icon.svg", "icons/icon16.png", "icons/icon48.png", "icons/icon128.png"]) {
    assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  }
});

test("all stylesheet modules exist", () => {
  for (const file of [...THEATER_FILES, ...FEED_FILES]) {
    assert.ok(fs.existsSync(path.join(stylesDir, file)), `missing ${file}`);
  }
  assert.ok(fs.existsSync(path.join(stylesDir, "immersive-search.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "compact-sidebar.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-no-tab-text.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-glass-effect.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-immersive-search.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-hover.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-no-footer.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-border-mods.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-remove-borders.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-repo-sidebar-hover.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-hide-toolbar-separator.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-timeline-badge.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "gh-chip-margin.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "g-search-zoom.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "g-glass-effect.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "g-overlay-fix.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "g-shadows-borders.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "g-hover.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-immersive-search.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-immersive-popup.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-glass-effect.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-animations.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-misc.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-no-learn-more.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-hidden-promo.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-no-share-feedback.css")));
  assert.ok(fs.existsSync(path.join(stylesDir, "ddg-no-footer.css")));
  assert.doesNotMatch(
    fs.readdirSync(stylesDir).join("\n"),
    /theater-glass|theater-translucent|theater-solid|gh-transparency|gh-transparent-lists|gh-overlay-fixes|g-transparency|ddg-transparency|ddg-transparent-header/
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
  assert.match(css, /ytSearchboxComponentVoiceSearchButton/);
  assert.match(css, /#content:has\(\.ytSearchboxComponentInputBoxHasFocus\) #page-manager/);
  assert.match(css, /filter:\s*blur\(20px\)/);
  assert.match(css, /justify-content:\s*center/);
  assert.match(css, /top:\s*-30vh/);
  assert.match(css, /height:\s*40px/);
  assert.match(css, /position:\s*absolute/);
  assert.match(css, /calc\(100% \+ 10px\)/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /ytd-video-preview/);
  assert.match(css, /transform:\s*scale\(1\.05\)/);
  assert.match(css, /transform:\s*scale\(1\.1\)/);
  assert.doesNotMatch(css, /ytd-app:has\(\.ytSearchboxComponentInputBoxHasFocus\)::before/);
});

test("theater hide header extends hover reveal zone", () => {
  const css = read("styles/theater-hide-header.css");
  assert.match(css, /padding-bottom:\s*24px/);
  assert.match(css, /focus-within/);
});

test("theater layout follows zen view height and resets control bounds on exit", () => {
  const css = read("styles/theater-base.css");
  assert.match(css, /ytd-watch-flexy\[theater\].*#full-bleed-container/);
  assert.match(css, /height:\s*100vh/);
  assert.match(css, /#page-manager/);
  assert.match(css, /margin:\s*0/);
  assert.match(css, /ytd-watch-flexy:not\(\[theater\]\) \.ytp-chrome-bottom/);
  assert.match(css, /width:\s*calc\(100% - 24px\)/);
  assert.doesNotMatch(css, /ytd-masthead\[theater/);
  assert.doesNotMatch(css, /#player-full-bleed-container/);
  assert.doesNotMatch(css, /100vw/);
  assert.doesNotMatch(css, /margin:\s*0 0 0 -50vw/);
});

test("theater header blur matches player blur frosted glass", () => {
  const css = read("styles/theater-header-blur.css");
  assert.match(css, /backdrop-filter:\s*blur\(5px\)/);
  assert.match(css, /background-color:\s*#0001/);
  assert.match(css, /#background\.ytd-masthead/);
});

test("immersive search includes transform fallbacks for scale", () => {
  const css = read("styles/immersive-search.css");
  assert.match(css, /scale:\s*1\.05/);
  assert.match(css, /scale:\s*1\.1/);
});

test("github no tab text hides repo tab labels until hover", () => {
  const css = read("styles/gh-no-tab-text.css");
  assert.match(css, /nav\[aria-label="Repository"\] > ul > li > a span\[data-component="text"\]/);
  assert.match(css, /nav\[aria-label="Repository"\] > ul > li > a:hover span\[data-component="text"\]/);
  assert.match(css, /width:\s*0em/);
  assert.match(css, /width:\s*9em/);
  assert.match(css, /\.UnderlineNav-item:hover \.Counter/);
  assert.match(css, /\.AppHeader-localBar \.Counter/);
  assert.doesNotMatch(css, /&\s*[:{]/);
});

test("github glass and layout mods skip page transparency", () => {
  const glass = read("styles/gh-glass-effect.css");
  assert.match(glass, /light-dark\(#fff8, #0005\)/);
  assert.match(glass, /box-shadow:/);
  assert.match(glass, /\.CommentBox-container/);
  assert.doesNotMatch(glass, /html\s*,\s*body/);

  const borders = read("styles/gh-border-mods.css");
  assert.match(borders, /border:\s*none/);
  assert.match(borders, /border-radius:\s*0\.5em/);
  assert.doesNotMatch(borders, /background:\s*none/);
  assert.doesNotMatch(borders, /background-color:\s*transparent/);

  const hover = read("styles/gh-hover.css");
  assert.match(hover, /\.feed-left-sidebar:hover/);
  assert.match(hover, /\.feed-right-column:hover/);
  assert.doesNotMatch(hover, /&\s*[:{]/);

  const sidebar = read("styles/gh-repo-sidebar-hover.css");
  assert.match(sidebar, /\.Layout-sidebar:hover \.BorderGrid-cell/);
  assert.doesNotMatch(sidebar, /&\s*[:{]/);

  const search = read("styles/gh-immersive-search.css");
  assert.match(search, /header > \.search-expanded/);
  assert.match(search, /filter:\s*blur\(20px\)/);
  assert.match(search, /transform:\s*scale\(1\.05\)/);

  const timeline = read("styles/gh-timeline-badge.css");
  assert.match(timeline, /\.TimelineItem-badge/);
  assert.doesNotMatch(timeline, /&\s*[:{]/);
});

test("google search mods skip page transparency", () => {
  const zoom = read("styles/g-search-zoom.css");
  assert.match(zoom, /body:has\(\.A8SBwf\.emcav\) #main/);
  assert.match(zoom, /filter:\s*blur\(20px\)/);
  assert.match(zoom, /transform:\s*scale\(0\.98\)/);
  assert.match(zoom, /light-dark\(#fff5, #0007\)/);
  assert.match(zoom, /\.rfiSsc\.JiJthb/);
  assert.doesNotMatch(zoom, /&\s*[:{]/);
  assert.doesNotMatch(zoom, /html\s*,\s*body/);

  const glass = read("styles/g-glass-effect.css");
  assert.match(glass, /div\.RNNXgb/);
  assert.match(glass, /box-shadow:/);
  assert.match(glass, /#rcnt \.hdzaWe/);
  assert.doesNotMatch(glass, /html\s*,\s*body/);
  assert.doesNotMatch(glass, /--darkreader-background-ffffff:\s*transparent/);

  const overlay = read("styles/g-overlay-fix.css");
  assert.match(overlay, /#liveresults-sports-immersive__match-fullpage/);
  assert.match(overlay, /var\(--EpFNW\)/);
  assert.doesNotMatch(overlay, /background-color:\s*#00000000/);

  const chrome = read("styles/g-shadows-borders.css");
  assert.match(chrome, /#sfooter/);
  assert.match(chrome, /box-shadow:\s*none/);
  assert.doesNotMatch(chrome, /background:\s*none/);

  const hover = read("styles/g-hover.css");
  assert.match(hover, /\.rfiSsc:hover/);
  assert.match(hover, /opacity:\s*0/);
  assert.doesNotMatch(hover, /&\s*[:{]/);
});

test("duckduckgo mods skip page and header transparency", () => {
  const search = read("styles/ddg-immersive-search.css");
  assert.match(search, /#searchbox_input:focus/);
  assert.match(search, /\[data-testid="searchbox-form"\]:focus-within/);
  assert.match(search, /#react-search-form:focus-within/);
  assert.match(search, /#web_content_wrapper/);
  assert.match(search, /filter:\s*blur\(20px\)/);
  assert.match(search, /transform:\s*scale\(0\.98\)/);
  assert.match(search, /transition:\s*all 0\.3s ease-in-out/);
  assert.doesNotMatch(search, /&\s*[:{]/);
  assert.doesNotMatch(search, /html\s*,\s*body/);

  const popup = read("styles/ddg-immersive-popup.css");
  assert.match(popup, /body:has\(\.modal\.is-showing\) \.site-wrapper/);
  assert.match(popup, /filter:\s*blur\(20px\)/);
  assert.match(popup, /-webkit-backdrop-filter:\s*blur\(20px\)/);
  assert.doesNotMatch(popup, /&\s*[:{]/);
  assert.doesNotMatch(popup, /#header_wrapper \{\s*position:\s*relative/);
  assert.doesNotMatch(popup, /#searchbox_homepage > \.searchbox_hasQuery/);

  const glass = read("styles/ddg-glass-effect.css");
  assert.match(glass, /hsla\(0, 0%, 100%, 0\.08\)/);
  assert.match(glass, /\.searchbox_combobox__P9Gnn/);
  assert.doesNotMatch(glass, /--theme-bg-home:\s*transparent/);

  const animations = read("styles/ddg-animations.css");
  assert.match(animations, /transition-property:\s*filter/);
  assert.match(animations, /cubic-bezier\(0\.85, 0, 0\.15, 1\)/);

  const misc = read("styles/ddg-misc.css");
  assert.match(misc, /nav::before/);
  assert.match(misc, /\.js-ask-ai-chat-wrapper > form::after/);

  const learn = read("styles/ddg-no-learn-more.css");
  assert.match(learn, /#features/);
  assert.match(learn, /\.homepage-cta-section_scrollCta__Wmixn/);

  const promo = read("styles/ddg-hidden-promo.css");
  assert.match(promo, /\.desktop-homepage_heroContent__4HUFA/);

  const feedback = read("styles/ddg-no-share-feedback.css");
  assert.match(feedback, /\.TccjmKV6RraCaCw5L9gd/);

  const footer = read("styles/ddg-no-footer.css");
  assert.match(footer, /\.footer/);
  assert.doesNotMatch(footer, /background-color:\s*transparent/);
});

test("popup assets exist and reference each other", () => {
  const html = read("popup/popup.html");
  assert.match(html, /popup\.css/);
  assert.match(html, /\.\.\/scripts\/popup\.js/);
  assert.match(html, /\.\.\/scripts\/sites\.js/);
  assert.match(html, /id="site-rail"/);
  assert.match(html, /id="current-pane"/);
  assert.match(html, /id="other-sites-list"/);
  assert.match(html, /header-frost/);
  assert.match(html, /header-glass/);
  assert.match(html, /header-fade/);
  assert.match(html, /ChroMods/);
});

test("content script maps features and theater subsettings", () => {
  const js = read("scripts/content-script.js");
  assert.match(js, /"theater-mode"/);
  assert.match(js, /theater-base\.css/);
  assert.match(js, /theater-header-blur\.css/);
  assert.match(js, /theater-hover-comments\.css/);
  assert.match(js, /subsettings/);
  assert.match(js, /"immersive-search"/);
  assert.match(js, /"feed-layout"/);
  assert.match(js, /"compact-sidebar"/);
  assert.match(js, /feed-layout-compact\.css/);
  assert.match(js, /MovableLiveChat/);
  assert.match(js, /movable-live-chat/);
  assert.match(js, /setTheaterLayoutSyncEnabled/);
  assert.match(js, /TheaterHoverComments|theaterHoverComments/);
  assert.match(js, /"gh-no-tab-text"/);
  assert.match(js, /gh-no-tab-text\.css/);
  assert.match(js, /"gh-glass-effect"/);
  assert.match(js, /gh-glass-effect\.css/);
  assert.match(js, /"gh-immersive-search"/);
  assert.match(js, /"g-search-zoom"/);
  assert.match(js, /g-search-zoom\.css/);
  assert.match(js, /"g-glass-effect"/);
  assert.match(js, /"ddg-immersive-search"/);
  assert.match(js, /ddg-immersive-search\.css/);
  assert.match(js, /"ddg-immersive-popup"/);
  assert.match(js, /ddg-immersive-popup\.css/);
  assert.match(js, /"ddg-glass-effect"/);
  assert.match(js, /FEATURE_SITE/);
  assert.match(js, /getCurrentSiteId/);
  assert.doesNotMatch(js, /gh-transparency|gh-transparent-lists|gh-overlay-fixes|g-transparency|ddg-transparency|ddg-transparent-header/);
  assert.match(js, /chroModsSettings/);
  assert.match(js, /chromods-styles/);
  assert.doesNotMatch(
    js,
    /showToast|youtube-theming-toast|chromods-toast|ytm-toast|ytm-glow|ytm-vignette|createGlowRing/
  );
  assert.doesNotMatch(js, /theater-glass-comments|theater-translucent-comments|commentsBackground/);
});

test("background only seeds install defaults", () => {
  const js = read("scripts/background.js");
  assert.match(js, /chrome\.runtime\.onInstalled/);
  assert.match(js, /chrome\.storage\.sync\.set/);
  assert.doesNotMatch(js, /chrome\.tabs|sendMessage|broadcastSettings/);
});

test("popup applies toggles through storage without page messaging", () => {
  const js = read("scripts/popup.js");
  assert.match(js, /chrome\.storage\.sync\.set/);
  assert.match(js, /updateMasterState/);
  assert.match(js, /lastFocusedWindow/);
  assert.match(js, /scrollToSite/);
  assert.doesNotMatch(
    js,
    /sendMessage|notifyAllYouTubeTabs|showPageToast|showToast|youtube-theming-toast|chromods-toast/
  );
});

test("popup defines theater and feed subsettings", () => {
  const js = read("scripts/popup.js");
  assert.match(js, /hoverComments/);
  assert.match(js, /hideHeader/);
  assert.match(js, /headerBlur/);
  assert.match(js, /commentsSide/);
  assert.match(js, /FEED_SUBSETTINGS/);
  assert.match(js, /columns/);
  assert.match(js, /overlay-live-chat/);
  assert.match(js, /gh-no-tab-text/);
  assert.match(js, /gh-glass-effect/);
  assert.match(js, /gh-immersive-search/);
  assert.match(js, /g-search-zoom/);
  assert.match(js, /g-glass-effect/);
  assert.match(js, /ddg-immersive-search/);
  assert.match(js, /ddg-immersive-popup/);
  assert.match(js, /ddg-glass-effect/);
  assert.match(js, /category-appearance/);
  assert.match(js, /site:\s*"github"/);
  assert.match(js, /site:\s*"google"/);
  assert.match(js, /site:\s*"duckduckgo"/);
  assert.match(js, /feature\.site\s*\?\?=\s*"youtube"/);
  assert.doesNotMatch(
    js,
    /new-to-you-first|transparent-header|transparent-player|viewstats-theme|timed-comments-theme|gh-transparency|gh-transparent-lists|g-transparency|ddg-transparency/
  );
  assert.doesNotMatch(js, /commentsBackground|theater-glass|Glass \+ blur/);
});

test("hostname matching maps YouTube, GitHub, Google, and DuckDuckGo URLs", () => {
  const api = new Function(`${read("scripts/sites.js")}; return { matchSiteFromUrl };`)();
  assert.equal(api.matchSiteFromUrl("https://www.youtube.com/watch?v=x")?.id, "youtube");
  assert.equal(api.matchSiteFromUrl("https://music.youtube.com/")?.id, "youtube");
  assert.equal(api.matchSiteFromUrl("https://youtu.be/x")?.id, "youtube");
  assert.equal(api.matchSiteFromUrl("https://github.com/sameerasw/my-internet")?.id, "github");
  assert.equal(api.matchSiteFromUrl("https://gist.github.com/")?.id, "github");
  assert.equal(api.matchSiteFromUrl("https://www.google.com/search?q=x")?.id, "google");
  assert.equal(api.matchSiteFromUrl("https://images.google.com/")?.id, "google");
  assert.equal(api.matchSiteFromUrl("https://google.co.uk/")?.id, "google");
  assert.equal(api.matchSiteFromUrl("https://www.google.com.au/search")?.id, "google");
  assert.equal(api.matchSiteFromUrl("https://mail.google.com/"), null);
  assert.equal(api.matchSiteFromUrl("https://docs.google.com/"), null);
  assert.equal(api.matchSiteFromUrl("https://duckduckgo.com/?q=x")?.id, "duckduckgo");
  assert.equal(api.matchSiteFromUrl("https://start.duckduckgo.com/")?.id, "duckduckgo");
  assert.equal(api.matchSiteFromUrl("https://lite.duckduckgo.com/lite/")?.id, "duckduckgo");
  assert.equal(api.matchSiteFromUrl("https://www.twitch.tv/foo"), null);
  assert.equal(api.matchSiteFromUrl("https://example.com/"), null);
});

test("site registry detects YouTube, GitHub, Google, and DuckDuckGo hosts", () => {
  const js = read("scripts/sites.js");
  assert.match(js, /id:\s*"youtube"/);
  assert.match(js, /id:\s*"github"/);
  assert.match(js, /id:\s*"google"/);
  assert.match(js, /id:\s*"duckduckgo"/);
  assert.doesNotMatch(js, /id:\s*"twitch"/);
  assert.match(js, /youtube\.com/);
  assert.match(js, /github\.com/);
  assert.match(js, /google\.com/);
  assert.match(js, /duckduckgo\.com/);
  assert.match(js, /matchSiteFromUrl/);
  assert.match(js, /matchSiteFromHostname/);
  assert.match(js, /hostnamePattern/);
});

test("popup categories have custom icons and animated expansion", () => {
  const js = read("scripts/icons.js");
  const css = read("popup/popup.css");
  assert.match(js, /category-live/);
  assert.match(js, /category-appearance/);
  assert.match(js, /site-youtube/);
  assert.match(js, /site-github/);
  assert.match(js, /site-google/);
  assert.match(js, /site-duckduckgo/);
  assert.match(js, /#DE5833/);
  assert.match(js, /#FDD20A/);
  assert.match(js, /#65BC46/);
  assert.doesNotMatch(js, /site-twitch/);
  assert.match(css, /category-expansion/);
  assert.match(css, /feature-expansion/);
  assert.match(css, /site-rail/);
  assert.match(css, /other-sites/);
  assert.match(css, /header-frost/);
  assert.match(css, /header-glass/);
  assert.match(css, /header-fade/);
  assert.match(css, /mask-composite:\s*intersect/);
  assert.match(css, /backdrop-filter:\s*blur/);
  assert.match(css, /saturate\(2\.8\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("popup CSS uses forced dark theme", () => {
  const css = read("popup/popup.css");
  assert.match(css, /color-scheme:\s*dark/);
  assert.doesNotMatch(css, /prefers-color-scheme:\s*light/);
  assert.doesNotMatch(css, /\.feature-card:hover/);
});

test("README lists every live site and is generated from metadata", () => {
  const readme = read("README.md");
  const sites = ["youtube", "github", "google", "duckduckgo"];
  for (const site of sites) {
    assert.match(readme, new RegExp(`docs/sites/${site}\\.svg`));
    assert.ok(fs.existsSync(path.join(root, "docs/sites", `${site}.svg`)));
  }
  assert.match(readme, /icons\/icon\.svg/);
  assert.match(readme, /Generated by scripts\/generate-readme\.mjs/);
});
