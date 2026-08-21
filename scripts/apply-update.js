const CHROMODS_APPLY_PAGE = "popup/apply.html";
const CHROMODS_DIR_DB = "chromods-update";
const CHROMODS_DIR_STORE = "handles";
const CHROMODS_DIR_KEY = "folder";
const CHROMODS_UPDATE_MAX_ZIP_BYTES = 30 * 1024 * 1024;
const CHROMODS_UPDATE_MAX_FILES = 2000;
const CHROMODS_APPLY_TIMEOUT_MS = 30000;
const CHROMODS_ZIP_LOCAL = 0x04034b50;
const CHROMODS_ZIP_CENTRAL = 0x02014b50;
const CHROMODS_ZIP_EOCD = 0x06054b50;

const CHROMODS_CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }
  return table;
})();

function chromodsCrc32(bytes) {
  let crc = 0xffffffff;
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  for (let i = 0; i < data.length; i++) {
    crc = CHROMODS_CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chromodsApplyAbortSignal() {
  try {
    return AbortSignal.timeout(CHROMODS_APPLY_TIMEOUT_MS);
  } catch {
    return undefined;
  }
}

function chromodsStoreInstall(type) {
  return type === "normal" || type === "admin";
}

async function chromodsInstallType() {
  try {
    if (!chrome.management?.getSelf) return "unknown";
    const self = await chrome.management.getSelf();
    return String(self?.installType || "unknown");
  } catch {
    return "unknown";
  }
}

function chromodsCanPickUpdateFolder() {
  return typeof showDirectoryPicker === "function";
}

function chromodsApplyPageUrl() {
  try {
    return chrome.runtime.getURL(CHROMODS_APPLY_PAGE);
  } catch {
    return CHROMODS_APPLY_PAGE;
  }
}

async function chromodsOpenApplyPage() {
  const url = chromodsApplyPageUrl();
  if (chrome.windows?.create) {
    try {
      await chrome.windows.create({
        url,
        type: "popup",
        width: 440,
        height: 600,
        focused: true,
      });
      return;
    } catch {
      /* some Chromium builds refuse popup windows */
    }
  }
  await chrome.tabs.create({ url });
}

function chromodsIsAllowedUpdateUrl(value) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const owner = CHROMODS_UPDATE_REPO.owner.toLowerCase();
  const repo = CHROMODS_UPDATE_REPO.repo.toLowerCase();
  const host = url.hostname.toLowerCase();
  const path = url.pathname;
  const repoPath = `/${owner}/${repo}/`;

  if (host === "github.com" || host === "codeload.github.com" || host === "raw.githubusercontent.com") {
    return path.toLowerCase().startsWith(repoPath);
  }
  /* Release asset redirects land on GitHub's object CDN. The URL we fetch is
     still the github.com download link from our own release JSON. */
  if (host === "objects.githubusercontent.com" || host === "release-assets.githubusercontent.com") {
    return true;
  }
  return false;
}

function chromodsZipSkipPath(relativePath) {
  const path = String(relativePath || "").replaceAll("\\", "/");
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return true;
  if (parts.some((part) => part === "." || part === "..")) return true;
  const [head] = parts;
  if (head === ".git" || head === "node_modules" || head === ".cursor") return true;
  if (head.startsWith(".git")) return true;
  return false;
}

function chromodsSanitizeZipPath(relativePath) {
  const path = String(relativePath || "")
    .replaceAll("\\", "/")
    .replace(/^\//, "");
  if (!path || path.endsWith("/")) return null;
  if (chromodsZipSkipPath(path)) return null;
  if (path.includes("\0")) return null;
  return path;
}

function chromodsZipRootPrefix(paths) {
  const files = (Array.isArray(paths) ? paths : []).filter(Boolean);
  if (!files.length) return "";
  const first = files[0];
  const slash = first.indexOf("/");
  if (slash < 0) return "";
  const root = first.slice(0, slash + 1);
  return files.every((path) => path.startsWith(root)) ? root : "";
}

function chromodsIsChroModsManifest(manifest) {
  return Boolean(manifest) && manifest.manifest_version === 3 && manifest.name === "ChroMods";
}

function chromodsZipLooksLikeExtension(files) {
  const names = new Set((Array.isArray(files) ? files : []).map((file) => file?.path));
  return names.has("manifest.json") && names.has("popup/popup.html") && names.has("scripts/background.js");
}

function chromodsReadUtf8(bytes) {
  return new TextDecoder("utf-8").decode(bytes);
}

function chromodsParseManifestBytes(bytes) {
  try {
    return JSON.parse(chromodsReadUtf8(bytes));
  } catch {
    throw new Error("The update's manifest.json is not valid JSON");
  }
}

async function chromodsInflateRaw(bytes) {
  if (typeof DecompressionStream !== "function") {
    throw new Error("This browser can't unpack a compressed update");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function chromodsFindZipEocd(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const min = Math.max(0, bytes.length - 22 - 65535);
  for (let offset = bytes.length - 22; offset >= min; offset--) {
    if (view.getUint32(offset, true) === CHROMODS_ZIP_EOCD) return offset;
  }
  throw new Error("Not a zip file");
}

async function chromodsUnzip(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer || []);
  if (bytes.length < 22) throw new Error("Not a zip file");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = chromodsFindZipEocd(bytes);
  const diskEntries = view.getUint16(eocd + 8, true);
  const totalEntries = view.getUint16(eocd + 10, true);
  const dirSize = view.getUint32(eocd + 12, true);
  const dirOffset = view.getUint32(eocd + 16, true);
  if (diskEntries === 0xffff || totalEntries === 0xffff || dirSize === 0xffffffff || dirOffset === 0xffffffff) {
    throw new Error("This update zip is too large");
  }
  if (totalEntries > CHROMODS_UPDATE_MAX_FILES) throw new Error("This update zip has too many files");
  if (dirOffset + dirSize > bytes.length) throw new Error("The update zip is truncated");

  const files = [];
  let cursor = dirOffset;
  const dirEnd = dirOffset + dirSize;
  while (cursor < dirEnd) {
    if (view.getUint32(cursor, true) !== CHROMODS_ZIP_CENTRAL) {
      throw new Error("The update zip directory is corrupt");
    }
    const method = view.getUint16(cursor + 10, true);
    const crc = view.getUint32(cursor + 16, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const nameBytes = bytes.subarray(cursor + 46, cursor + 46 + nameLength);
    const name = chromodsReadUtf8(nameBytes);
    cursor += 46 + nameLength + extraLength + commentLength;

    const relative = chromodsSanitizeZipPath(name);
    if (!relative) continue;
    if (method !== 0 && method !== 8) {
      throw new Error(`Unsupported zip compression (${method})`);
    }
    if (localOffset + 30 > bytes.length) throw new Error("The update zip is truncated");
    if (view.getUint32(localOffset, true) !== CHROMODS_ZIP_LOCAL) {
      throw new Error("The update zip is corrupt");
    }
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > bytes.length) throw new Error("The update zip is truncated");
    const packed = bytes.subarray(dataStart, dataEnd);
    const inflated = method === 8 ? await chromodsInflateRaw(packed) : packed.slice();
    if (uncompressedSize && inflated.length !== uncompressedSize) {
      throw new Error(`Zip entry ${relative} has the wrong size`);
    }
    if (crc && chromodsCrc32(inflated) !== crc) {
      throw new Error(`Zip entry ${relative} failed its checksum`);
    }
    files.push({ path: relative, bytes: inflated });
  }

  const prefix = chromodsZipRootPrefix(files.map((file) => file.path));
  if (!prefix) return files;
  return files
    .map((file) => ({ path: file.path.slice(prefix.length), bytes: file.bytes }))
    .filter((file) => file.path && !chromodsZipSkipPath(file.path));
}

function chromodsOpenDirectoryDb() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Folder access is unavailable"));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CHROMODS_DIR_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHROMODS_DIR_STORE)) db.createObjectStore(CHROMODS_DIR_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Couldn't open folder storage"));
  });
}

async function chromodsGetSavedDirectoryHandle() {
  try {
    const db = await chromodsOpenDirectoryDb();
    const handle = await new Promise((resolve, reject) => {
      const tx = db.transaction(CHROMODS_DIR_STORE, "readonly");
      const request = tx.objectStore(CHROMODS_DIR_STORE).get(CHROMODS_DIR_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return handle || null;
  } catch {
    return null;
  }
}

async function chromodsSaveDirectoryHandle(handle) {
  if (!handle) return;
  const db = await chromodsOpenDirectoryDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(CHROMODS_DIR_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(CHROMODS_DIR_STORE).put(handle, CHROMODS_DIR_KEY);
  });
  db.close();
}

async function chromodsQueryDirectoryPermission(handle, mode = "readwrite") {
  if (!handle?.queryPermission) return "denied";
  try {
    return await handle.queryPermission({ mode });
  } catch {
    return "denied";
  }
}

async function chromodsRequestDirectoryPermission(handle, mode = "readwrite") {
  if (!handle?.requestPermission) return "denied";
  try {
    return await handle.requestPermission({ mode });
  } catch {
    return "denied";
  }
}

async function chromodsReadDirectoryFile(dirHandle, relativePath) {
  const parts = String(relativePath || "")
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean);
  if (!parts.length) throw new Error("Missing file");
  let dir = dirHandle;
  const name = parts.pop();
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part);
  }
  const fileHandle = await dir.getFileHandle(name);
  const file = await fileHandle.getFile();
  return new Uint8Array(await file.arrayBuffer());
}

async function chromodsVerifyUpdateDirectory(dirHandle) {
  let manifest;
  try {
    manifest = chromodsParseManifestBytes(await chromodsReadDirectoryFile(dirHandle, "manifest.json"));
  } catch {
    throw new Error("Pick the ChroMods folder you loaded unpacked — it contains manifest.json.");
  }
  if (!chromodsIsChroModsManifest(manifest)) {
    throw new Error("That folder is not a ChroMods install.");
  }
  return manifest;
}

async function chromodsWriteUpdateFiles(dirHandle, files) {
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    const name = parts.pop();
    let dir = dirHandle;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: true });
    }
    const handle = await dir.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(file.bytes);
    await writable.close();
  }
}

async function chromodsFetchUpdateZip(downloadUrl, fetchImpl) {
  if (!chromodsIsAllowedUpdateUrl(downloadUrl)) {
    throw new Error("Update download URL is not from this repository");
  }
  const request = fetchImpl || fetch;
  const response = await request(downloadUrl, {
    cache: "no-store",
    signal: chromodsApplyAbortSignal(),
  });
  if (!response.ok) {
    const status = Number(response.status) || 0;
    throw new Error(status ? `Download failed (${status})` : "Download failed");
  }
  const length = Number(response.headers?.get?.("content-length"));
  if (Number.isFinite(length) && length > CHROMODS_UPDATE_MAX_ZIP_BYTES) {
    throw new Error("Update zip is too large");
  }
  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.length > CHROMODS_UPDATE_MAX_ZIP_BYTES) throw new Error("Update zip is too large");
  return buffer;
}

async function chromodsPickUpdateDirectory() {
  if (!chromodsCanPickUpdateFolder()) {
    throw new Error("This browser can't grant folder access");
  }
  const handle = await showDirectoryPicker({
    id: "chromods-install",
    mode: "readwrite",
  });
  await chromodsVerifyUpdateDirectory(handle);
  await chromodsSaveDirectoryHandle(handle);
  return handle;
}

/* Permission / picker must run on the click that started the apply, before
   the download await, or Chromium drops the user-gesture. */
async function chromodsEnsureUpdateDirectory(existing) {
  let handle = existing || null;
  if (handle) {
    const state = await chromodsQueryDirectoryPermission(handle);
    if (state !== "granted") {
      handle = (await chromodsRequestDirectoryPermission(handle)) === "granted" ? handle : null;
    }
  }
  if (!handle) return chromodsPickUpdateDirectory();
  await chromodsVerifyUpdateDirectory(handle);
  return handle;
}

async function chromodsApplyExtensionUpdate({
  downloadUrl,
  expectedVersion,
  dirHandle,
  fetchImpl,
  onProgress,
} = {}) {
  const dir = await chromodsEnsureUpdateDirectory(dirHandle);
  onProgress?.("download");
  const zip = await chromodsFetchUpdateZip(downloadUrl, fetchImpl);
  onProgress?.("extract");
  const files = await chromodsUnzip(zip);
  if (!chromodsZipLooksLikeExtension(files)) {
    throw new Error("The download did not look like a ChroMods extension");
  }
  const zipManifest = files.find((file) => file.path === "manifest.json");
  const parsed = chromodsParseManifestBytes(zipManifest.bytes);
  if (!chromodsIsChroModsManifest(parsed)) {
    throw new Error("The download is not a ChroMods package");
  }
  const version = String(parsed.version || "");
  if (expectedVersion && chromodsCompareVersions(version, expectedVersion) !== 0) {
    throw new Error(`Expected v${expectedVersion} but the zip is v${version}`);
  }
  onProgress?.("write");
  await chromodsWriteUpdateFiles(dir, files);
  const written = chromodsParseManifestBytes(await chromodsReadDirectoryFile(dir, "manifest.json"));
  if (!chromodsIsChroModsManifest(written) || written.version !== version) {
    throw new Error("The folder did not accept the new files");
  }
  onProgress?.("reload");
  return { version, files: files.length, dir };
}
