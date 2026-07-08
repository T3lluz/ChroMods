chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("youtubeThemingSettings", (stored) => {
    if (stored.youtubeThemingSettings) return;
    chrome.storage.sync.set({
      youtubeThemingSettings: {
        enabled: true,
        features: {
          "immersive-search": true,
          "theater-mode": true,
          "feed-layout": true,
          "compact-sidebar": true,
        },
        subsettings: {
          theater: {
            hideHeader: true,
            hoverComments: true,
            glassComments: true,
            commentsSide: "left",
          },
        },
      },
    });
  });
});
