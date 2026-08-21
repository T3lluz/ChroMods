import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { crc32 as zlibCrc32, deflateRawSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fakeChrome({ version = "1.5.0", installType = "development" } = {}) {
  return {
    runtime: {
      getManifest: () => ({ version }),
      getURL: (file) => `chrome-extension://id/${file}`,
    },
    management: {
      getSelf: async () => ({ installType }),
    },
  };
}

function loadApply(options = {}) {
  const chrome = fakeChrome(options);
  const context = {
    chrome,
    fetch: options.fetch,
    showDirectoryPicker: options.showDirectoryPicker,
    indexedDB: options.indexedDB,
    URL,
    URLSearchParams,
    AbortSignal,
    DecompressionStream,
    Blob,
    Response,
    TextDecoder,
    TextEncoder,
    Date,
    console,
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "scripts/updates.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "scripts/apply-update.js"), "utf8"), context);
  context.__chrome = chrome;
  return context;
}

function encode(value) {
  return Buffer.from(value, "utf8");
}

function zipArchive(files, { compress = false, nest = "" } = {}) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const file of files) {
    const name = nest + file.name;
    const nameBuf = encode(name);
    const raw = Buffer.isBuffer(file.data) ? file.data : encode(String(file.data));
    const crc = zlibCrc32(raw) >>> 0;
    const payload = compress ? deflateRawSync(raw) : raw;
    const method = compress ? 8 : 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);

    const localBlob = Buffer.concat([local, nameBuf, payload]);
    locals.push(localBlob);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(payload.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, nameBuf]));
    offset += localBlob.length;
  }

  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, centralDir, eocd]));
}

const MANIFEST = JSON.stringify({
  name: "ChroMods",
  manifest_version: 3,
  version: "1.6.0",
});

function extensionFiles(extra = []) {
  return [
    { name: "manifest.json", data: MANIFEST },
    { name: "popup/popup.html", data: "<html></html>" },
    { name: "scripts/background.js", data: "void 0;" },
    ...extra,
  ];
}

function memoryFile(initial = "") {
  let bytes = typeof initial === "string" ? encode(initial) : initial;
  return {
    async createWritable() {
      const chunks = [];
      return {
        async write(data) {
          if (typeof data === "string") chunks.push(encode(data));
          else chunks.push(Buffer.from(data));
        },
        async close() {
          bytes = Buffer.concat(chunks);
        },
      };
    },
    async getFile() {
      const copy = Uint8Array.from(bytes);
      return {
        arrayBuffer: async () => copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength),
        text: async () => new TextDecoder().decode(copy),
      };
    },
  };
}

function memoryDir() {
  const children = new Map();
  return {
    async getDirectoryHandle(name, { create } = {}) {
      if (!children.has(name)) {
        if (!create) throw new Error(`missing dir ${name}`);
        children.set(name, memoryDir());
      }
      const next = children.get(name);
      if (typeof next.getDirectoryHandle !== "function") throw new Error(`${name} is a file`);
      return next;
    },
    async getFileHandle(name, { create } = {}) {
      if (!children.has(name)) {
        if (!create) throw new Error(`missing file ${name}`);
        children.set(name, memoryFile());
      }
      return children.get(name);
    },
    async queryPermission() {
      return "granted";
    },
    async requestPermission() {
      return "granted";
    },
  };
}

async function seedManifest(dir, version = "1.5.0") {
  const file = await dir.getFileHandle("manifest.json", { create: true });
  const writable = await file.createWritable();
  await writable.write(JSON.stringify({ name: "ChroMods", manifest_version: 3, version }));
  await writable.close();
}

test("crc32 matches zlib", () => {
  const api = loadApply();
  const bytes = encode("ChroMods update zip");
  assert.equal(api.chromodsCrc32(bytes), zlibCrc32(bytes) >>> 0);
});

test("store installs are the silent Chrome Web Store path", async () => {
  const store = loadApply({ installType: "normal" });
  assert.equal(store.chromodsStoreInstall("normal"), true);
  assert.equal(store.chromodsStoreInstall("admin"), true);
  assert.equal(store.chromodsStoreInstall("development"), false);
  assert.equal(await store.chromodsInstallType(), "normal");

  const unpacked = loadApply({ installType: "development" });
  assert.equal(await unpacked.chromodsInstallType(), "development");
});

test("only this repo's GitHub download URLs are allowed", () => {
  const api = loadApply();
  assert.equal(
    api.chromodsIsAllowedUpdateUrl("https://github.com/T3lluz/ChroMods/releases/download/v1.6.0/chromods-1.6.0.zip"),
    true
  );
  assert.equal(
    api.chromodsIsAllowedUpdateUrl("https://codeload.github.com/T3lluz/ChroMods/zip/refs/heads/main"),
    true
  );
  assert.equal(api.chromodsIsAllowedUpdateUrl("https://github.com/evil/ChroMods/archive/main.zip"), false);
  assert.equal(api.chromodsIsAllowedUpdateUrl("http://github.com/T3lluz/ChroMods/archive/main.zip"), false);
  assert.equal(api.chromodsIsAllowedUpdateUrl("https://example.com/chromods.zip"), false);
});

test("zip path sanitizing drops traversal, git, and node_modules", () => {
  const api = loadApply();
  assert.equal(api.chromodsSanitizeZipPath("popup/popup.html"), "popup/popup.html");
  assert.equal(api.chromodsSanitizeZipPath("../evil.js"), null);
  assert.equal(api.chromodsSanitizeZipPath(".git/config"), null);
  assert.equal(api.chromodsSanitizeZipPath("node_modules/darkreader/darkreader.js"), null);
  assert.equal(api.chromodsSanitizeZipPath("scripts/"), null);
  assert.equal(api.chromodsZipRootPrefix(["ChroMods-1.6.0/manifest.json", "ChroMods-1.6.0/popup/popup.html"]), "ChroMods-1.6.0/");
  assert.equal(api.chromodsZipRootPrefix(["manifest.json", "popup/popup.html"]), "");
});

test("stored and deflated zips both unpack, stripping a GitHub root folder", async () => {
  const api = loadApply();
  const extra = [
    { name: ".git/config", data: "secret" },
    { name: "styles/youtube/player-blur.css", data: ".foo{}" },
    { name: "../escape.js", data: "nope" },
  ];

  for (const compress of [false, true]) {
    const zip = zipArchive(extensionFiles(extra), { compress, nest: "ChroMods-v1.6.0/" });
    const files = await api.chromodsUnzip(zip);
    const paths = files.map((file) => file.path).sort();
    assert.deepEqual(paths, [
      "manifest.json",
      "popup/popup.html",
      "scripts/background.js",
      "styles/youtube/player-blur.css",
    ]);
    assert.equal(api.chromodsZipLooksLikeExtension(files), true);
    const manifest = files.find((file) => file.path === "manifest.json");
    assert.equal(api.chromodsParseManifestBytes(manifest.bytes).version, "1.6.0");
  }
});

test("a corrupt checksum is rejected", async () => {
  const api = loadApply();
  const zip = zipArchive([{ name: "hello.txt", data: "xxxxxxxxxxxxxxxx" }]);
  zip[30 + "hello.txt".length] ^= 0xff;
  await assert.rejects(() => api.chromodsUnzip(zip), /checksum/i);
});

test("applying writes the zip into a ChroMods folder and checks the version", async () => {
  const zip = zipArchive(extensionFiles(), { compress: true });
  const dir = memoryDir();
  await seedManifest(dir, "1.5.0");
  const stages = [];
  const api = loadApply({
    fetch: async (url) => {
      assert.match(url, /chromods-1\.6\.0\.zip$/);
      return {
        ok: true,
        status: 200,
        headers: { get: () => String(zip.length) },
        arrayBuffer: async () => zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength),
      };
    },
  });

  const result = await api.chromodsApplyExtensionUpdate({
    downloadUrl: "https://github.com/T3lluz/ChroMods/releases/download/v1.6.0/chromods-1.6.0.zip",
    expectedVersion: "1.6.0",
    dirHandle: dir,
    onProgress: (stage) => stages.push(stage),
  });

  assert.equal(result.version, "1.6.0");
  assert.ok(result.files >= 3);
  assert.deepEqual(stages, ["download", "extract", "write", "reload"]);
  const written = api.chromodsParseManifestBytes(await api.chromodsReadDirectoryFile(dir, "manifest.json"));
  assert.equal(written.version, "1.6.0");
  const html = new TextDecoder().decode(await api.chromodsReadDirectoryFile(dir, "popup/popup.html"));
  assert.match(html, /<html>/);
});

test("applying refuses a folder that is not ChroMods", async () => {
  const api = loadApply();
  const dir = memoryDir();
  const file = await dir.getFileHandle("manifest.json", { create: true });
  const writable = await file.createWritable();
  await writable.write(JSON.stringify({ name: "Other", manifest_version: 3, version: "1.0.0" }));
  await writable.close();
  await assert.rejects(() => api.chromodsVerifyUpdateDirectory(dir), /not a ChroMods/i);
});

test("a version mismatch aborts before it is useful to write", async () => {
  const zip = zipArchive(extensionFiles());
  const dir = memoryDir();
  await seedManifest(dir);
  const api = loadApply({
    fetch: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
      arrayBuffer: async () => zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength),
    }),
  });
  await assert.rejects(
    () =>
      api.chromodsApplyExtensionUpdate({
        downloadUrl: "https://github.com/T3lluz/ChroMods/archive/refs/tags/v1.6.0.zip",
        expectedVersion: "9.9.9",
        dirHandle: dir,
      }),
    /Expected v9\.9\.9/
  );
});

test("the apply page is packaged with the popup", () => {
  const packaged = fs.readFileSync(path.join(root, "scripts/package.mjs"), "utf8");
  const include = Function(`"use strict"; return (${packaged.match(/const INCLUDE = (\[[^\]]*\])/)[1]});`)();
  const covered = (file) => include.some((entry) => file === entry || file.startsWith(`${entry}/`));
  assert.ok(covered("popup/apply.html"));
  assert.ok(covered("scripts/apply-update.js"));
  assert.ok(covered("scripts/apply-page.js"));
  assert.ok(fs.existsSync(path.join(root, "popup/apply.html")));
});
