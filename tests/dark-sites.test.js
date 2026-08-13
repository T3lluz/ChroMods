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
