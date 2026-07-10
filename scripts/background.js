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
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("youtubeThemingSettings", (stored) => {
    if (stored.youtubeThemingSettings) return;
    chrome.storage.sync.set({ youtubeThemingSettings: DEFAULT_SETTINGS });
  });
});
