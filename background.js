const YOUTUBE_URLS = ["*://*.youtube.com/*", "*://youtube.com/*"];

const DEFAULT_SETTINGS = {
  enabled: true,
  features: {
    "immersive-search": true,
    "theater-mode": true,
    "feed-layout": true,
    "compact-sidebar": true,
    "hide-filter-chips": true,
    "player-blur": true,
  },
  subsettings: {
    theater: {
      hideHeader: true,
      hoverComments: true,
      commentsSide: "left",
    },
    feed: {
      columns: "auto",
    },
  },
};

function broadcastSettings(settings) {
  chrome.tabs.query({ url: YOUTUBE_URLS }, (tabs) => {
    for (const tab of tabs) {
      if (!tab.id) continue;
      chrome.tabs.sendMessage(tab.id, { action: "applySettings", settings }).catch(() => {});
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("youtubeThemingSettings", (stored) => {
    if (stored.youtubeThemingSettings) return;
    chrome.storage.sync.set({ youtubeThemingSettings: DEFAULT_SETTINGS });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes.youtubeThemingSettings) return;
  broadcastSettings(changes.youtubeThemingSettings.newValue);
});
