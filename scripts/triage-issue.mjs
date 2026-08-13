import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const UPSTREAM_REPO = "sameerasw/my-internet";
const UPSTREAM_BRANCH = "main";
const UPSTREAM_RAW = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${UPSTREAM_BRANCH}`;
const STYLE_TITLE = /^\[STYLE\]\s+(\S+)/i;
const LABEL_AUTO_PR = "auto-pr";
const LABEL_NEEDS_ATTENTION = "NeedsAttention";

function repoRootFrom(cwd = process.cwd()) {
  return path.resolve(cwd);
}

function loadSiteApi(root) {
  const source = fs.readFileSync(path.join(root, "scripts/sites.js"), "utf8");
  return new Function(`${source}; return { SITE_META, matchSiteFromHostname, normalizeHostname };`)();
}

export function parseStyleHost(title = "", body = "") {
  const fromTitle = String(title).match(STYLE_TITLE);
  if (fromTitle) {
    return normalizeHost(fromTitle[1]);
  }

  const urlMatch = String(body).match(/\*\*URL:\*\*\s+(\S+)/i) || String(body).match(/https?:\/\/[^\s)]+/i);
  if (!urlMatch) return null;
  try {
    const host = new URL(urlMatch[1] || urlMatch[0]).hostname;
    return normalizeHost(host);
  } catch {
    return null;
  }
}

export function normalizeHost(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./i, "")
    .toLowerCase();
}

export function hostLookupCandidates(host) {
  const normalized = normalizeHost(host);
  if (!normalized) return [];
  const parts = normalized.split(".").filter(Boolean);
  const candidates = [normalized];
  while (parts.length > 2) {
    parts.shift();
    candidates.push(parts.join("."));
  }
  return [...new Set(candidates)];
}

export function parseFeatureBlocks(css) {
  const text = String(css || "");
  const headers = [];
  const re = /\/\*\s*([\s\S]*?)\s*\*\//g;
  let match;
  while ((match = re.exec(text))) {
    headers.push({
      idText: match[1].replace(/\s+/g, " ").trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  if (headers.length === 0) {
    const cssOnly = text.trim();
    return cssOnly ? [{ id: "site", description: "", css: cssOnly }] : [];
  }

  const blocks = [];
  const lead = text.slice(0, headers[0].start).trim();
  if (lead) blocks.push({ id: "ungrouped", description: "", css: lead });

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const next = headers[i + 1];
    const body = text.slice(header.end, next ? next.start : text.length).trim();
    const dollar = header.idText.indexOf("$");
    const id = (dollar >= 0 ? header.idText.slice(0, dollar) : header.idText).trim();
    const description = dollar >= 0 ? header.idText.slice(dollar + 1).trim() : "";
    blocks.push({ id, description, css: body });
  }
  return blocks;
}

export function isTransparencyFeature(block) {
  return /transparenc/i.test(`${block?.id || ""} ${block?.description || ""}`);
}

export function portableFeatures(blocks) {
  return (blocks || []).filter((block) => !isTransparencyFeature(block) && String(block.css || "").trim());
}

function invertCssMapping(mapping) {
  const byHost = new Map();
  for (const [file, hosts] of Object.entries(mapping || {})) {
    for (const host of hosts || []) {
      const normalized = normalizeHost(String(host).replace(/^[-+]/, ""));
      if (normalized) byHost.set(normalized, file);
    }
  }
  return byHost;
}

function fileNameCandidates(host) {
  return [`${host}.css`, `+${host}.css`, `-${host}.css`];
}

async function fetchText(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { "User-Agent": "ChroMods-issue-triage" } });
  if (!response?.ok) return null;
  return response.text();
}

export async function findUpstreamStyles(host, { fetchImpl = fetch } = {}) {
  const mappingJson = await fetchText(`${UPSTREAM_RAW}/css-mapping.json`, fetchImpl);
  let mapped = new Map();
  if (mappingJson) {
    try {
      mapped = invertCssMapping(JSON.parse(mappingJson));
    } catch {
      mapped = new Map();
    }
  }

  for (const candidate of hostLookupCandidates(host)) {
    const mappedFile = mapped.get(candidate);
    const names = mappedFile ? [mappedFile, ...fileNameCandidates(candidate)] : fileNameCandidates(candidate);
    for (const fileName of names) {
      const relative = `websites/${fileName}`;
      const css = await fetchText(`${UPSTREAM_RAW}/${relative}`, fetchImpl);
      if (css != null) {
        return {
          host: candidate,
          file: relative,
          url: `${UPSTREAM_RAW}/${relative}`,
          css,
        };
      }
    }
  }
  return null;
}

function isExactPortedHost(host, siteApi) {
  const normalized = siteApi.normalizeHostname(host);
  const site = siteApi.matchSiteFromHostname(normalized);
  if (!site) return false;
  if (site.hostnamePattern && site.hostnamePattern.test(normalized)) return true;
  return site.hostnames.includes(normalized);
}

function existingLabels(labels) {
  if (!labels) return [];
  if (Array.isArray(labels)) {
    return labels.map((label) => (typeof label === "string" ? label : label?.name)).filter(Boolean);
  }
  return String(labels)
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

export async function classifyIssue(
  { title = "", body = "", labels = [] } = {},
  { root = repoRootFrom(), fetchImpl = fetch } = {}
) {
  const labelNames = existingLabels(labels);
  if (labelNames.includes(LABEL_AUTO_PR)) {
    return {
      verdict: "skip",
      reason: "already-queued",
    };
  }

  const siteApi = loadSiteApi(root);
  const host = parseStyleHost(title, body);
  if (!host) {
    return {
      verdict: "complex",
      reason: "not-style-request",
      label: LABEL_NEEDS_ATTENTION,
      comment:
        "This doesn't look like a straightforward `[STYLE] host` port from [my-internet](https://github.com/sameerasw/my-internet), so I labeled it **NeedsAttention**.",
    };
  }

  if (isExactPortedHost(host, siteApi)) {
    const site = siteApi.matchSiteFromHostname(host);
    return {
      verdict: "skip",
      reason: "already-ported",
      host,
      siteId: site?.id,
      comment: `ChroMods already covers **${host}** (${site?.title || site?.id}). I'm not opening another port PR.`,
    };
  }

  const upstream = await findUpstreamStyles(host, { fetchImpl });
  if (!upstream) {
    return {
      verdict: "complex",
      reason: "no-upstream-css",
      host,
      label: LABEL_NEEDS_ATTENTION,
      comment: `No matching stylesheet for **${host}** in [sameerasw/my-internet](https://github.com/sameerasw/my-internet/tree/main/websites), so I labeled this **NeedsAttention**.`,
    };
  }

  const features = portableFeatures(parseFeatureBlocks(upstream.css));
  if (features.length === 0) {
    return {
      verdict: "complex",
      reason: "transparency-only",
      host,
      upstreamFile: upstream.file,
      upstreamUrl: upstream.url,
      label: LABEL_NEEDS_ATTENTION,
      comment: `Upstream CSS for **${host}** is only Zen transparency, which ChroMods does not port. Labeled **NeedsAttention**.`,
    };
  }

  return {
    verdict: "simple",
    reason: "style-port",
    host,
    upstreamFile: upstream.file,
    upstreamUrl: upstream.url,
    portableFeatures: features.map((feature) => feature.id),
    label: LABEL_AUTO_PR,
    comment: `Queued a Cursor Cloud Agent to port **${host}** from \`${upstream.file}\`.`,
  };
}

export function buildCloudAgentPrompt({ issue, classification }) {
  const host = classification.host;
  const features = (classification.portableFeatures || []).map((id) => `- \`${id}\``).join("\n");
  return `You are working in the ChroMods Chrome MV3 extension repo (T3lluz/ChroMods). Follow AGENTS.md.

Implement GitHub issue #${issue.number}: ${issue.title}
${issue.url}

${issue.body || ""}

This is a SIMPLE style port. Do not push to main. Open one pull request from a feature branch.

## Task
Port Chromium-adapted theming for **${host}** from upstream my-internet.

- Fetch the latest file (do not use memory): ${classification.upstreamUrl}
- Upstream path: \`${classification.upstreamFile}\`
- Named non-transparency features (starting point only — still read the FULL upstream file):
${features || "- (all non-transparency CSS in that file)"}

## Transparency (strict)
Skip Zen page/browser transparency. DROP rules whose job is making page chrome transparent (\`background: transparent\`, \`background: none\`, \`background-color: transparent\` on html/body/header/nav/player/shell).
Do NOT drop an entire \`/* …transparency */\` comment block if it also contains layout, radius, hide-element, or theater rules — keep those, flatten nested \`&\` selectors, and put them in a non-transparency module.
Committed CSS must not include those transparent page-background declarations.

## README (strict)
Do not hand-edit README.md. After SITE_META + FEATURE_META are wired, run \`npm run readme\`. \`scripts/generate-readme.mjs\` lists every site from SITE_META (tagline, table, sections, install line). If the README is missing the new site, the generator is stale — fix the generator, do not paste into README.md.

## Required playbook
1. Split upstream CSS into focused files under \`styles/<site-id>/\`.
2. Chromium-adapt: flatten nested \`&\` selectors, drop \`@-moz-document\` and Firefox-only \`scrollbar-width\`.
3. Wire: FEATURES + FEATURE_SITE (or prefix helper) in \`scripts/content-script.js\`; defaults in \`scripts/background.js\` and content-script; FEATURE_META in \`scripts/popup.js\` with \`site: "<site-id>"\`; SITE_META + icon + \`docs/sites/<site-id>.svg\` for new sites; manifest theming content_scripts matches AND web_accessible_resources matches.
4. Update tests that asserted the site was absent. Add \`tests/css-compat.test.js\` coverage that the new CSS has no transparent page backgrounds and no nested \`&\`.
5. CSS is derived from my-internet (MIT).
6. Run \`npm test\` then \`npm run readme\`. Do not open a PR if either fails.
7. PR title like \`Add ${host} theming mods\`. PR body must include \`Fixes #${issue.number}\` and name every skipped transparency feature.

Never merge. Never commit to main.`;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    args[name] = value;
  }
  return args;
}

function readIssueInput(args) {
  if (args["issue-json"]) {
    const issue = JSON.parse(fs.readFileSync(args["issue-json"], "utf8"));
    return {
      number: issue.number,
      title: issue.title || "",
      body: issue.body || "",
      url: issue.url || issue.html_url || "",
      labels: issue.labels || [],
    };
  }
  return {
    number: args["issue-number"] || args.number || "",
    title: args.title || "",
    body: args.body || "",
    url: args["issue-url"] || "",
    labels: args.labels || "",
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = args.root ? path.resolve(args.root) : repoRootFrom();
  const issue = readIssueInput(args);
  const classification = await classifyIssue(
    {
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
    },
    { root }
  );
  if (classification.verdict === "simple") {
    classification.prompt = buildCloudAgentPrompt({ issue, classification });
  }

  const json = JSON.stringify(classification, null, 2);
  if (args.out) fs.writeFileSync(args.out, json);
  process.stdout.write(json + "\n");
}

const isCli =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isCli) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
