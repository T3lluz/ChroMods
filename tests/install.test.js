import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const shell = read("install.sh");
const powershell = read("install.ps1");
const landing = read("docs/index.html");
const updates = read("scripts/updates.js");
const manifest = JSON.parse(read("manifest.json"));
const pkg = JSON.parse(read("package.json"));

const REPO = Function(
  `"use strict"; return (${updates.match(/const CHROMODS_UPDATE_REPO = (\{[^}]*\})/)?.[1]});`
)();

test("install.sh is valid bash", () => {
  const result = spawnSync("bash", ["-n", path.join(root, "install.sh")], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("the installers agree on the repo, branch, and folder", () => {
  const url = `https://github.com/${REPO.owner}/${REPO.repo}`;
  assert.ok(shell.includes(`REPO_URL="${url}"`), "install.sh points at another repo");
  assert.ok(powershell.includes(`$RepoUrl = "${url}"`), "install.ps1 points at another repo");

  for (const [name, source] of [["install.sh", shell], ["install.ps1", powershell]]) {
    assert.ok(source.includes(REPO.branch), `${name} should default to the branch the updater watches`);
    assert.match(source, /CHROMODS_DIR/, `${name} should honour CHROMODS_DIR`);
    assert.match(source, /CHROMODS_BRANCH/, `${name} should honour CHROMODS_BRANCH`);
    assert.match(source, /CHROMODS_NO_OPEN/, `${name} should honour CHROMODS_NO_OPEN`);
    assert.match(source, /CHROMODS_NO_CLIPBOARD/, `${name} should honour CHROMODS_NO_CLIPBOARD`);
    assert.match(source, /manifest\.json/, `${name} should verify the install landed`);
  }

  /* The popup tells people to run "git pull" in these exact folders. */
  assert.match(shell, /\$HOME\/\.chromods/);
  assert.match(powershell, /LOCALAPPDATA/);
});

test("both installers cut the same corners for the user", () => {
  // Clipboard, so Load unpacked is a paste rather than a folder hunt.
  assert.match(shell, /pbcopy|wl-copy|xclip/);
  assert.match(powershell, /Set-Clipboard/);

  // Opening the extensions page removes one navigation step.
  assert.match(shell, /chrome:\/\/extensions/);
  assert.match(powershell, /chrome:\/\/extensions/);

  // A re-run still finishes with Reload; day-to-day updates are Apply in the popup.
  assert.match(shell, /Reload ChroMods/);
  assert.match(powershell, /Reload ChroMods/);
  assert.match(shell, /Apply update/);
  assert.match(powershell, /Apply update/);
});

test("the one-liners the popup shows are the ones that exist", () => {
  const base = `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}`;
  const unix = `curl -fsSL ${base}/install.sh | bash`;
  const windows = `irm ${base}/install.ps1 | iex`;

  assert.ok(shell.includes(unix), "install.sh should document its own one-liner");
  assert.ok(powershell.includes(windows), "install.ps1 should document its own one-liner");
  assert.ok(read("README.md").includes(unix), "the README install command drifted");
  assert.ok(landing.includes("install.sh"), "the install page lost the macOS/Linux command");
  assert.ok(landing.includes("install.ps1"), "the install page lost the Windows command");
  assert.match(landing, /Apply update/, "the install page should point at the in-popup apply path");

  for (const file of ["install.sh", "install.ps1"]) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} has to exist at the repo root`);
  }
});

test("the install page is a self-contained Pages site", () => {
  assert.ok(fs.existsSync(path.join(root, "docs/icon.svg")), "docs/ needs its own copy of the icon");
  assert.equal(read("docs/icon.svg"), read("icons/icon.svg"), "docs/icon.svg drifted from icons/icon.svg");

  // Pages serves docs/ as the root, so nothing may reach outside it.
  const refs = [...landing.matchAll(/(?:src|href)="([^"#${]+)"/g)].map((match) => match[1]);
  const local = refs.filter((ref) => !/^(https?:)?\/\//.test(ref));
  assert.ok(local.length > 0);
  for (const ref of local) {
    assert.ok(!ref.startsWith("../"), `${ref} escapes the Pages root`);
    assert.ok(fs.existsSync(path.join(root, "docs", ref)), `docs/${ref} is missing`);
  }

  // The page names each site, so a new site has to be added here too.
  const sites = Function(
    `"use strict"; return (${read("scripts/sites.js")
      .match(/const SITE_META = (\[[\s\S]*?\n\]);/)[1]
      .replace(/GOOGLE_SEARCH_HOST/g, "null")});`
  )();
  for (const site of sites) {
    assert.match(landing, new RegExp(`\\["${site.id}",`), `the install page is missing ${site.id}`);
    assert.ok(fs.existsSync(path.join(root, `docs/sites/${site.id}.svg`)), `docs/sites/${site.id}.svg is missing`);
  }
});

test("the packaged zip carries everything the extension loads", () => {
  const packaged = read("scripts/package.mjs");
  const include = Function(`"use strict"; return (${packaged.match(/const INCLUDE = (\[[^\]]*\])/)[1]});`)();

  const covered = (file) => include.some((entry) => file === entry || file.startsWith(`${entry}/`));

  const referenced = new Set([
    manifest.background.service_worker,
    manifest.action.default_popup,
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
    ...(manifest.content_scripts || []).flatMap((entry) => entry.js || []),
  ]);

  for (const file of referenced) {
    assert.ok(fs.existsSync(path.join(root, file)), `manifest references a missing ${file}`);
    assert.ok(covered(file), `${file} would not make it into the release zip`);
  }

  assert.ok(covered("styles/youtube/theater-base.css"), "stylesheets must be packaged");
  assert.ok(covered("LICENSE") && fs.existsSync(path.join(root, "LICENSE")), "ship the license");

  /* Repo tooling has no business inside the extension. */
  const exclude = Function(`"use strict"; return (${packaged.match(/const EXCLUDE = (\[[^\]]*\])/)[1]});`)();
  for (const tool of ["scripts/generate-readme.mjs", "scripts/package.mjs", "scripts/publish-cws.mjs"]) {
    assert.ok(exclude.includes(tool), `${tool} should be excluded from the zip`);
  }
});

test("the release path is wired end to end", () => {
  for (const script of ["package", "release", "publish:cws", "readme"]) {
    assert.ok(pkg.scripts[script], `package.json is missing the ${script} script`);
  }

  const workflow = read(".github/workflows/release.yml");
  assert.match(workflow, /tags: \["v\*"\]/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /generate-readme\.mjs --check/);
  assert.match(workflow, /npm run package/);
  assert.match(workflow, /gh release create/);
  assert.match(workflow, /npm run publish:cws/);
  // A tag that disagrees with the manifest would publish a version the
  // updater then reports as an endless update.
  assert.match(workflow, /does not match manifest version/);

  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
});

test("the store upload is a no-op until it is configured", () => {
  const result = spawnSync(process.execPath, [path.join(root, "scripts/publish-cws.mjs")], {
    encoding: "utf8",
    env: {
      ...process.env,
      CWS_CLIENT_ID: "",
      CWS_CLIENT_SECRET: "",
      CWS_REFRESH_TOKEN: "",
      CWS_EXTENSION_ID: "",
    },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /skipping/i);
});

test("version bumps rewrite the manifest and keep it parseable", () => {
  const source = read("manifest.json");
  const bump = (current, request) => {
    const parts = current.split(".").map(Number);
    if (request === "major") return `${parts[0] + 1}.0.0`;
    if (request === "minor") return `${parts[0]}.${parts[1] + 1}.0`;
    return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  };

  const next = bump(manifest.version, "minor");
  const rewritten = source.replace(/("version"\s*:\s*")[^"]*(")/, `$1${next}$2`);
  assert.notEqual(rewritten, source);
  assert.equal(JSON.parse(rewritten).version, next);
  // Only the version line may move, or the diff of a release becomes unreadable.
  assert.equal(rewritten.split("\n").length, source.split("\n").length);
});
