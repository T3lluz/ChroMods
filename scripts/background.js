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
    duckduckgo: { enabled: true },
  },
};

const SETTINGS_KEY = "chroModsSettings";
const LEGACY_SETTINGS_KEY = "youtubeThemingSettings";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get([SETTINGS_KEY, LEGACY_SETTINGS_KEY], (stored) => {
    if (stored[SETTINGS_KEY]) return;
    if (stored[LEGACY_SETTINGS_KEY]) {
      chrome.storage.sync.set({ [SETTINGS_KEY]: stored[LEGACY_SETTINGS_KEY] });
      return;
    }
    chrome.storage.sync.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
  });
});
