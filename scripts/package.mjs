import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const INCLUDE = ["manifest.json", "icons", "popup", "scripts", "styles", "README.md", "LICENSE"];

/* Repo tooling that has no business inside a browser extension. */
const EXCLUDE = [
  "scripts/generate-readme.mjs",
  "scripts/launch-cloud-agent.mjs",
  "scripts/triage-issue.mjs",
  "scripts/package.mjs",
  "scripts/publish-cws.mjs",
  "scripts/version.mjs",
  ".DS_Store",
  "*/.DS_Store",
  "*.map",
];

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const distDir = path.join(root, "dist");
const zipName = `chromods-${manifest.version}.zip`;
const zipPath = path.join(distDir, zipName);

if (spawnSync("zip", ["-v"], { stdio: "ignore" }).status !== 0) {
  console.error("`zip` is required to build the release archive (apt install zip / brew install zip).");
  process.exit(1);
}

fs.mkdirSync(distDir, { recursive: true });
fs.rmSync(zipPath, { force: true });

const entries = INCLUDE.filter((entry) => fs.existsSync(path.join(root, entry)));
const result = spawnSync("zip", ["-r", "-q", "-X", zipPath, ...entries, "-x", ...EXCLUDE], {
  cwd: root,
  stdio: "inherit",
});

if (result.status !== 0) {
  console.error("Packaging failed.");
  process.exit(result.status ?? 1);
}

const size = (fs.statSync(zipPath).size / 1024).toFixed(0);
console.log(`Wrote dist/${zipName} (${size} KB) — load unpacked after extracting, or upload as a release asset.`);
