import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadShortcuts() {
  const source = fs.readFileSync(path.join(root, "scripts/shortcuts.js"), "utf8");
  const context = {
    location: { protocol: "chrome-extension:", href: "chrome-extension://id/popup/popup.html" },
    window: { addEventListener() {} },
    chrome: {
      storage: {
        sync: {
          get: async () => ({}),
          set: async () => {},
        },
        onChanged: { addListener() {} },
      },
      runtime: {
        sendMessage: async () => ({ ok: true }),
      },
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

test("shortcut labels and matching use modifier combos", () => {
  const api = loadShortcuts();
  const shortcut = { altKey: true, shiftKey: true, ctrlKey: false, metaKey: false, code: "KeyD" };
  assert.equal(api.chromodsShortcutLabel(shortcut), "Alt + Shift + D");
  assert.equal(api.chromodsShortcutLabel(null), "None");

  const event = { altKey: true, shiftKey: true, ctrlKey: false, metaKey: false, code: "KeyD" };
  assert.equal(api.chromodsEventMatchesShortcut(event, shortcut), true);
  assert.equal(
    api.chromodsEventMatchesShortcut({ ...event, shiftKey: false }, shortcut),
    false
  );
});

test("shortcut capture requires a modifier and ignores plain letters", () => {
  const api = loadShortcuts();
  assert.equal(api.chromodsShortcutFromEvent({ key: "d", code: "KeyD", altKey: false, shiftKey: false, ctrlKey: false, metaKey: false }), null);
  const captured = api.chromodsShortcutFromEvent({
    key: "M",
    code: "KeyM",
    altKey: true,
    shiftKey: true,
    ctrlKey: false,
    metaKey: false,
  });
  assert.equal(captured.code, "KeyM");
  assert.equal(captured.altKey, true);
  assert.equal(captured.shiftKey, true);
  assert.equal(
    api.chromodsShortcutsEqual(captured, {
      altKey: true,
      shiftKey: true,
      ctrlKey: false,
      metaKey: false,
      code: "KeyM",
    }),
    true
  );
});

test("cleared shortcuts stay unset instead of falling back to defaults", () => {
  const api = loadShortcuts();
  const merged = api.chromodsMergeShortcuts({ "toggle-dark": null });
  assert.equal(merged["toggle-dark"], null);
  assert.equal(merged["toggle-mods"].code, "KeyM");
});

test("shortcut matching falls back to event.key and modifier state", () => {
  const api = loadShortcuts();
  const shortcut = { altKey: true, shiftKey: true, ctrlKey: false, metaKey: false, code: "KeyD" };
  assert.equal(
    api.chromodsEventMatchesShortcut(
      { altKey: true, shiftKey: true, ctrlKey: false, metaKey: false, code: "", key: "d" },
      shortcut
    ),
    true
  );
  assert.equal(typeof api.chromodsHandleShortcutMessage, "function");
  assert.equal(typeof api.chromodsRunShortcutAction, "function");
  assert.equal(typeof api.chromodsDispatchShortcut, "function");
});

test("shortcut dispatch uses the unwrapped runtime send and does not double-run", async () => {
  const sent = [];
  const source = fs.readFileSync(path.join(root, "scripts/shortcuts.js"), "utf8");
  let ran = 0;
  const context = {
    location: { protocol: "chrome-extension:", href: "https://example.com/" },
    window: { addEventListener() {} },
    chrome: {
      storage: {
        sync: {
          get: async () => ({}),
          set: async () => {},
        },
        onChanged: { addListener() {} },
      },
      runtime: {
        sendMessage: async (payload) => {
          sent.push(payload);
          return { ok: true };
        },
      },
    },
  };
  context.globalThis = context;
  context.__chromodsSendMessage = async (payload) => {
    sent.push(["native", payload]);
    return { ok: true };
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  const originalRun = context.chromodsRunShortcutAction;
  context.chromodsRunShortcutAction = async (...args) => {
    ran += 1;
    return originalRun(...args);
  };
  context.chromodsDispatchShortcut("toggle-dark");
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(sent.length, 1);
  assert.equal(sent[0][0], "native");
  assert.equal(sent[0][1].type, "chromods-shortcut-run");
  assert.equal(ran, 0);
});
