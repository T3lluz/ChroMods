import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadStyleRequest() {
  const source = fs.readFileSync(path.join(root, "scripts/style-request.js"), "utf8");
  const context = { URL, URLSearchParams, fetch };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

test("style requests only apply to http(s) pages", () => {
  const api = loadStyleRequest();
  assert.equal(api.chromodsRequestableHostFromUrl("https://www.Reddit.com/r/foo"), "reddit.com");
  assert.equal(api.chromodsRequestableHostFromUrl("http://news.ycombinator.com/item?id=1"), "news.ycombinator.com");
  assert.equal(api.chromodsRequestableHostFromUrl("chrome://extensions"), null);
  assert.equal(api.chromodsRequestableHostFromUrl("chrome-extension://abc/popup/popup.html"), null);
  assert.equal(api.chromodsRequestableHostFromUrl("https://chromewebstore.google.com/detail/x"), null);
  assert.equal(api.chromodsRequestableHostFromUrl(""), null);
});

test("style request issue URL prefills the ChroMods repo", () => {
  const api = loadStyleRequest();
  const url = api.chromodsStyleRequestIssueUrl("reddit.com", "https://www.reddit.com/r/foo");
  const parsed = new URL(url);
  assert.equal(parsed.origin, "https://github.com");
  assert.equal(parsed.pathname, "/T3lluz/ChroMods/issues/new");
  assert.equal(parsed.searchParams.get("title"), "[STYLE] reddit.com");
  assert.match(parsed.searchParams.get("body") ?? "", /reddit\.com/);
  assert.match(parsed.searchParams.get("body") ?? "", /https:\/\/www\.reddit\.com\/r\/foo/);
});

test("existing style requests prefer an open issue for the host", () => {
  const api = loadStyleRequest();
  const match = api.chromodsMatchStyleRequestIssue(
    [
      { title: "[STYLE] other.com", state: "open", html_url: "https://github.com/T3lluz/ChroMods/issues/1" },
      { title: "[STYLE] reddit.com", state: "open", html_url: "https://github.com/T3lluz/ChroMods/issues/2" },
    ],
    "reddit.com"
  );
  assert.equal(match.htmlUrl, "https://github.com/T3lluz/ChroMods/issues/2");
  assert.equal(api.chromodsMatchStyleRequestIssue([], "reddit.com"), null);
  assert.equal(
    api.chromodsMatchStyleRequestIssue(
      [{ title: "[STYLE] reddit.com", state: "closed", html_url: "https://github.com/T3lluz/ChroMods/issues/3" }],
      "reddit.com"
    ),
    null
  );
});
