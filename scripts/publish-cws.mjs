import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* Publishing to the Chrome Web Store is the only way a Chromium user gets a
   one-click install and silent auto-updates: off-store CRX installs are blocked
   on Windows and macOS unless an enterprise policy allows them. Everything else
   in this repo targets the unpacked fallback. See docs/RELEASING.md.

   Needs CWS_CLIENT_ID, CWS_CLIENT_SECRET, CWS_REFRESH_TOKEN, and
   CWS_EXTENSION_ID. Without them this exits 0 so a release still succeeds. */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://www.googleapis.com/upload/chromewebstore/v1.1/items";
const PUBLISH_API = "https://www.googleapis.com/chromewebstore/v1.1/items";

const { CWS_CLIENT_ID, CWS_CLIENT_SECRET, CWS_REFRESH_TOKEN, CWS_EXTENSION_ID } = process.env;
const target = process.env.CWS_TARGET === "trustedTesters" ? "trustedTesters" : "default";

if (!CWS_CLIENT_ID || !CWS_CLIENT_SECRET || !CWS_REFRESH_TOKEN || !CWS_EXTENSION_ID) {
  console.log("Chrome Web Store credentials are not configured — skipping the store upload.");
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const zipPath = path.join(root, "dist", `chromods-${manifest.version}.zip`);

if (!fs.existsSync(zipPath)) {
  console.error(`Missing ${path.relative(root, zipPath)} — run npm run package first.`);
  process.exit(1);
}

async function readError(response) {
  const body = await response.text().catch(() => "");
  return `${response.status} ${response.statusText}${body ? ` — ${body.slice(0, 500)}` : ""}`;
}

async function accessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CWS_CLIENT_ID,
      client_secret: CWS_CLIENT_SECRET,
      refresh_token: CWS_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error(`Token exchange failed: ${await readError(response)}`);
  const { access_token: token } = await response.json();
  if (!token) throw new Error("Token exchange returned no access_token");
  return token;
}

async function upload(token) {
  const response = await fetch(`${API}/${CWS_EXTENSION_ID}?uploadType=media`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "x-goog-api-version": "2" },
    body: fs.readFileSync(zipPath),
  });
  if (!response.ok) throw new Error(`Upload failed: ${await readError(response)}`);
  const result = await response.json();
  if (result.uploadState === "FAILURE") {
    const detail = result.itemError?.map((error) => error.error_detail).join("; ");
    throw new Error(`Store rejected the package: ${detail || result.uploadState}`);
  }
  return result;
}

async function publish(token) {
  const response = await fetch(`${PUBLISH_API}/${CWS_EXTENSION_ID}/publish?publishTarget=${target}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-goog-api-version": "2",
      "Content-Length": "0",
    },
  });
  if (!response.ok) throw new Error(`Publish failed: ${await readError(response)}`);
  return response.json();
}

try {
  const token = await accessToken();
  const uploaded = await upload(token);
  console.log(`Uploaded v${manifest.version} (${uploaded.uploadState}).`);
  const published = await publish(token);
  const statuses = Array.isArray(published.status) ? published.status.join(", ") : published.status;
  console.log(`Published to ${target}: ${statuses || "submitted"}.`);
  if (published.statusDetail?.length) console.log(published.statusDetail.join("\n"));
} catch (error) {
  console.error(String(error?.message || error));
  process.exit(1);
}
