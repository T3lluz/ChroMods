import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/* Bumping the version is the first half of shipping an update: the release
   workflow refuses a tag that does not match manifest.json, and the popup's
   checker compares against exactly this number. */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "manifest.json");

const USAGE = `Usage: npm run release -- <major|minor|patch|x.y.z> [--tag]

  --tag   also commit manifest.json + README.md and create the v<version> tag
`;

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith("-"));
const shouldTag = args.includes("--tag");

if (!target) {
  console.error(USAGE);
  process.exit(1);
}

function nextVersion(current, request) {
  if (/^\d+\.\d+\.\d+$/.test(request)) return request;
  const parts = current.split(".").map((part) => Number.parseInt(part, 10) || 0);
  while (parts.length < 3) parts.push(0);
  const [major, minor, patch] = parts;
  if (request === "major") return `${major + 1}.0.0`;
  if (request === "minor") return `${major}.${minor + 1}.0`;
  if (request === "patch") return `${major}.${minor}.${patch + 1}`;
  return null;
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const source = fs.readFileSync(manifestPath, "utf8");
const current = JSON.parse(source).version;
const version = nextVersion(current, target);

if (!version) {
  console.error(`Not a version or bump keyword: ${target}\n\n${USAGE}`);
  process.exit(1);
}

/* Rewritten as text so the manifest keeps its formatting and key order. */
const updated = source.replace(/("version"\s*:\s*")[^"]*(")/, `$1${version}$2`);
if (updated === source) {
  console.error("Could not find a version field in manifest.json");
  process.exit(1);
}

fs.writeFileSync(manifestPath, updated);
run(process.execPath, [path.join(root, "scripts/generate-readme.mjs")]);
console.log(`manifest.json: ${current} -> ${version}`);

if (!shouldTag) {
  console.log(`Next: npm test && git commit -am "v${version}" && git tag v${version} && git push --follow-tags`);
  process.exit(0);
}

run("git", ["add", "manifest.json", "README.md"]);
run("git", ["commit", "-m", `chore: release v${version}`]);
run("git", ["tag", `v${version}`]);
console.log(`Tagged v${version}. Push it with: git push --follow-tags`);
