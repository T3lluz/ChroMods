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

  const ACCENT_COLOR = "#ff8f6b";
  const ANIMATION_STYLE_ID = "youtube-theming-animations";

  function injectAnimationCSS() {
    if (document.getElementById(ANIMATION_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = ANIMATION_STYLE_ID;
    style.textContent = `
      @keyframes ytm-glow-out {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.95; }
        40% { opacity: 0.7; }
        100% { transform: translate(-50%, -50%) scale(22); opacity: 0; }
      }
      @keyframes ytm-glow-in {
        0% { transform: translate(-50%, -50%) scale(22); opacity: 0; }
        30% { opacity: 0.65; }
        100% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.95; }
      }
      @keyframes ytm-vignette {
        0% { opacity: 0; }
        15% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes ytm-toast-in {
        0% { transform: translateX(120%) scale(0.9); opacity: 0; }
        70% { transform: translateX(-10px) scale(1.02); opacity: 1; }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes ytm-toast-out {
        0% { transform: translateX(0) scale(1); opacity: 1; }
        100% { transform: translateX(120%) scale(0.9); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  function createGlowRing(isEnabled) {
    injectAnimationCSS();

    const vignette = document.createElement("div");
    Object.assign(vignette.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "2147483645",
      background: isEnabled
        ? `radial-gradient(ellipse 70% 60% at 50% 45%, ${ACCENT_COLOR}55 0%, transparent 70%)`
        : `radial-gradient(ellipse 70% 60% at 50% 45%, rgba(120, 120, 140, 0.35) 0%, transparent 70%)`,
      opacity: "0",
      animation: "ytm-vignette 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    });
    document.documentElement.appendChild(vignette);
    setTimeout(() => vignette.remove(), 1800);

    const ring = document.createElement("div");
    Object.assign(ring.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      width: "280px",
      height: "280px",
      borderRadius: "50%",
      border: `6px solid ${ACCENT_COLOR}`,
      boxShadow: `0 0 120px ${ACCENT_COLOR}, 0 0 240px ${ACCENT_COLOR}88, inset 0 0 80px ${ACCENT_COLOR}66`,
      filter: "blur(8px)",
      pointerEvents: "none",
      zIndex: "2147483646",
      opacity: "0",
      transform: "translate(-50%, -50%)",
    });

    ring.style.animation = isEnabled
      ? "ytm-glow-out 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      : "ytm-glow-in 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards";

    document.documentElement.appendChild(ring);
    setTimeout(() => ring.remove(), 1800);
  }

  function showToast(text, isEnabled) {
    createGlowRing(isEnabled);

    const existing = document.getElementById("youtube-theming-toast");
    if (existing) existing.remove();

    const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;
    const toastBg = isLightMode ? "rgba(245, 247, 250, 0.9)" : "rgba(25, 25, 25, 0.85)";
    const toastColor = isLightMode ? "#343a40" : "#ffffff";
    const shadowColor = isLightMode ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.4)";
    const borderColor = isLightMode ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)";
    const switchBgOff = isLightMode ? "#ced4da" : "#4c4c63";

    const toast = document.createElement("div");
    toast.id = "youtube-theming-toast";
    Object.assign(toast.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "10px 16px",
      background: toastBg,
      backdropFilter: "blur(12px)",
      webkitBackdropFilter: "blur(12px)",
      color: toastColor,
      borderRadius: "14px",
      fontSize: "14px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontWeight: "500",
      boxShadow: `0 8px 32px ${shadowColor}, 0 0 0 1px ${borderColor}`,
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      pointerEvents: "none",
      transform: "translateX(120%) scale(0.9)",
      opacity: "0",
      animation: "ytm-toast-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    });

    const iconUrl = chrome.runtime.getURL("icons/icon48.png");
    toast.innerHTML = `
      <img src="${iconUrl}" alt="" width="20" height="20" style="border-radius:4px;flex-shrink:0" />
      <span>${text}</span>
      <span style="margin-left:4px;width:34px;height:18px;border-radius:999px;background:${isEnabled ? ACCENT_COLOR : switchBgOff};position:relative;flex-shrink:0">
        <span style="position:absolute;top:2px;${isEnabled ? "right:2px" : "left:2px"};width:14px;height:14px;border-radius:50%;background:#fff"></span>
      </span>
    `;

    document.documentElement.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "ytm-toast-out 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards";
      setTimeout(() => toast.remove(), 500);
    }, 3000);
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
    applySettings(mergeSettings(changes.youtubeThemingSettings.newValue));
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
    if (message.action === "showToast") {
      showToast(message.text, message.isEnabled);
      sendResponse({ success: true });
      return true;
    }
    return false;
  });

  init();
})();
