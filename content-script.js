(function () {
  const STYLE_ID = "youtube-theming-styles";

  const FEATURES = {
    "immersive-search": ["styles/immersive-search.css"],
    "compact-sidebar": ["styles/compact-sidebar.css"],
  };

  const FEED_PARTS = {
    compact: "styles/feed-layout-compact.css",
    columnsAuto: "styles/feed-layout-columns-auto.css",
  };

  const THEATER_PARTS = {
    base: "styles/theater-base.css",
    hideHeader: "styles/theater-hide-header.css",
    hoverComments: "styles/theater-hover-comments.css",
    commentsRight: "styles/theater-comments-right.css",
  };

  const DEFAULT_THEATER = {
    hideHeader: true,
    hoverComments: true,
    commentsSide: "left",
  };

  const DEFAULT_FEED = {
    columns: "auto",
  };

  const DEFAULT_SETTINGS = {
    enabled: true,
    features: {
      "immersive-search": true,
      "theater-mode": true,
      "feed-layout": true,
      "compact-sidebar": true,
    },
    subsettings: {
      theater: { ...DEFAULT_THEATER },
      feed: { ...DEFAULT_FEED },
    },
  };

  let styleEl = null;
  let observer = null;
  const cssCache = new Map();

  function migrateTheater(theater = {}) {
    const migrated = { ...DEFAULT_THEATER };
    for (const key of Object.keys(DEFAULT_THEATER)) {
      if (key in theater) migrated[key] = theater[key];
    }
    return migrated;
  }

  function mergeSettings(stored = {}) {
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      features: { ...DEFAULT_SETTINGS.features, ...(stored.features || {}) },
      subsettings: {
        theater: migrateTheater(stored.subsettings?.theater),
        feed: {
          ...DEFAULT_FEED,
          ...(stored.subsettings?.feed || {}),
        },
      },
    };
  }

  function getStyleEl() {
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
    }
    return styleEl;
  }

  function ensureLastInHead() {
    const head = document.head || document.documentElement;
    const el = getStyleEl();
    if (head.lastChild !== el) {
      head.appendChild(el);
    }
  }

  function startObserver() {
    if (observer) return;
    const head = document.head || document.documentElement;
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (!mutation.addedNodes.length) continue;
        const addedOurs = Array.from(mutation.addedNodes).some(
          (node) => node.id === STYLE_ID
        );
        if (!addedOurs) {
          ensureLastInHead();
          break;
        }
      }
    });
    observer.observe(head, { childList: true });
  }

  async function loadCssFile(path) {
    if (cssCache.has(path)) {
      return cssCache.get(path);
    }

    const url = chrome.runtime.getURL(path);
    const response = await fetch(url);
    const css = response.ok ? await response.text() : "";
    cssCache.set(path, css);
    return css;
  }

  function getFeedColumnsCss(columns = "auto") {
    if (columns === "auto") {
      return "";
    }

    const count = Number(columns);
    if (!Number.isFinite(count) || count < 1) {
      return "";
    }

    return `ytd-rich-item-renderer[rendered-from-rich-grid] {
  --ytd-rich-grid-items-per-row: ${count} !important;
}`;
  }

  async function loadFeedLayoutCss(feed = DEFAULT_FEED) {
    const paths = [FEED_PARTS.compact];
    const columns = feed.columns ?? "auto";

    if (columns === "auto") {
      paths.push(FEED_PARTS.columnsAuto);
    }

    const chunks = await Promise.all(paths.map(loadCssFile));
    const columnOverride = getFeedColumnsCss(columns);

    return [chunks.join("\n\n"), columnOverride].filter(Boolean).join("\n\n");
  }

  function getTheaterPaths(theater = DEFAULT_THEATER) {
    const paths = [THEATER_PARTS.base];

    if (theater.hideHeader !== false) {
      paths.push(THEATER_PARTS.hideHeader);
    }

    if (theater.hoverComments !== false) {
      paths.push(THEATER_PARTS.hoverComments);

      if (theater.commentsSide === "right") {
        paths.push(THEATER_PARTS.commentsRight);
      }
    }

    return paths;
  }

  async function loadFeatureCss(featureId, settings) {
    if (featureId === "theater-mode") {
      const paths = getTheaterPaths(settings.subsettings?.theater);
      const chunks = await Promise.all(paths.map(loadCssFile));
      return chunks.join("\n\n");
    }

    if (featureId === "feed-layout") {
      return loadFeedLayoutCss(settings.subsettings?.feed);
    }

    const paths = FEATURES[featureId] || [];
    const chunks = await Promise.all(paths.map(loadCssFile));
    return chunks.join("\n\n");
  }

  async function applySettings(settings) {
    const merged = mergeSettings(settings);
    const enabledIds = merged.enabled
      ? Object.keys({ ...FEATURES, "theater-mode": true, "feed-layout": true }).filter(
          (id) => merged.features?.[id] !== false
        )
      : [];

    const chunks = await Promise.all(
      enabledIds.map((id) => loadFeatureCss(id, merged))
    );

    const el = getStyleEl();
    el.textContent = chunks.filter(Boolean).join("\n\n");
    ensureLastInHead();
    startObserver();
  }

  function removeStyles() {
    const el = document.getElementById(STYLE_ID);
    if (el) el.textContent = "";
  }

  async function bootstrap(settings) {
    const run = () => applySettings(settings);
    if (document.head) {
      await run();
    } else {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    }
  }

  async function init() {
    const stored = await chrome.storage.sync.get("youtubeThemingSettings");
    await bootstrap(mergeSettings(stored.youtubeThemingSettings));
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes.youtubeThemingSettings) return;
    bootstrap(mergeSettings(changes.youtubeThemingSettings.newValue));
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "applySettings") {
      applySettings(message.settings).then(() => sendResponse({ success: true }));
      return true;
    }
    if (message.action === "removeStyles") {
      removeStyles();
      sendResponse({ success: true });
      return true;
    }
    return false;
  });

  init();
})();
