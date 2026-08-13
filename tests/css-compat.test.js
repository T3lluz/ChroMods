import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const stylesDir = path.join(root, "styles");
const SITE_STYLE_DIRS = [
  "youtube",
  "github",
  "google",
  "gmail",
  "gemini",
  "duckduckgo",
  "x",
  "twitch",
];

const FORBIDDEN_PATTERNS = [
  { name: "@-moz-document", pattern: /@-moz-document/i },
  { name: "Firefox-only scrollbar-width", pattern: /scrollbar-width\s*:/i },
  { name: "Nested CSS ampersand", pattern: /&\s*[:{]/ },
];

function collectCssFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectCssFiles(full));
    else if (entry.name.endsWith(".css")) files.push(full);
  }
  return files;
}

const STYLE_FILES = collectCssFiles(stylesDir);

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function style(site, file) {
  return `styles/${site}/${file}`;
}

test("manifest is valid Chrome MV3", () => {
  const manifest = JSON.parse(read("manifest.json"));
  const contentJs = (manifest.content_scripts || []).flatMap((entry) => entry.js || []);
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, "ChroMods");
  assert.ok(contentJs.includes("scripts/content-script.js"));
  assert.ok(contentJs.includes("scripts/sites.js"));
  assert.ok(contentJs.includes("scripts/vendor/darkreader.js"));
  assert.ok(contentJs.includes("scripts/dark-mode.js"));
  assert.ok(contentJs.includes("scripts/shortcuts.js"));
  assert.ok(contentJs.includes("scripts/dark-proxy.js"));
  assert.ok(contentJs.includes("scripts/dark-chrome-guard.js"));
  const darkProxy = (manifest.content_scripts || []).find((entry) =>
    (entry.js || []).includes("scripts/dark-proxy.js")
  );
  assert.equal(darkProxy?.world, "MAIN");
  assert.ok(manifest.web_accessible_resources?.[0]?.resources?.includes("styles/*/*.css"));
  assert.ok(manifest.action?.default_popup);
  assert.ok(manifest.permissions.includes("scripting"));
  assert.ok(manifest.host_permissions.includes("<all_urls>"));
  assert.ok(manifest.host_permissions.some((p) => p.includes("youtube.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("github.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("google.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("duckduckgo.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("x.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("twitter.com")));
  assert.ok(manifest.host_permissions.some((p) => p.includes("twitch.tv")));
  for (const file of ["icons/icon.svg", "icons/icon16.png", "icons/icon48.png", "icons/icon128.png"]) {
    assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  }
});

test("all stylesheet modules exist", () => {
  const js = read("scripts/content-script.js");
  const paths = [...js.matchAll(/"(styles\/[^"]+\.css)"/g)].map((m) => m[1]);
  assert.ok(paths.length > 40, `expected many style paths, got ${paths.length}`);
  for (const file of paths) {
    assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  }
  for (const site of SITE_STYLE_DIRS) {
    assert.ok(fs.existsSync(path.join(stylesDir, site)), `missing styles/${site}/`);
  }
  const rootCss = fs.readdirSync(stylesDir).filter((file) => file.endsWith(".css"));
  assert.deepEqual(rootCss, [], "CSS files should live in site folders, not styles/");
  assert.doesNotMatch(
    STYLE_FILES.map((file) => path.basename(file)).join("\n"),
    /theater-glass|theater-translucent|theater-solid|gh-transparency|gh-transparent-lists|gh-overlay-fixes|g-transparency|ddg-transparency|ddg-transparent-header|gmail-transparency|gemini-transparency|x-transparency|twtr-transparency/
  );
});

test("CSS files avoid Firefox-only syntax", () => {
  for (const file of STYLE_FILES) {
    const css = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);
    for (const rule of FORBIDDEN_PATTERNS) {
      assert.doesNotMatch(css, rule.pattern, `${rel} contains ${rule.name}`);
    }
  }
});

test("theater hover comments uses solid opaque background", () => {
  const css = read(style("youtube", "theater-hover-comments.css"));
  assert.match(css, /background:\s*#0f0f0f/);
  assert.match(css, /background:\s*#ffffff/);
  assert.doesNotMatch(css, /backdrop-filter/);
});

test("immersive search hides voice search and blurs page content on focus", () => {
  const css = read(style("youtube", "immersive-search.css"));
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
  const css = read(style("youtube", "theater-hide-header.css"));
  assert.match(css, /padding-bottom:\s*24px/);
  assert.match(css, /focus-within/);
});

test("theater layout follows zen view height and resets control bounds on exit", () => {
  const css = read(style("youtube", "theater-base.css"));
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
  const css = read(style("youtube", "theater-header-blur.css"));
  assert.match(css, /backdrop-filter:\s*blur\(5px\)/);
  assert.match(css, /background-color:\s*#0001/);
  assert.match(css, /#background\.ytd-masthead/);
});

test("immersive search includes transform fallbacks for scale", () => {
  const css = read(style("youtube", "immersive-search.css"));
  assert.match(css, /scale:\s*1\.05/);
  assert.match(css, /scale:\s*1\.1/);
});

test("github no tab text hides repo tab labels until hover", () => {
  const css = read(style("github", "gh-no-tab-text.css"));
  assert.match(css, /nav\[aria-label="Repository"\] > ul > li > a span\[data-component="text"\]/);
  assert.match(css, /nav\[aria-label="Repository"\] > ul > li > a:hover span\[data-component="text"\]/);
  assert.match(css, /width:\s*0em/);
  assert.match(css, /width:\s*9em/);
  assert.match(css, /\.UnderlineNav-item:hover \.Counter/);
  assert.match(css, /\.AppHeader-localBar \.Counter/);
  assert.doesNotMatch(css, /&\s*[:{]/);
});

test("github glass and layout mods skip page transparency", () => {
  const glass = read(style("github", "gh-glass-effect.css"));
  assert.match(glass, /light-dark\(#fff8, #0005\)/);
  assert.match(glass, /box-shadow:/);
  assert.match(glass, /\.CommentBox-container/);
  assert.doesNotMatch(glass, /html\s*,\s*body/);

  const borders = read(style("github", "gh-border-mods.css"));
  assert.match(borders, /border:\s*none/);
  assert.match(borders, /border-radius:\s*0\.5em/);
  assert.doesNotMatch(borders, /background:\s*none/);
  assert.doesNotMatch(borders, /background-color:\s*transparent/);

  const hover = read(style("github", "gh-hover.css"));
  assert.match(hover, /\.feed-left-sidebar:hover/);
  assert.match(hover, /\.feed-right-column:hover/);
  assert.doesNotMatch(hover, /&\s*[:{]/);

  const sidebar = read(style("github", "gh-repo-sidebar-hover.css"));
  assert.match(sidebar, /\.Layout-sidebar:hover \.BorderGrid-cell/);
  assert.doesNotMatch(sidebar, /&\s*[:{]/);

  const search = read(style("github", "gh-immersive-search.css"));
  assert.match(search, /header > \.search-expanded/);
  assert.match(search, /filter:\s*blur\(20px\)/);
  assert.match(search, /transform:\s*scale\(1\.05\)/);

  const timeline = read(style("github", "gh-timeline-badge.css"));
  assert.match(timeline, /\.TimelineItem-badge/);
  assert.doesNotMatch(timeline, /&\s*[:{]/);
});

test("google search mods skip page transparency", () => {
  const zoom = read(style("google", "g-search-zoom.css"));
  assert.match(zoom, /body:has\(\.A8SBwf\.emcav\) #main/);
  assert.match(zoom, /filter:\s*blur\(20px\)/);
  assert.match(zoom, /transform:\s*scale\(0\.98\)/);
  assert.match(zoom, /light-dark\(#fff5, #0007\)/);
  assert.match(zoom, /\.rfiSsc\.JiJthb/);
  assert.doesNotMatch(zoom, /&\s*[:{]/);
  assert.doesNotMatch(zoom, /html\s*,\s*body/);

  const glass = read(style("google", "g-glass-effect.css"));
  assert.match(glass, /div\.RNNXgb/);
  assert.match(glass, /box-shadow:/);
  assert.match(glass, /#rcnt \.hdzaWe/);
  assert.doesNotMatch(glass, /html\s*,\s*body/);
  assert.doesNotMatch(glass, /--darkreader-background-ffffff:\s*transparent/);

  const overlay = read(style("google", "g-overlay-fix.css"));
  assert.match(overlay, /#liveresults-sports-immersive__match-fullpage/);
  assert.match(overlay, /var\(--EpFNW\)/);
  assert.doesNotMatch(overlay, /background-color:\s*#00000000/);

  const chrome = read(style("google", "g-shadows-borders.css"));
  assert.match(chrome, /#sfooter/);
  assert.match(chrome, /box-shadow:\s*none/);
  assert.doesNotMatch(chrome, /background:\s*none/);

  const hover = read(style("google", "g-hover.css"));
  assert.match(hover, /\.rfiSsc:hover/);
  assert.match(hover, /opacity:\s*0/);
  assert.doesNotMatch(hover, /&\s*[:{]/);
});

test("duckduckgo mods skip page and header transparency", () => {
  const search = read(style("duckduckgo", "ddg-immersive-search.css"));
  assert.match(search, /#searchbox_input:focus/);
  assert.match(search, /\[data-testid="searchbox-form"\]:focus-within/);
  assert.match(search, /#react-search-form:focus-within/);
  assert.match(search, /#web_content_wrapper/);
  assert.match(search, /filter:\s*blur\(20px\)/);
  assert.match(search, /transform:\s*scale\(0\.98\)/);
  assert.match(search, /transition:\s*all 0\.3s ease-in-out/);
  assert.doesNotMatch(search, /&\s*[:{]/);
  assert.doesNotMatch(search, /html\s*,\s*body/);

  const popup = read(style("duckduckgo", "ddg-immersive-popup.css"));
  assert.match(popup, /body:has\(\.modal\.is-showing\) \.site-wrapper/);
  assert.match(popup, /filter:\s*blur\(20px\)/);
  assert.match(popup, /-webkit-backdrop-filter:\s*blur\(20px\)/);
  assert.doesNotMatch(popup, /&\s*[:{]/);
  assert.doesNotMatch(popup, /#header_wrapper \{\s*position:\s*relative/);
  assert.doesNotMatch(popup, /#searchbox_homepage > \.searchbox_hasQuery/);

  const glass = read(style("duckduckgo", "ddg-glass-effect.css"));
  assert.match(glass, /hsla\(0, 0%, 100%, 0\.08\)/);
  assert.match(glass, /\.searchbox_combobox__P9Gnn/);
  assert.doesNotMatch(glass, /--theme-bg-home:\s*transparent/);

  const animations = read(style("duckduckgo", "ddg-animations.css"));
  assert.match(animations, /transition-property:\s*filter/);
  assert.match(animations, /cubic-bezier\(0\.85, 0, 0\.15, 1\)/);

  const misc = read(style("duckduckgo", "ddg-misc.css"));
  assert.match(misc, /nav::before/);
  assert.match(misc, /\.js-ask-ai-chat-wrapper > form::after/);

  const learn = read(style("duckduckgo", "ddg-no-learn-more.css"));
  assert.match(learn, /#features/);
  assert.match(learn, /\.homepage-cta-section_scrollCta__Wmixn/);

  const promo = read(style("duckduckgo", "ddg-hidden-promo.css"));
  assert.match(promo, /\.desktop-homepage_heroContent__4HUFA/);

  const feedback = read(style("duckduckgo", "ddg-no-share-feedback.css"));
  assert.match(feedback, /\.TccjmKV6RraCaCw5L9gd/);

  const footer = read(style("duckduckgo", "ddg-no-footer.css"));
  assert.match(footer, /\.footer/);
  assert.doesNotMatch(footer, /background-color:\s*transparent/);
});

test("gmail mods skip page transparency and nested ampersands", () => {
  const borders = read(style("gmail", "gmail-no-borders.css"));
  assert.match(borders, /border:\s*none/);
  assert.match(borders, /\.aAU/);
  assert.doesNotMatch(borders, /background:\s*none/);
  assert.doesNotMatch(borders, /background-color:\s*transparent/);
  assert.doesNotMatch(borders, /&\s*[:{]/);

  const hidden = read(style("gmail", "gmail-hidden.css"));
  assert.match(hidden, /div\.apa\.nH\.oy8Mbf/);
  assert.match(hidden, /\.adC/);
  assert.doesNotMatch(hidden, /\[jsname="h50Ewe"\]/);
  assert.doesNotMatch(hidden, /&\s*[:{]/);

  const preview = read(style("gmail", "gmail-preview.css"));
  assert.match(preview, /--gm3-sys-color-on-surface/);
  assert.match(preview, /\.adn/);
  assert.doesNotMatch(preview, /\.a3s/);
  assert.doesNotMatch(preview, /\.ii\.gt/);
  assert.doesNotMatch(preview, /&\s*[:{]/);
  assert.doesNotMatch(preview, /html\s*,\s*body/);

  const glass = read(style("gmail", "gmail-glass.css"));
  assert.match(glass, /\[role="main"\]/);
  assert.match(glass, /--gm3-sys-color-surface-container-low/);
  assert.match(glass, /box-shadow:/);
  assert.doesNotMatch(glass, /rgba\(255,\s*255,\s*255/);
  assert.doesNotMatch(glass, /light-dark\(/);
  assert.doesNotMatch(glass, /html\s*,\s*body/);

  const rounded = read(style("gmail", "gmail-rounded-corners.css"));
  assert.match(rounded, /\[role="main"\]/);
  assert.match(rounded, /\.AO/);
  assert.match(rounded, /border-radius:\s*8px/);

  const loading = read(style("gmail", "gmail-flashbangless-loading.css"));
  assert.match(loading, /#loading \.la-e/);
  assert.match(loading, /filter:\s*blur\(20px\)/);
  assert.match(loading, /backdrop-filter:\s*blur\(5px\)/);
  assert.doesNotMatch(loading, /--darkreader-background-ffffff/);
  assert.doesNotMatch(loading, /brightness\(0\) invert\(1\)/);
  assert.doesNotMatch(loading, /html\s*,\s*body/);
});

test("gemini mods skip page transparency and nested ampersands", () => {
  const input = read(style("gemini", "gemini-better-text-input.css"));
  assert.match(input, /input-area-v2/);
  assert.match(input, /--bard-color-new-conversation-button/);
  assert.match(input, /!important/);
  assert.doesNotMatch(input, /ng-tns-c/);

  const other = read(style("gemini", "gemini-other-changes.css"));
  assert.match(other, /hallucination-disclaimer/);
  assert.match(other, /--bard-color-neutral-96/);
  assert.doesNotMatch(other, /html\s*,\s*body/);
  assert.doesNotMatch(other, /--gem-sys-color--surface:\s*#00000000/);

  const hover = read(style("gemini", "gemini-hover.css"));
  assert.match(hover, /bard-sidenav:hover/);
  assert.match(hover, /mat-sidenav:hover/);
  assert.match(hover, /top-bar-actions:hover/);
  assert.match(hover, /opacity:\s*0\.01/);
  assert.doesNotMatch(hover, /&\s*[:{]/);

  const glass = read(style("gemini", "gemini-input-code.css"));
  assert.match(glass, /\.code-block/);
  assert.match(glass, /--gem-sys-color--surface-container-high/);
  assert.doesNotMatch(glass, /light-dark\(#fff8/);
  assert.doesNotMatch(glass, /&\s*[:{]/);
});

test("x mods skip page transparency and nested ampersands", () => {
  const overlay = read(style("x", "x-overlay-fix.css"));
  assert.match(overlay, /\[data-testid="Dropdown"\]/);
  assert.match(overlay, /\[role="dialog"\]/);
  assert.match(overlay, /Canvas/);
  assert.doesNotMatch(overlay, /html\s*,\s*body/);
  assert.doesNotMatch(overlay, /background-color:\s*transparent/);

  const layout = read(style("x", "x-layout-fixes.css"));
  assert.match(layout, /\[data-testid="primaryColumn"\]/);
  assert.match(layout, /top:\s*-50px/);

  const hover = read(style("x", "x-hover.css"));
  assert.match(hover, /header\[role="banner"\]:hover/);
  assert.match(hover, /\[data-testid="sidebarColumn"\]:hover/);
  assert.doesNotMatch(hover, /&\s*[:{]/);

  const thanks = read(style("x", "x-no-thanks.css"));
  assert.match(thanks, /Subscribe to Premium/);
  assert.match(thanks, /super-upsell-UpsellCardRenderProperties/);
  assert.match(thanks, /premium/);
});

test("twitch mods skip page transparency and nested ampersands", () => {
  const footer = read(style("twitch", "twitch-no-footer.css"));
  assert.match(footer, /footer/);
  assert.match(footer, /display:\s*none/);
  assert.match(footer, /\.channel-root__info/);
  assert.doesNotMatch(footer, /background-color:\s*transparent/);
  assert.doesNotMatch(footer, /background:\s*none/);
  assert.doesNotMatch(footer, /&\s*[:{]/);
  assert.doesNotMatch(footer, /html\s*,\s*body/);
  assert.doesNotMatch(footer, /persistent-player--theatre/);
});

test("popup assets exist and reference each other", () => {
  const html = read("popup/popup.html");
  assert.match(html, /popup\.css/);
  assert.match(html, /\.\.\/scripts\/popup\.js/);
  assert.match(html, /\.\.\/scripts\/sites\.js/);
  assert.match(html, /id="site-rail"/);
  assert.match(html, /id="current-pane"/);
  assert.match(html, /id="other-sites-list"/);
  assert.match(html, /id="theme-toggle"/);
  assert.match(html, /id="settings-open"/);
  assert.match(html, /id="settings-view"/);
  assert.match(html, /id="settings-back"/);
  assert.match(html, /id="mod-search"/);
  assert.match(html, /data-icon="action-reload"/);
  assert.match(html, /data-icon="dark-skip-native"/);
  assert.match(html, /\.\.\/scripts\/dark-sites\.js/);
  assert.match(html, /\.\.\/scripts\/shortcuts\.js/);
  assert.match(html, /\.\.\/scripts\/style-request\.js/);
  assert.match(html, /header-frost/);
  assert.match(html, /search-frost/);
  assert.match(html, /search-title/);
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
  assert.match(js, /"gmail-glass"/);
  assert.match(js, /gmail-glass\.css/);
  assert.match(js, /"gemini-input-code"/);
  assert.match(js, /gemini-input-code\.css/);
  assert.match(js, /"x-overlay-fix"/);
  assert.match(js, /x-overlay-fix\.css/);
  assert.match(js, /"twitch-no-footer"/);
  assert.match(js, /twitch-no-footer\.css/);
  assert.doesNotMatch(js, /gh-transparency|gh-transparent-lists|gh-overlay-fixes|g-transparency|ddg-transparency|ddg-transparent-header|gmail-transparency|gemini-transparency|x-transparency|twitch-transparency/);
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
  assert.match(js, /importScripts/);
  assert.match(js, /CHROMODS_SHORTCUT_RUN/);
  assert.match(js, /chrome\.commands\.onCommand/);
  assert.match(js, /chromodsApplyShortcutCommand/);
  assert.match(js, /chromodsApplyDarkShortcut/);
  assert.match(js, /captureVisibleTab/);
  assert.match(js, /CHROMODS_DARK_WIPE/);
  assert.doesNotMatch(js, /broadcastSettings/);
});

test("popup applies toggles through storage without page messaging", () => {
  const js = read("scripts/popup.js");
  assert.match(js, /chrome\.storage\.sync\.set/);
  assert.match(js, /updateMasterState/);
  assert.match(js, /lastFocusedWindow/);
  assert.match(js, /scrollToSite/);
  assert.match(js, /CHROMODS_DARK_PING/);
  assert.match(js, /CHROMODS_DARK_WIPE/);
  assert.match(js, /captureVisibleTab/);
  assert.match(js, /setSettingsOpen/);
  assert.match(js, /renderSearchResults/);
  assert.match(js, /setSearchFocused/);
  assert.match(js, /--search-lift/);
  assert.match(js, /stampStaticIcons/);
  assert.match(js, /chromodsSetDarkSiteTheme/);
  assert.match(js, /CHROMODS_DARK_THEME_UPDATE/);
  assert.match(js, /queueDarkThemeSave/);
  assert.match(js, /readDarkConfigFromUi/);
  assert.match(js, /__chromodsApplyDarkTheme/);
  assert.match(js, /requestAnimationFrame/);
  assert.match(js, /executeScript/);
  assert.match(js, /chromodsSetShortcut/);
  assert.doesNotMatch(
    js,
    /notifyAllYouTubeTabs|showPageToast|showToast|youtube-theming-toast|chromods-toast/
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
  assert.match(js, /site:\s*"gmail"/);
  assert.match(js, /site:\s*"gemini"/);
  assert.match(js, /site:\s*"x"/);
  assert.match(js, /site:\s*"twitch"/);
  assert.match(js, /gmail-glass/);
  assert.match(js, /gemini-input-code/);
  assert.match(js, /x-overlay-fix/);
  assert.match(js, /twitch-no-footer/);
  assert.match(js, /feature\.site\s*\?\?=\s*"youtube"/);
  assert.doesNotMatch(
    js,
    /new-to-you-first|transparent-header|transparent-player|viewstats-theme|timed-comments-theme|gh-transparency|gh-transparent-lists|g-transparency|ddg-transparency|gmail-transparency|gemini-transparency|x-transparency|twitch-transparency/
  );
  assert.doesNotMatch(js, /commentsBackground|theater-glass|Glass \+ blur/);
});

test("hostname matching maps YouTube, GitHub, Google, DuckDuckGo, Gmail, Gemini, X, and Twitch URLs", () => {
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
  assert.equal(api.matchSiteFromUrl("https://mail.google.com/")?.id, "gmail");
  assert.equal(api.matchSiteFromUrl("https://gemini.google.com/")?.id, "gemini");
  assert.equal(api.matchSiteFromUrl("https://docs.google.com/"), null);
  assert.equal(api.matchSiteFromUrl("https://duckduckgo.com/?q=x")?.id, "duckduckgo");
  assert.equal(api.matchSiteFromUrl("https://start.duckduckgo.com/")?.id, "duckduckgo");
  assert.equal(api.matchSiteFromUrl("https://lite.duckduckgo.com/lite/")?.id, "duckduckgo");
  assert.equal(api.matchSiteFromUrl("https://x.com/home")?.id, "x");
  assert.equal(api.matchSiteFromUrl("https://twitter.com/home")?.id, "x");
  assert.equal(api.matchSiteFromUrl("https://www.twitch.tv/foo")?.id, "twitch");
  assert.equal(api.matchSiteFromUrl("https://twitch.tv/")?.id, "twitch");
  assert.equal(api.matchSiteFromUrl("https://example.com/"), null);
});

test("site registry detects YouTube, GitHub, Google, DuckDuckGo, Gmail, Gemini, X, and Twitch hosts", () => {
  const js = read("scripts/sites.js");
  assert.match(js, /id:\s*"youtube"/);
  assert.match(js, /id:\s*"github"/);
  assert.match(js, /id:\s*"google"/);
  assert.match(js, /id:\s*"gmail"/);
  assert.match(js, /id:\s*"gemini"/);
  assert.match(js, /id:\s*"duckduckgo"/);
  assert.match(js, /id:\s*"x"/);
  assert.match(js, /id:\s*"twitch"/);
  assert.match(js, /youtube\.com/);
  assert.match(js, /github\.com/);
  assert.match(js, /google\.com/);
  assert.match(js, /mail\.google\.com/);
  assert.match(js, /gemini\.google\.com/);
  assert.match(js, /duckduckgo\.com/);
  assert.match(js, /x\.com/);
  assert.match(js, /twitter\.com/);
  assert.match(js, /twitch\.tv/);
  assert.match(js, /matchSiteFromUrl/);
  assert.match(js, /matchSiteFromHostname/);
  assert.match(js, /hostnamePattern/);
});

test("popup categories have custom icons and animated expansion", () => {
  const js = read("scripts/icons.js");
  const css = read("popup/popup.css");
  assert.match(js, /category-live/);
  assert.match(js, /category-appearance/);
  assert.match(js, /dark-brightness/);
  assert.match(js, /dark-contrast/);
  assert.match(js, /dark-sepia/);
  assert.match(js, /dark-grayscale/);
  assert.match(js, /action-reload/);
  assert.match(js, /ui-keyboard/);
  assert.match(js, /shortcut-dark/);
  assert.match(js, /site-youtube/);
  assert.match(js, /site-github/);
  assert.match(js, /site-google/);
  assert.match(js, /site-duckduckgo/);
  assert.match(js, /site-gmail/);
  assert.match(js, /site-gemini/);
  assert.match(js, /site-x/);
  assert.match(js, /site-twitch/);
  assert.match(js, /#C5221F/);
  assert.match(js, /#FC413D/);
  assert.match(js, /#00B95C/);
  assert.doesNotMatch(js, /M11\.04 19\.32Q12 21\.51 12 24/);
  assert.match(js, /#DE5833/);
  assert.match(js, /#FDD20A/);
  assert.match(js, /#65BC46/);
  assert.match(js, /#9146FF/);
  assert.match(css, /category-expansion/);
  assert.match(css, /feature-expansion/);
  assert.match(css, /site-rail/);
  assert.match(css, /other-sites/);
  assert.match(css, /other-sites-list/);
  assert.match(css, /subgrid/);
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
  assert.match(css, /\.theme-toggle/);
  assert.match(css, /\.theme-rays/);
  assert.match(css, /\.theme-cut/);
  assert.match(css, /\.settings-view/);
  assert.match(css, /translateX\(100%\)/);
  assert.match(css, /overscroll-behavior:\s*contain/);
  assert.match(css, /--popup-max-height:\s*600px/);
  assert.doesNotMatch(css, /\.shell\.is-settings-open\s*\{\s*height:/);
  assert.match(css, /\.search-wrap/);
  assert.match(css, /is-search-focused/);
  assert.match(css, /\.shell\.is-search-focused \.container/);
  assert.match(css, /\.search-frost/);
  assert.match(css, /\.shell\.is-search-focused \.search-frost/);
  assert.match(css, /\.shell\.is-search-focused \.search-frost-dots/);
  assert.match(css, /\.shell\.is-search-focused \.header-frost-dots/);
  assert.match(css, /\.shell\.is-search-focused \.header-glass/);
  assert.match(css, /cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/);
  assert.match(css, /\.search-title/);
  assert.match(css, /\.shell\.is-search-focused \.search-title/);
  assert.match(css, /\.shell\.is-search-focused \.app-header/);
  assert.match(css, /input::placeholder/);
  assert.match(css, /--search-lift/);
  assert.doesNotMatch(css, /filter:\s*blur\(10px\)/);
  assert.doesNotMatch(css, /\.shell\.is-search-focused \.header-top\s*\{[^}]*max-height:\s*0/s);
  assert.match(css, /\.shortcut-bind/);
  assert.match(css, /\.dark-slider-row/);
});

test("popup uses aligned feature toggles and a compact style request", () => {
  const css = read("popup/popup.css");
  const popup = read("scripts/popup.js");
  const request = read("scripts/style-request.js");

  assert.match(css, /\.feature-header\s*\{[^}]*grid-template-areas:/s);
  assert.match(css, /"title switch"/);
  assert.match(css, /\.heading-actions/);
  assert.match(css, /\.heading-actions\s*\{[^}]*gap:\s*12px/s);
  assert.doesNotMatch(css, /\.site-accordion-bar \.heading-actions\s*\{[^}]*gap:\s*0/);
  assert.match(css, /\.unsupported-bar/);
  assert.match(css, /\.unsupported-tag/);
  assert.match(css, /\.request-style-btn/);
  assert.match(css, /\.switch-check/);
  assert.match(css, /--knob-on/);
  assert.doesNotMatch(css, /\.empty-current/);

  assert.match(popup, /renderUnsupportedBar/);
  assert.match(popup, /openStyleRequest/);
  assert.match(popup, /chromodsFindExistingStyleRequest/);
  assert.match(popup, /Request styling/);
  assert.match(popup, /function renderSwitch/);
  assert.match(popup, /switch-check/);
  assert.doesNotMatch(popup, /No supported site in this tab/);
  assert.match(popup, /collapsedOtherSites\.add\(site\.id\)/);
  assert.match(popup, /renderOtherSitePanel\(site,\s*false\)/);

  assert.match(request, /T3lluz\/ChroMods|owner:\s*"T3lluz"/);
  assert.match(request, /\[STYLE\]/);
  assert.match(request, /api\.github\.com\/search\/issues/);
});

test("global dark mode uses Dark Reader and remembers per host", () => {
  const html = read("popup/popup.html");
  const popup = read("scripts/popup.js");
  const darkMode = read("scripts/dark-mode.js");
  const darkSites = read("scripts/dark-sites.js");
  const background = read("scripts/background.js");
  const vendor = read("scripts/vendor/darkreader.js");
  const proxy = read("scripts/dark-proxy.js");

  assert.match(html, /id="theme-toggle"/);
  assert.match(html, /id="dark-skip-native"/);
  assert.match(html, /Don’t invert sites that already have native dark/);
  assert.match(html, /scripts\/dark-sites\.js/);
  assert.match(html, /scripts\/shortcuts\.js/);
  assert.match(popup, /chromodsSetDarkSite/);
  assert.match(popup, /ensureDarkModeScript/);
  assert.match(popup, /world:\s*"MAIN"/);
  assert.match(darkSites, /chroModsDarkMode/);
  assert.match(darkSites, /chromodsDarkHostFromUrl/);
  assert.match(darkSites, /chromods-dark-wipe/);
  assert.match(darkSites, /chromodsSetDarkSiteTheme/);
  assert.match(darkSites, /chromodsDarkReaderTheme/);
  assert.match(darkSites, /icon:\s*"dark-brightness"/);
  assert.match(darkSites, /immediateModify:\s*true/);
  assert.match(darkSites, /skipNativeDark/);
  assert.match(darkSites, /chromodsPageLooksNativelyDark/);
  assert.match(darkMode, /DarkReader\.enable/);
  assert.match(darkMode, /DR_FIXES/);
  assert.match(darkMode, /__chromodsApplyDarkTheme/);
  assert.match(darkMode, /DarkReader\.enable\(\s*theme/);
  assert.doesNotMatch(darkMode, /backdrop-filter/);
  assert.doesNotMatch(darkMode, /chromodsDarkAdjustmentFilters/);
  assert.match(darkMode, /shouldSkipNativeDark|chromodsPageLooksNativelyDark/);
  assert.match(darkMode, /CHROMODS_DARK_THEME_UPDATE/);
  assert.match(darkMode, /message\.config/);
  assert.match(darkMode, /chromodsDarkReaderTheme|themeForHost/);
  assert.match(darkMode, /theme\.brightness/);
  assert.match(darkMode, /__chromodsDarkEnabled/);
  assert.match(darkMode, /darkreader--fallback/);
  assert.match(darkMode, /CHROMODS_DARK_WIPE/);
  assert.match(darkMode, /wipeFromScreenshot/);
  assert.match(darkMode, /--chromods-wipe-r/);
  assert.match(darkMode, /radial-gradient/);
  assert.doesNotMatch(darkMode, /startViewTransition/);
  assert.doesNotMatch(darkMode, /::view-transition/);
  assert.match(darkMode, /CHROMODS_DARK_FETCH/);
  assert.match(background, /chromods-dark-fetch/);
  assert.match(read("scripts/shortcuts.js"), /chromods-shortcut-run/);
  assert.match(read("scripts/shortcuts.js"), /__chromodsSendMessage/);
  assert.match(read("manifest.json"), /"toggle-dark"/);
  assert.match(read("manifest.json"), /"toggle-mods"/);
  assert.match(read("manifest.json"), /Alt\+Shift\+D/);
  assert.doesNotMatch(background, /registerContentScripts/);
  assert.match(proxy, /function injectProxy/);
  assert.match(proxy, /__darkreader__cleanUp/);
  assert.match(vendor, /Dark Reader v4\./);
  assert.match(vendor, /darkreader\.org/);
  assert.doesNotMatch(darkMode, /chrome\.debugger/);
});

test("README lists every live site and is generated from metadata", () => {
  const readme = read("README.md");
  const sites = ["youtube", "github", "google", "gmail", "gemini", "duckduckgo", "x", "twitch"];
  for (const site of sites) {
    assert.match(readme, new RegExp(`docs/sites/${site}\\.svg`));
    assert.ok(fs.existsSync(path.join(root, "docs/sites", `${site}.svg`)));
  }
  assert.match(readme, /icons\/icon\.svg/);
  assert.match(readme, /Generated by scripts\/generate-readme\.mjs/);
});
