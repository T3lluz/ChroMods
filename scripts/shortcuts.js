const CHROMODS_SHORTCUTS_KEY = "chroModsShortcuts";

const CHROMODS_SHORTCUT_ACTIONS = [
  {
    id: "toggle-dark",
    icon: "shortcut-dark",
    title: "Toggle dark mode",
    description: "Force dark mode on or off for the current site.",
  },
  {
    id: "toggle-mods",
    icon: "shortcut-mods",
    title: "Toggle site mods",
    description: "Enable or disable ChroMods on the current supported site.",
  },
];

const CHROMODS_DEFAULT_SHORTCUTS = {
  "toggle-dark": { altKey: true, shiftKey: true, ctrlKey: false, metaKey: false, code: "KeyD" },
  "toggle-mods": { altKey: true, shiftKey: true, ctrlKey: false, metaKey: false, code: "KeyM" },
};

function chromodsNormalizeShortcut(value, fallback) {
  const source = value && typeof value === "object" ? value : fallback;
  if (!source || typeof source !== "object") return null;
  const code = String(source.code || "");
  if (!/^Key[A-Z]$/.test(code) && !/^Digit[0-9]$/.test(code) && !/^F[1-9]$|^F1[0-2]$/.test(code)) {
    return fallback ? chromodsNormalizeShortcut(fallback, null) : null;
  }
  return {
    altKey: Boolean(source.altKey),
    shiftKey: Boolean(source.shiftKey),
    ctrlKey: Boolean(source.ctrlKey),
    metaKey: Boolean(source.metaKey),
    code,
  };
}

function chromodsMergeShortcuts(stored = {}) {
  return Object.fromEntries(
    CHROMODS_SHORTCUT_ACTIONS.map((action) => {
      if (Object.prototype.hasOwnProperty.call(stored, action.id) && stored[action.id] === null) {
        return [action.id, null];
      }
      return [
        action.id,
        chromodsNormalizeShortcut(stored[action.id], CHROMODS_DEFAULT_SHORTCUTS[action.id]),
      ];
    })
  );
}

function chromodsShortcutLabel(shortcut) {
  const normalized = chromodsNormalizeShortcut(shortcut, null);
  if (!normalized) return "None";
  const parts = [];
  if (normalized.ctrlKey) parts.push("Ctrl");
  if (normalized.altKey) parts.push("Alt");
  if (normalized.shiftKey) parts.push("Shift");
  if (normalized.metaKey) parts.push("Meta");
  const key = normalized.code.startsWith("Key")
    ? normalized.code.slice(3)
    : normalized.code.startsWith("Digit")
      ? normalized.code.slice(5)
      : normalized.code;
  parts.push(key);
  return parts.join(" + ");
}

const CHROMODS_SHORTCUT_RUN = "chromods-shortcut-run";

function chromodsModifierOn(event, name, prop) {
  if (event && typeof event.getModifierState === "function") {
    try {
      if (event.getModifierState(name)) return true;
    } catch {
      /* some events don't implement getModifierState */
    }
  }
  return Boolean(event?.[prop]);
}

function chromodsEventCode(event) {
  const code = String(event?.code || "");
  if (/^Key[A-Z]$/.test(code) || /^Digit[0-9]$/.test(code) || /^F[1-9]$|^F1[0-2]$/.test(code)) {
    return code;
  }
  const key = String(event?.key || "");
  if (/^[a-zA-Z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  if (/^F[1-9]$|^F1[0-2]$/.test(key)) return key;
  return "";
}

function chromodsShortcutFromEvent(event) {
  if (!event || typeof event !== "object") return null;
  if (event.key === "Escape" || event.key === "Tab" || event.key === "Backspace") return null;
  const code = chromodsEventCode(event);
  if (!code) return null;
  const altKey = chromodsModifierOn(event, "Alt", "altKey");
  const ctrlKey = chromodsModifierOn(event, "Control", "ctrlKey");
  const metaKey = chromodsModifierOn(event, "Meta", "metaKey");
  const shiftKey = chromodsModifierOn(event, "Shift", "shiftKey");
  if (!altKey && !ctrlKey && !metaKey && !/^F[1-9]$|^F1[0-2]$/.test(code)) {
    return null;
  }
  return chromodsNormalizeShortcut(
    {
      altKey,
      shiftKey,
      ctrlKey,
      metaKey,
      code,
    },
    null
  );
}

function chromodsShortcutsEqual(a, b) {
  const left = chromodsNormalizeShortcut(a, null);
  const right = chromodsNormalizeShortcut(b, null);
  if (!left || !right) return false;
  return (
    left.code === right.code &&
    left.altKey === right.altKey &&
    left.shiftKey === right.shiftKey &&
    left.ctrlKey === right.ctrlKey &&
    left.metaKey === right.metaKey
  );
}

function chromodsEventMatchesShortcut(event, shortcut) {
  const normalized = chromodsNormalizeShortcut(shortcut, null);
  if (!normalized || !event) return false;
  return (
    chromodsEventCode(event) === normalized.code &&
    chromodsModifierOn(event, "Alt", "altKey") === normalized.altKey &&
    chromodsModifierOn(event, "Shift", "shiftKey") === normalized.shiftKey &&
    chromodsModifierOn(event, "Control", "ctrlKey") === normalized.ctrlKey &&
    chromodsModifierOn(event, "Meta", "metaKey") === normalized.metaKey
  );
}

async function chromodsGetShortcuts() {
  const stored = await chrome.storage.sync.get(CHROMODS_SHORTCUTS_KEY);
  return chromodsMergeShortcuts(stored[CHROMODS_SHORTCUTS_KEY]);
}

async function chromodsSetShortcut(actionId, shortcut) {
  const shortcuts = await chromodsGetShortcuts();
  shortcuts[actionId] =
    shortcut === null ? null : chromodsNormalizeShortcut(shortcut, CHROMODS_DEFAULT_SHORTCUTS[actionId]);
  await chrome.storage.sync.set({ [CHROMODS_SHORTCUTS_KEY]: shortcuts });
  return shortcuts;
}

function chromodsShortcutTargetIsEditable(target) {
  if (!target || target === document.body || target === document.documentElement) return false;
  const element = target.nodeType === 1 ? target : target.parentElement;
  if (!element || typeof element.closest !== "function") return false;
  return Boolean(
    element.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")
  );
}

async function chromodsToggleModsForUrl(url) {
  if (typeof matchSiteFromUrl !== "function") return false;
  const site = matchSiteFromUrl(url);
  if (!site) return false;
  const SETTINGS_KEY = "chroModsSettings";
  const LEGACY_SETTINGS_KEY = "youtubeThemingSettings";
  const stored = await chrome.storage.sync.get([SETTINGS_KEY, LEGACY_SETTINGS_KEY]);
  const settings = stored[SETTINGS_KEY] ?? stored[LEGACY_SETTINGS_KEY] ?? {};
  const sites = { ...(settings.sites || {}) };
  const enabled =
    typeof sites[site.id]?.enabled === "boolean"
      ? sites[site.id].enabled
      : site.id === "youtube"
        ? settings.enabled !== false
        : true;
  sites[site.id] = { ...(sites[site.id] || {}), enabled: !enabled };
  settings.sites = sites;
  if (site.id === "youtube") settings.enabled = !enabled;
  await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
  return true;
}

async function chromodsRunShortcutAction(actionId, url = "") {
  if (actionId === "toggle-dark") {
    if (typeof chromodsDarkHostFromUrl !== "function") return false;
    const host = chromodsDarkHostFromUrl(url);
    if (!host) return false;
    const sites = await chromodsGetDarkSites();
    await chromodsSetDarkSite(host, !chromodsIsDarkHostEnabled(sites, host));
    return true;
  }
  if (actionId === "toggle-mods") {
    return chromodsToggleModsForUrl(url);
  }
  return false;
}

const chromodsShortcutRecent = new Map();

async function chromodsHandleShortcutMessage(actionId, url, tabId = 0) {
  const key = `${tabId}:${actionId}`;
  const now = Date.now();
  if (now - (chromodsShortcutRecent.get(key) || 0) < 300) return false;
  chromodsShortcutRecent.set(key, now);
  return chromodsRunShortcutAction(actionId, url);
}

function chromodsRuntimeSend(payload) {
  const send = globalThis.__chromodsSendMessage || chrome.runtime.sendMessage.bind(chrome.runtime);
  return send(payload);
}

function chromodsDispatchShortcut(actionId) {
  const href = typeof location !== "undefined" ? location.href : "";
  const fallback = () => chromodsRunShortcutAction(actionId, href);
  try {
    const sent = chromodsRuntimeSend({ type: CHROMODS_SHORTCUT_RUN, actionId });
    if (sent && typeof sent.then === "function") {
      sent.then((response) => {
        if (!response?.ok) fallback();
      }).catch(() => fallback());
      return;
    }
    // Dark Reader wraps sendMessage and drops the Promise, but still forwards
    // the native call. Running locally as well would toggle twice and cancel.
  } catch {
    fallback();
  }
}

function chromodsBindPageShortcuts() {
  if (globalThis.__chromodsShortcutsBound) return;
  if (typeof location !== "undefined" && location.protocol === "chrome-extension:") return;
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
  globalThis.__chromodsShortcutsBound = true;

  let shortcuts = chromodsMergeShortcuts();
  chromodsGetShortcuts().then((value) => {
    shortcuts = value;
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes[CHROMODS_SHORTCUTS_KEY]) return;
    shortcuts = chromodsMergeShortcuts(changes[CHROMODS_SHORTCUTS_KEY].newValue);
  });

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.repeat) return;
      if (
        chromodsShortcutTargetIsEditable(event.target) &&
        !chromodsModifierOn(event, "Alt", "altKey") &&
        !chromodsModifierOn(event, "Control", "ctrlKey") &&
        !chromodsModifierOn(event, "Meta", "metaKey")
      ) {
        return;
      }
      for (const action of CHROMODS_SHORTCUT_ACTIONS) {
        if (!chromodsEventMatchesShortcut(event, shortcuts[action.id])) continue;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        chromodsDispatchShortcut(action.id);
        break;
      }
    },
    true
  );
}

chromodsBindPageShortcuts();
