importScripts("dark-sites.js", "sites.js", "shortcuts.js");

const DEFAULT_SETTINGS = {
  enabled: true,
  features: {
    "immersive-search": true,
    "theater-mode": true,
    "feed-layout": true,
    "compact-sidebar": true,
    "hide-filter-chips": true,
    "player-blur": true,
    "thumbnail-hover": false,
    "hide-distractions": false,
    "hide-side-guide": false,
    "clean-side-guide": false,
    "disable-ambient-mode": false,
    "better-captions": false,
    "youtube-tv": false,
    "overlay-live-chat": false,
    "movable-live-chat": false,
    "gh-no-tab-text": true,
    "gh-no-footer": true,
    "gh-hover": false,
    "gh-border-mods": true,
    "gh-glass-effect": true,
    "gh-repo-sidebar-hover": false,
    "gh-immersive-search": true,
    "gh-hide-toolbar-separator": true,
    "gh-timeline-badge": true,
    "gh-chip-margin": true,
    "gh-remove-borders": true,
    "g-search-zoom": true,
    "g-glass-effect": true,
    "g-overlay-fix": true,
    "g-shadows-borders": true,
    "g-hover": false,
    "ddg-immersive-search": true,
    "ddg-immersive-popup": true,
    "ddg-glass-effect": true,
    "ddg-animations": true,
    "ddg-misc": true,
    "ddg-no-learn-more": true,
    "ddg-hidden-promo": false,
    "ddg-no-share-feedback": true,
    "ddg-no-footer": true,
    "gmail-no-borders": true,
    "gmail-hidden": true,
    "gmail-preview": false,
    "gmail-glass": true,
    "gmail-rounded-corners": true,
    "gmail-flashbangless-loading": true,
    "gemini-better-text-input": true,
    "gemini-other-changes": true,
    "gemini-hover": false,
    "gemini-input-code": true,
    "x-overlay-fix": true,
    "x-layout-fixes": true,
    "x-hover": false,
    "x-no-thanks": true,
    "twitch-no-footer": true,
    "cgpt-sidebar": true,
    "cgpt-page-header": true,
    "cgpt-composer": true,
    "cgpt-messages": true,
    "cgpt-code": true,
    "cgpt-flyout": true,
    "cgpt-popovers": true,
    "cgpt-pages": true,
    "cgpt-decorative": true,
    "cgpt-fallback": true,
    "cgpt-reduced-motion": true,
    "cgpt-hide-hint": true,
  },
  subsettings: {
    theater: {
      hideHeader: true,
      headerBlur: false,
      hoverComments: true,
      commentsSide: "left",
    },
    feed: {
      columns: "auto",
    },
  },
  sites: {
    youtube: { enabled: true },
    github: { enabled: true },
    google: { enabled: true },
    gmail: { enabled: true },
    gemini: { enabled: true },
    duckduckgo: { enabled: true },
    x: { enabled: true },
    twitch: { enabled: true },
    chatgpt: { enabled: true },
  },
};

const SETTINGS_KEY = "chroModsSettings";
const LEGACY_SETTINGS_KEY = "youtubeThemingSettings";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get([SETTINGS_KEY, LEGACY_SETTINGS_KEY], (stored) => {
    if (chrome.runtime.lastError) return;
    const data = stored || {};
    if (data[SETTINGS_KEY]) return;
    if (data[LEGACY_SETTINGS_KEY]) {
      chrome.storage.sync.set({ [SETTINGS_KEY]: data[LEGACY_SETTINGS_KEY] });
      return;
    }
    chrome.storage.sync.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
  });
});

async function chromodsShortcutTab(tab) {
  if (tab?.id && tab.url) return tab;
  const [active] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return active || tab || null;
}

async function chromodsCaptureTab(tab) {
  if (!tab?.windowId) return null;
  try {
    return await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "jpeg",
      quality: 70,
    });
  } catch {
    return null;
  }
}

async function chromodsApplyDarkShortcut(tab, url) {
  const host = chromodsDarkHostFromUrl(url);
  if (!host || !tab?.id) return false;

  const key = `${tab.id}:toggle-dark`;
  const now = Date.now();
  if (now - (chromodsShortcutRecent.get(key) || 0) < 300) return false;
  chromodsShortcutRecent.set(key, now);

  const sites = await chromodsGetDarkSites();
  const next = !chromodsIsDarkHostEnabled(sites, host);
  const screenshot = await chromodsCaptureTab(tab);

  if (screenshot) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: CHROMODS_DARK_WIPE,
        enabled: next,
        screenshot,
      });
    } catch {
      /* storage apply below still runs */
    }
  }

  await chromodsSetDarkSite(host, next);

  if (!screenshot) {
    try {
      const updated = await chromodsGetDarkSites();
      await chrome.tabs.sendMessage(tab.id, {
        type: CHROMODS_DARK_THEME_UPDATE,
        config: chromodsDarkSiteConfig(updated, host),
        enabled: next,
      });
    } catch {
      /* page may not have the script yet */
    }
  }
  return true;
}

async function chromodsApplyShortcutCommand(actionId, tab) {
  const target = await chromodsShortcutTab(tab);
  const url = target?.url || "";
  if (actionId === "toggle-dark") return chromodsApplyDarkShortcut(target, url);
  return chromodsHandleShortcutMessage(actionId, url, target?.id || 0);
}

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "toggle-dark" && command !== "toggle-mods") return;
  chromodsApplyShortcutCommand(command, tab);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === CHROMODS_SHORTCUT_RUN) {
    chromodsApplyShortcutCommand(message.actionId, sender.tab)
      .then((ok) => sendResponse({ ok: Boolean(ok) }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }
  if (!message || message.type !== "chromods-dark-fetch") return;
  const url = String(message.url || "");
  if (!/^https?:\/\//i.test(url)) {
    sendResponse({ ok: false, error: "invalid url" });
    return;
  }

  fetch(url)
    .then(async (response) => {
      const body = await response.text();
      const headers = {};
      response.headers.forEach((value, name) => {
        headers[name] = value;
      });
      sendResponse({
        ok: true,
        status: response.status,
        body,
        headers,
      });
    })
    .catch((error) => {
      sendResponse({ ok: false, error: String(error && error.message ? error.message : error) });
    });
  return true;
});
