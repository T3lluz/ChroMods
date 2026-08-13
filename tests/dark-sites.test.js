import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadDarkSites() {
  const source = fs.readFileSync(path.join(root, "scripts/dark-sites.js"), "utf8");
  const context = {
    URL,
    chrome: {
      storage: {
        local: {
          get: async () => ({}),
          set: async () => {},
        },
      },
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

test("dark mode host keys work on any http(s) site", () => {
  const api = loadDarkSites();
  assert.equal(api.chromodsDarkHostFromUrl("https://www.Example.com/path?q=1"), "example.com");
  assert.equal(api.chromodsDarkHostFromUrl("http://news.ycombinator.com/item?id=1"), "news.ycombinator.com");
  assert.equal(api.chromodsDarkHostFromUrl("https://gist.github.com/user"), "gist.github.com");
  assert.equal(api.chromodsDarkHostKey("www.github.com"), "github.com");
  assert.equal(api.chromodsIsDarkHostEnabled({ "example.com": true }, "www.example.com"), true);
  assert.equal(api.chromodsIsDarkHostEnabled({ "example.com": true }, "other.com"), false);
  assert.equal(
    api.chromodsIsDarkHostEnabled({ "example.com": { enabled: true, brightness: 110 } }, "example.com"),
    true
  );
  assert.equal(
    api.chromodsIsDarkHostEnabled({ "example.com": { enabled: false, brightness: 110 } }, "example.com"),
    false
  );
});

test("dark mode site themes merge per host", () => {
  const api = loadDarkSites();
  const custom = api.chromodsNormalizeDarkSite({ enabled: true, brightness: 130, sepia: 20 });
  assert.equal(custom.brightness, 130);
  assert.equal(custom.sepia, 20);
  assert.equal(custom.contrast, 100);
  assert.equal(custom.styleSystemControls, true);

  const theme = api.chromodsDarkReaderTheme(custom);
  assert.equal(theme.brightness, 130);
  assert.equal(theme.sepia, 20);
  assert.equal(theme.mode, 1);
  assert.equal(theme.darkSchemeBackgroundColor, "#181a1b");

  const fromBoolean = api.chromodsNormalizeDarkSite(true);
  assert.equal(fromBoolean.enabled, true);
  assert.equal(fromBoolean.brightness, 100);
  assert.equal(fromBoolean.skipNativeDark, true);
  assert.equal(api.chromodsDarkSiteHasCustomTheme(fromBoolean), false);
  assert.equal(api.chromodsDarkSiteHasCustomTheme(custom), true);
  assert.equal(api.chromodsDarkSiteHasCustomTheme({ skipNativeDark: false }), true);
  assert.equal(theme.immediateModify, true);
  assert.equal(
    api.chromodsNormalizeDarkSite({ enabled: true, skipNativeDark: false }).skipNativeDark,
    false
  );
  assert.equal(
    api.chromodsDarkEnabledHosts({ "b.com": true, "a.com": { enabled: true } }).join(","),
    "a.com,b.com"
  );
});

test("dark mode skips browser and store pages", () => {
  const api = loadDarkSites();
  assert.equal(api.chromodsDarkHostFromUrl("chrome://extensions"), null);
  assert.equal(api.chromodsDarkHostFromUrl("about:blank"), null);
  assert.equal(api.chromodsDarkHostFromUrl("chrome-extension://abcdef/popup/popup.html"), null);
  assert.equal(api.chromodsDarkHostFromUrl("https://chromewebstore.google.com/detail/foo"), null);
  assert.equal(
    api.chromodsDarkHostFromUrl("https://chrome.google.com/webstore/detail/foo"),
    null
  );
});

test("native dark detection uses page theme signals, not prefers-color-scheme", () => {
  const api = loadDarkSites();

  function mockEl(attrs = {}, className = "") {
    return {
      className,
      hasAttribute(name) {
        return Object.prototype.hasOwnProperty.call(attrs, name);
      },
      getAttribute(name) {
        return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
      },
    };
  }

  assert.equal(
    api.chromodsPageLooksNativelyDark({
      documentElement: mockEl({ dark: "" }),
      body: mockEl(),
    }),
    true
  );
  assert.equal(
    api.chromodsPageLooksNativelyDark({
      documentElement: mockEl({ "data-color-mode": "dark" }),
      body: mockEl(),
    }),
    true
  );
  assert.equal(
    api.chromodsPageLooksNativelyDark({
      documentElement: mockEl({ "data-theme": "light" }),
      body: mockEl(),
    }),
    false
  );
  assert.equal(
    api.chromodsPageLooksNativelyDark({
      documentElement: mockEl({}, "theme-dark"),
      body: mockEl(),
    }),
    true
  );
  assert.equal(
    api.chromodsPageLooksNativelyDark({
      documentElement: mockEl({}, "darkreader"),
      body: mockEl(),
    }),
    false
  );
  assert.equal(
    api.chromodsPageLooksNativelyDark({
      documentElement: mockEl({ "data-darkreader-mode": "dynamic" }),
      body: mockEl(),
      defaultView: {
        getComputedStyle() {
          return { colorScheme: "dark" };
        },
      },
    }),
    false
  );
  assert.equal(
    api.chromodsPageLooksNativelyDark({
      documentElement: mockEl(),
      body: mockEl(),
      defaultView: {
        getComputedStyle() {
          return { colorScheme: "dark" };
        },
      },
    }),
    true
  );
  assert.equal(
    api.chromodsPageLooksNativelyDark({
      documentElement: mockEl(),
      body: mockEl(),
      defaultView: {
        getComputedStyle() {
          return { colorScheme: "light dark" };
        },
      },
    }),
    false
  );
});
