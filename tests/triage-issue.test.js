import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  parseStyleHost,
  parseFeatureBlocks,
  portableFeatures,
  classifyIssue,
  buildCloudAgentPrompt,
} from "../scripts/triage-issue.mjs";
import { buildAgentPayload, parseAgentResponse } from "../scripts/launch-cloud-agent.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TWITCH_CSS = `/* twitch-transparency */
html, body { background: transparent !important; }

/* twitch-no footer */
footer { display: none !important; }
`;

function mockFetch(files) {
  return async (url) => {
    const key = String(url);
    for (const [suffix, body] of Object.entries(files)) {
      if (key.endsWith(suffix) || key === suffix) {
        return { ok: true, status: 200, text: async () => body };
      }
    }
    return { ok: false, status: 404, text: async () => "" };
  };
}

test("parses [STYLE] hosts from titles and request bodies", () => {
  assert.equal(parseStyleHost("[STYLE] twitch.tv", ""), "twitch.tv");
  assert.equal(parseStyleHost("[STYLE] www.Reddit.com", ""), "reddit.com");
  assert.equal(
    parseStyleHost("Need styling", "**URL:** https://www.twitch.tv/foo\n\n*Requested from the ChroMods popup.*"),
    "twitch.tv"
  );
  assert.equal(parseStyleHost("Fix the player blur", "something is broken"), null);
});

test("skips Zen transparency feature blocks", () => {
  const blocks = parseFeatureBlocks(TWITCH_CSS);
  assert.equal(blocks.length, 2);
  assert.deepEqual(
    portableFeatures(blocks).map((block) => block.id),
    ["twitch-no footer"]
  );
});

test("already-ported hosts are skipped", async () => {
  const result = await classifyIssue(
    { title: "[STYLE] youtube.com", body: "Please add styling for youtube.com." },
    { root, fetchImpl: mockFetch({}) }
  );
  assert.equal(result.verdict, "skip");
  assert.equal(result.reason, "already-ported");

  const twitch = await classifyIssue(
    { title: "[STYLE] twitch.tv", body: "Please add styling for twitch.tv." },
    { root, fetchImpl: mockFetch({}) }
  );
  assert.equal(twitch.verdict, "skip");
  assert.equal(twitch.reason, "already-ported");
});

test("style requests with upstream CSS are simple ports", async () => {
  const result = await classifyIssue(
    {
      title: "[STYLE] reddit.com",
      body: "Please add styling for **reddit.com**.\n\n**URL:** https://www.reddit.com/",
    },
    {
      root,
      fetchImpl: mockFetch({
        "css-mapping.json": "{}",
        "websites/reddit.com.css": TWITCH_CSS.replaceAll("twitch", "reddit"),
      }),
    }
  );
  assert.equal(result.verdict, "simple");
  assert.equal(result.host, "reddit.com");
  assert.equal(result.upstreamFile, "websites/reddit.com.css");
  assert.deepEqual(result.portableFeatures, ["reddit-no footer"]);
  assert.equal(result.label, "auto-pr");
});

test("missing upstream CSS is NeedsAttention", async () => {
  const result = await classifyIssue(
    { title: "[STYLE] no-such-site.example", body: "" },
    { root, fetchImpl: mockFetch({ "css-mapping.json": "{}" }) }
  );
  assert.equal(result.verdict, "complex");
  assert.equal(result.reason, "no-upstream-css");
  assert.equal(result.label, "NeedsAttention");
});

test("non-style issues are NeedsAttention", async () => {
  const result = await classifyIssue(
    { title: "Player overlay is broken on theater mode", body: "Help" },
    { root, fetchImpl: mockFetch({}) }
  );
  assert.equal(result.verdict, "complex");
  assert.equal(result.reason, "not-style-request");
});

test("queued issues are not launched twice", async () => {
  const result = await classifyIssue(
    { title: "[STYLE] twitch.tv", labels: ["auto-pr"] },
    { root, fetchImpl: mockFetch({}) }
  );
  assert.equal(result.verdict, "skip");
  assert.equal(result.reason, "already-queued");
});

test("transparency-only upstream CSS is NeedsAttention", async () => {
  const result = await classifyIssue(
    { title: "[STYLE] glass.example", body: "" },
    {
      root,
      fetchImpl: mockFetch({
        "css-mapping.json": "{}",
        "websites/glass.example.css": "/* example-transparency */\nhtml { background: transparent; }\n",
      }),
    }
  );
  assert.equal(result.verdict, "complex");
  assert.equal(result.reason, "transparency-only");
});

test("cloud agent prompt asks for a PR that closes the issue", () => {
  const prompt = buildCloudAgentPrompt({
    issue: {
      number: 1,
      title: "[STYLE] twitch.tv",
      url: "https://github.com/T3lluz/ChroMods/issues/1",
      body: "Please add styling for twitch.tv.",
    },
    classification: {
      host: "twitch.tv",
      upstreamUrl: "https://raw.githubusercontent.com/sameerasw/my-internet/main/websites/twitch.tv.css",
      upstreamFile: "websites/twitch.tv.css",
      portableFeatures: ["twitch-no footer"],
    },
  });
  assert.match(prompt, /Fixes #1/);
  assert.match(prompt, /twitch\.tv/);
  assert.match(prompt, /Do not push to main/);
  assert.match(prompt, /npm run readme/);
  assert.match(prompt, /Do not hand-edit README\.md/);
  assert.match(prompt, /Do NOT drop an entire/);
  assert.match(prompt, /FULL upstream file/);
});

test("music.youtube.com is a new site even though it suffixes youtube.com", async () => {
  const result = await classifyIssue(
    { title: "[STYLE] music.youtube.com", body: "" },
    {
      root,
      fetchImpl: mockFetch({
        "css-mapping.json": "{}",
        "websites/music.youtube.com.css": "/* ytm-glass $ Frosted player */\n#player { border-radius: 12px; }\n",
      }),
    }
  );
  assert.equal(result.verdict, "simple");
  assert.equal(result.host, "music.youtube.com");
});

test("issue triage workflow launches a cloud agent instead of pushing to main", () => {
  const yaml = fs.readFileSync(path.join(root, ".github/workflows/issue-triage.yml"), "utf8");
  assert.match(yaml, /types:\s*\[opened/);
  assert.match(yaml, /CURSOR_API_KEY/);
  assert.match(yaml, /launch-cloud-agent\.mjs/);
  assert.doesNotMatch(yaml, /git push origin main/);
});

test("cloud agent payload enables autoCreatePR", () => {
  const payload = buildAgentPayload({
    classification: { host: "twitch.tv", prompt: "Port twitch.tv" },
    repoUrl: "https://github.com/T3lluz/ChroMods",
  });
  assert.equal(payload.autoCreatePR, true);
  assert.equal(payload.workOnCurrentBranch, false);
  assert.equal(payload.repos[0].startingRef, "main");
  const parsed = parseAgentResponse({
    agent: { id: "bc-test", url: "https://cursor.com/agents/bc-test" },
  });
  assert.equal(parsed.id, "bc-test");
});
