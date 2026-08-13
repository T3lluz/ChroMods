(function () {
  const STYLE_ID = "chromods-styles";
  const ACCENT_COLOR = "#ff8f6b";
  const SETTINGS_KEY = "chroModsSettings";
  const LEGACY_SETTINGS_KEY = "youtubeThemingSettings";
  const LIVE_CHAT_POSITION_KEY = "chroModsLiveChatPosition";
  const LIVE_CHAT_OPACITY_KEY = "chroModsLiveChatOpacity";
  const LEGACY_LIVE_CHAT_POSITION_KEY = "youtubeThemingLiveChatPosition";
  const LEGACY_LIVE_CHAT_OPACITY_KEY = "youtubeThemingLiveChatOpacity";
  const MOVABLE_CHAT_STYLE_ID = "chromods-movable-chat-styles";

  const FEATURES = {
    "immersive-search": ["styles/youtube/immersive-search.css"],
    "compact-sidebar": ["styles/youtube/compact-sidebar.css"],
    "hide-filter-chips": ["styles/youtube/hide-filter-chips.css"],
    "player-blur": ["styles/youtube/player-blur.css"],
    "thumbnail-hover": ["styles/youtube/thumbnail-hover.css"],
    "hide-distractions": ["styles/youtube/hide-distractions.css"],
    "hide-side-guide": ["styles/youtube/hide-side-guide.css"],
    "clean-side-guide": ["styles/youtube/clean-side-guide.css"],
    "disable-ambient-mode": ["styles/youtube/disable-ambient-mode.css"],
    "better-captions": ["styles/youtube/better-captions.css"],
    "youtube-tv": ["styles/youtube/youtube-tv.css"],
    "overlay-live-chat": ["styles/youtube/overlay-live-chat.css"],
    "gh-no-tab-text": ["styles/github/gh-no-tab-text.css"],
    "gh-no-footer": ["styles/github/gh-no-footer.css"],
    "gh-hover": ["styles/github/gh-hover.css"],
    "gh-border-mods": ["styles/github/gh-border-mods.css"],
    "gh-glass-effect": ["styles/github/gh-glass-effect.css"],
    "gh-repo-sidebar-hover": ["styles/github/gh-repo-sidebar-hover.css"],
    "gh-immersive-search": ["styles/github/gh-immersive-search.css"],
    "gh-hide-toolbar-separator": ["styles/github/gh-hide-toolbar-separator.css"],
    "gh-timeline-badge": ["styles/github/gh-timeline-badge.css"],
    "gh-chip-margin": ["styles/github/gh-chip-margin.css"],
    "gh-remove-borders": ["styles/github/gh-remove-borders.css"],
    "g-search-zoom": ["styles/google/g-search-zoom.css"],
    "g-glass-effect": ["styles/google/g-glass-effect.css"],
    "g-overlay-fix": ["styles/google/g-overlay-fix.css"],
    "g-shadows-borders": ["styles/google/g-shadows-borders.css"],
    "g-hover": ["styles/google/g-hover.css"],
    "ddg-immersive-search": ["styles/duckduckgo/ddg-immersive-search.css"],
    "ddg-immersive-popup": ["styles/duckduckgo/ddg-immersive-popup.css"],
    "ddg-glass-effect": ["styles/duckduckgo/ddg-glass-effect.css"],
    "ddg-animations": ["styles/duckduckgo/ddg-animations.css"],
    "ddg-misc": ["styles/duckduckgo/ddg-misc.css"],
    "ddg-no-learn-more": ["styles/duckduckgo/ddg-no-learn-more.css"],
    "ddg-hidden-promo": ["styles/duckduckgo/ddg-hidden-promo.css"],
    "ddg-no-share-feedback": ["styles/duckduckgo/ddg-no-share-feedback.css"],
    "ddg-no-footer": ["styles/duckduckgo/ddg-no-footer.css"],
    "gmail-no-borders": ["styles/gmail/gmail-no-borders.css"],
    "gmail-hidden": ["styles/gmail/gmail-hidden.css"],
    "gmail-preview": ["styles/gmail/gmail-preview.css"],
    "gmail-glass": ["styles/gmail/gmail-glass.css"],
    "gmail-rounded-corners": ["styles/gmail/gmail-rounded-corners.css"],
    "gmail-flashbangless-loading": ["styles/gmail/gmail-flashbangless-loading.css"],
    "gemini-better-text-input": ["styles/gemini/gemini-better-text-input.css"],
    "gemini-other-changes": ["styles/gemini/gemini-other-changes.css"],
    "gemini-hover": ["styles/gemini/gemini-hover.css"],
    "gemini-input-code": ["styles/gemini/gemini-input-code.css"],
    "x-overlay-fix": ["styles/x/x-overlay-fix.css"],
    "x-layout-fixes": ["styles/x/x-layout-fixes.css"],
    "x-hover": ["styles/x/x-hover.css"],
    "x-no-thanks": ["styles/x/x-no-thanks.css"],
  };

  const FEATURE_SITE = {
    "gh-no-tab-text": "github",
    "gh-no-footer": "github",
    "gh-hover": "github",
    "gh-border-mods": "github",
    "gh-glass-effect": "github",
    "gh-repo-sidebar-hover": "github",
    "gh-immersive-search": "github",
    "gh-hide-toolbar-separator": "github",
    "gh-timeline-badge": "github",
    "gh-chip-margin": "github",
    "gh-remove-borders": "github",
    "g-search-zoom": "google",
    "g-glass-effect": "google",
    "g-overlay-fix": "google",
    "g-shadows-borders": "google",
    "g-hover": "google",
    "ddg-immersive-search": "duckduckgo",
    "ddg-immersive-popup": "duckduckgo",
    "ddg-glass-effect": "duckduckgo",
    "ddg-animations": "duckduckgo",
    "ddg-misc": "duckduckgo",
    "ddg-no-learn-more": "duckduckgo",
    "ddg-hidden-promo": "duckduckgo",
    "ddg-no-share-feedback": "duckduckgo",
    "ddg-no-footer": "duckduckgo",
    "gmail-no-borders": "gmail",
    "gmail-hidden": "gmail",
    "gmail-preview": "gmail",
    "gmail-glass": "gmail",
    "gmail-rounded-corners": "gmail",
    "gmail-flashbangless-loading": "gmail",
    "gemini-better-text-input": "gemini",
    "gemini-other-changes": "gemini",
    "gemini-hover": "gemini",
    "gemini-input-code": "gemini",
    "x-overlay-fix": "x",
    "x-layout-fixes": "x",
    "x-hover": "x",
    "x-no-thanks": "x",
  };

  const FEED_PARTS = {
    compact: "styles/youtube/feed-layout-compact.css",
    columnsAuto: "styles/youtube/feed-layout-columns-auto.css",
  };

  const THEATER_PARTS = {
    base: "styles/youtube/theater-base.css",
    hideHeader: "styles/youtube/theater-hide-header.css",
    headerBlur: "styles/youtube/theater-header-blur.css",
    hoverComments: "styles/youtube/theater-hover-comments.css",
    commentsRight: "styles/youtube/theater-comments-right.css",
  };

  const DEFAULT_THEATER = {
    hideHeader: true,
    headerBlur: false,
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
    },
    subsettings: {
      theater: { ...DEFAULT_THEATER },
      feed: { ...DEFAULT_FEED },
    },
    sites: {
      youtube: { enabled: true },
      github: { enabled: true },
      google: { enabled: true },
      gmail: { enabled: true },
      gemini: { enabled: true },
      duckduckgo: { enabled: true },
      x: { enabled: true },
    },
  };

  let styleEl = null;
  let observer = null;
  let applyGeneration = 0;
  const cssCache = new Map();

  function migrateTheater(theater = {}) {
    const migrated = { ...DEFAULT_THEATER };
    for (const key of Object.keys(DEFAULT_THEATER)) {
      if (key in theater) migrated[key] = theater[key];
    }
    return migrated;
  }

  function mergeSettings(stored = {}) {
    const features = { ...DEFAULT_SETTINGS.features, ...(stored.features || {}) };
    if (features["hide-side-guide"]) features["compact-sidebar"] = false;
    if (features["movable-live-chat"]) features["overlay-live-chat"] = false;

    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      enabled: stored.sites?.youtube?.enabled ?? stored.enabled ?? true,
      features,
      sites: {
        ...DEFAULT_SETTINGS.sites,
        ...(stored.sites || {}),
      },
      subsettings: {
        theater: migrateTheater(stored.subsettings?.theater),
        feed: {
          ...DEFAULT_FEED,
          ...(stored.subsettings?.feed || {}),
        },
      },
    };
  }

  function getFeatureSite(featureId) {
    if (FEATURE_SITE[featureId]) return FEATURE_SITE[featureId];
    const id = String(featureId);
    if (id.startsWith("ddg-")) return "duckduckgo";
    if (id.startsWith("gh-")) return "github";
    if (id.startsWith("gmail-")) return "gmail";
    if (id.startsWith("gemini-")) return "gemini";
    if (id.startsWith("g-")) return "google";
    if (id.startsWith("x-")) return "x";
    return "youtube";
  }

  function getCurrentSiteId() {
    return matchSiteFromHostname(location.hostname)?.id ?? null;
  }

  function isCurrentSiteEnabled(merged, siteId) {
    if (!siteId) return false;
    if (typeof merged.sites?.[siteId]?.enabled === "boolean") {
      return merged.sites[siteId].enabled;
    }
    return siteId === "youtube" ? merged.enabled !== false : true;
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
    if (!document.head) {
      document.addEventListener("DOMContentLoaded", startObserver, { once: true });
      return;
    }
    const head = document.head;
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

    if (theater.headerBlur !== false) {
      paths.push(THEATER_PARTS.headerBlur);
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

  let theaterLayoutObserver = null;
  let theaterLayoutSyncEnabled = false;
  let theaterLayoutTarget = null;
  let theaterLayoutState = null;
  let theaterLayoutCheckQueued = false;

  function signalPlayerResize() {
    window.dispatchEvent(new Event("resize"));
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    setTimeout(() => window.dispatchEvent(new Event("resize")), 220);
  }

  function syncTheaterLayout({ forceResize = false } = {}) {
    theaterLayoutCheckQueued = false;
    const target = document.querySelector("ytd-watch-flexy");
    const isTheater = Boolean(target?.hasAttribute("theater"));
    const stateChanged =
      target !== theaterLayoutTarget || isTheater !== theaterLayoutState;

    theaterLayoutTarget = target;
    theaterLayoutState = isTheater;

    if (stateChanged || (forceResize && isTheater)) {
      signalPlayerResize();
    }
  }

  function queueTheaterLayoutCheck(options) {
    if (theaterLayoutCheckQueued) return;
    theaterLayoutCheckQueued = true;
    requestAnimationFrame(() => syncTheaterLayout(options));
  }

  function handleTheaterLayoutMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        queueTheaterLayoutCheck();
        return;
      }
      const containsWatchPage = Array.from(mutation.addedNodes).some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.matches?.("ytd-watch-flexy") || node.querySelector?.("ytd-watch-flexy"))
      );
      if (containsWatchPage) {
        queueTheaterLayoutCheck();
        return;
      }
    }
  }

  function onTheaterNavigateFinish() {
    if (!theaterLayoutSyncEnabled) return;
    queueTheaterLayoutCheck({ forceResize: true });
  }

  function setTheaterLayoutSyncEnabled(enabled) {
    if (enabled === theaterLayoutSyncEnabled) {
      if (enabled) queueTheaterLayoutCheck({ forceResize: true });
      return;
    }
    theaterLayoutSyncEnabled = enabled;

    if (!enabled) {
      theaterLayoutObserver?.disconnect();
      theaterLayoutObserver = null;
      window.removeEventListener("yt-navigate-finish", onTheaterNavigateFinish);
      theaterLayoutTarget = null;
      theaterLayoutState = null;
      signalPlayerResize();
      return;
    }

    if (!theaterLayoutObserver) {
      theaterLayoutObserver = new MutationObserver(handleTheaterLayoutMutations);
      theaterLayoutObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["theater"],
      });
    }
    window.addEventListener("yt-navigate-finish", onTheaterNavigateFinish);
    queueTheaterLayoutCheck({ forceResize: true });
  }

  class MovableLiveChat {
    constructor() {
      this.enabled = false;
      this.chat = null;
      this.observer = null;
      this.position = null;
      this.opacity = 1;
      this.syncQueued = false;
      this.onPageChange = () => this.scheduleSync();
      this.onResize = () => this.constrainToViewport();
    }

    async setEnabled(enabled) {
      if (enabled === this.enabled) {
        if (enabled) this.sync();
        return;
      }

      this.enabled = enabled;
      if (!enabled) {
        this.destroy();
        return;
      }

      const stored = await chrome.storage.local.get([
        LIVE_CHAT_POSITION_KEY,
        LIVE_CHAT_OPACITY_KEY,
        LEGACY_LIVE_CHAT_POSITION_KEY,
        LEGACY_LIVE_CHAT_OPACITY_KEY,
      ]);
      if (!this.enabled) return;
      this.position = stored[LIVE_CHAT_POSITION_KEY] || stored[LEGACY_LIVE_CHAT_POSITION_KEY] || null;
      this.opacity = stored[LIVE_CHAT_OPACITY_KEY] ?? stored[LEGACY_LIVE_CHAT_OPACITY_KEY] ?? 1;
      this.injectStyles();
      this.observer = new MutationObserver(() => this.scheduleSync());
      this.observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["theater"],
      });
      window.addEventListener("yt-navigate-finish", this.onPageChange);
      window.addEventListener("resize", this.onResize);
      this.sync();
    }

    scheduleSync() {
      if (this.syncQueued || !this.enabled) return;
      this.syncQueued = true;
      requestAnimationFrame(() => {
        this.syncQueued = false;
        this.sync();
      });
    }

    injectStyles() {
      if (document.getElementById(MOVABLE_CHAT_STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = MOVABLE_CHAT_STYLE_ID;
      style.textContent = `
        ytd-watch-flexy[theater] #chat.ytm-movable-chat {
          position: fixed !important;
          z-index: 2001 !important;
          display: flex !important;
          flex-direction: column !important;
          min-width: 240px !important;
          min-height: 220px !important;
          margin: 0 !important;
          overflow: hidden !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 14px !important;
          background: var(--yt-spec-base-background, #0f0f0f) !important;
          box-shadow: 0 14px 50px rgba(0,0,0,.5) !important;
          transform: none !important;
        }
        #chat.ytm-movable-chat iframe {
          width: 100% !important;
          height: 100% !important;
        }
        #chat .ytm-chat-drag-handle {
          display: none;
          height: 14px;
          flex: 0 0 14px;
          cursor: grab;
          touch-action: none;
          background: linear-gradient(90deg, transparent, ${ACCENT_COLOR}99, transparent);
          opacity: .55;
          transition: opacity .18s ease;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat .ytm-chat-drag-handle {
          display: block;
        }
        #chat.ytm-movable-chat:hover .ytm-chat-drag-handle {
          opacity: 1;
        }
        #chat .ytm-chat-resize-handle {
          display: none;
          position: absolute;
          right: 0;
          bottom: 0;
          width: 22px;
          height: 22px;
          cursor: nwse-resize;
          touch-action: none;
          background: linear-gradient(135deg, transparent 52%, ${ACCENT_COLOR} 53%);
          opacity: .7;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat .ytm-chat-resize-handle {
          display: block;
        }
        #chat.ytm-chat-interacting iframe {
          pointer-events: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    sync() {
      if (!this.enabled) return;
      const chat = document.querySelector("ytd-watch-flexy #chat");
      if (!chat) return;

      if (this.chat !== chat) {
        this.detachChat();
        this.chat = chat;
        this.setupChat();
      }

      const inTheater = Boolean(document.querySelector("ytd-watch-flexy[theater]"));
      this.chat.classList.toggle("ytm-movable-chat", inTheater);
      if (inTheater) {
        this.applyPosition();
      } else {
        this.clearPosition();
      }
    }

    setupChat() {
      const dragHandle = document.createElement("div");
      dragHandle.className = "ytm-chat-drag-handle";
      dragHandle.setAttribute("aria-hidden", "true");
      this.chat.prepend(dragHandle);

      const resizeHandle = document.createElement("div");
      resizeHandle.className = "ytm-chat-resize-handle";
      resizeHandle.setAttribute("aria-hidden", "true");
      this.chat.appendChild(resizeHandle);

      dragHandle.addEventListener("pointerdown", (event) =>
        this.startInteraction(event, "move")
      );
      resizeHandle.addEventListener("pointerdown", (event) =>
        this.startInteraction(event, "resize")
      );
      dragHandle.addEventListener(
        "wheel",
        (event) => {
          if (!this.chat.classList.contains("ytm-movable-chat")) return;
          event.preventDefault();
          this.opacity = Math.max(
            0.2,
            Math.min(1, this.opacity + (event.deltaY < 0 ? 0.05 : -0.05))
          );
          this.chat.style.setProperty("opacity", String(this.opacity), "important");
          chrome.storage.local.set({
            [LIVE_CHAT_OPACITY_KEY]: this.opacity,
          });
        },
        { passive: false }
      );
    }

    startInteraction(event, mode) {
      if (!this.chat?.classList.contains("ytm-movable-chat")) return;
      event.preventDefault();
      const start = this.chat.getBoundingClientRect();
      const originX = event.clientX;
      const originY = event.clientY;
      const handle = event.currentTarget;
      this.chat.classList.add("ytm-chat-interacting");
      handle.setPointerCapture(event.pointerId);

      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - originX;
        const dy = moveEvent.clientY - originY;
        if (mode === "move") {
          this.setRect(start.left + dx, start.top + dy, start.width, start.height);
        } else {
          this.setRect(
            start.left,
            start.top,
            Math.max(240, start.width + dx),
            Math.max(220, start.height + dy)
          );
        }
      };

      const onEnd = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onEnd);
        handle.removeEventListener("pointercancel", onEnd);
        this.chat?.classList.remove("ytm-chat-interacting");
        this.constrainToViewport();
        this.savePosition();
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onEnd);
      handle.addEventListener("pointercancel", onEnd);
    }

    setRect(left, top, width, height) {
      if (!this.chat) return;
      const maxWidth = Math.max(240, window.innerWidth - Math.max(0, left));
      const maxHeight = Math.max(220, window.innerHeight - Math.max(0, top));
      this.chat.style.setProperty(
        "left",
        `${Math.max(0, Math.min(left, window.innerWidth - 80))}px`,
        "important"
      );
      this.chat.style.setProperty(
        "top",
        `${Math.max(0, Math.min(top, window.innerHeight - 50))}px`,
        "important"
      );
      this.chat.style.setProperty("right", "auto", "important");
      this.chat.style.setProperty(
        "width",
        `${Math.min(width, maxWidth)}px`,
        "important"
      );
      this.chat.style.setProperty(
        "height",
        `${Math.min(height, maxHeight)}px`,
        "important"
      );
    }

    applyPosition() {
      if (!this.chat) return;
      const fallback = {
        left: Math.max(0, window.innerWidth - 420),
        top: 60,
        width: 400,
        height: Math.min(620, window.innerHeight - 80),
      };
      const position = { ...fallback, ...(this.position || {}) };
      this.setRect(position.left, position.top, position.width, position.height);
      this.chat.style.setProperty("opacity", String(this.opacity), "important");
    }

    constrainToViewport() {
      if (!this.chat?.classList.contains("ytm-movable-chat")) return;
      const rect = this.chat.getBoundingClientRect();
      this.setRect(
        Math.min(rect.left, window.innerWidth - Math.min(80, rect.width)),
        Math.min(rect.top, window.innerHeight - 50),
        Math.min(rect.width, window.innerWidth),
        Math.min(rect.height, window.innerHeight)
      );
    }

    savePosition() {
      if (!this.chat) return;
      const rect = this.chat.getBoundingClientRect();
      this.position = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
      chrome.storage.local.set({
        [LIVE_CHAT_POSITION_KEY]: this.position,
        [LIVE_CHAT_OPACITY_KEY]: this.opacity,
      });
    }

    clearPosition() {
      if (!this.chat) return;
      for (const property of [
        "left",
        "right",
        "top",
        "width",
        "height",
        "opacity",
        "position",
      ]) {
        this.chat.style.removeProperty(property);
      }
    }

    detachChat() {
      if (!this.chat) return;
      this.chat.classList.remove("ytm-movable-chat", "ytm-chat-interacting");
      this.clearPosition();
      this.chat.querySelector(".ytm-chat-drag-handle")?.remove();
      this.chat.querySelector(".ytm-chat-resize-handle")?.remove();
      this.chat = null;
    }

    destroy() {
      this.observer?.disconnect();
      this.observer = null;
      window.removeEventListener("yt-navigate-finish", this.onPageChange);
      window.removeEventListener("resize", this.onResize);
      this.detachChat();
      document.getElementById(MOVABLE_CHAT_STYLE_ID)?.remove();
    }
  }

  const movableLiveChat = new MovableLiveChat();

  const THEATER_COMMENTS_WIDTH_KEY = "chroModsTheaterCommentsWidth";
  const LEGACY_THEATER_COMMENTS_WIDTH_KEY = "youtubeThemingTheaterCommentsWidth";
  const THEATER_COMMENTS_MIN_WIDTH = 300;
  const THEATER_COMMENTS_MAX_WIDTH = 720;

  class TheaterHoverComments {
    constructor() {
      this.enabled = false;
      this.commentsSide = "left";
      this.widths = { left: null, right: null };
      this.comments = null;
      this.watchFlexy = null;
      this.handle = null;
      this.observer = null;
      this.syncQueued = false;
      this.onPageChange = () => this.scheduleSync();
    }

    async setEnabled(enabled, options = {}) {
      const nextSide = options.commentsSide === "right" ? "right" : "left";
      const sideChanged = nextSide !== this.commentsSide;

      if (enabled === this.enabled && !sideChanged) {
        if (enabled) this.sync();
        return;
      }

      this.commentsSide = nextSide;

      if (!enabled) {
        this.enabled = false;
        this.destroy();
        return;
      }

      const stored = await chrome.storage.local.get([
        THEATER_COMMENTS_WIDTH_KEY,
        LEGACY_THEATER_COMMENTS_WIDTH_KEY,
      ]);
      this.enabled = true;
      this.widths = {
        left: null,
        right: null,
        ...(stored[LEGACY_THEATER_COMMENTS_WIDTH_KEY] || {}),
        ...(stored[THEATER_COMMENTS_WIDTH_KEY] || {}),
      };
      this.ensureObserver();
      this.sync();
    }

    ensureObserver() {
      if (this.observer) return;
      this.observer = new MutationObserver(() => this.scheduleSync());
      this.observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["theater"],
      });
      window.addEventListener("yt-navigate-finish", this.onPageChange);
    }

    scheduleSync() {
      if (this.syncQueued) return;
      this.syncQueued = true;
      requestAnimationFrame(() => {
        this.syncQueued = false;
        this.sync();
      });
    }

    getStoredWidth() {
      const stored = this.widths[this.commentsSide];
      if (!Number.isFinite(stored)) return null;
      return this.clampWidth(stored);
    }

    clampWidth(width) {
      const maxByViewport = Math.max(
        THEATER_COMMENTS_MIN_WIDTH,
        window.innerWidth - 64
      );
      return Math.round(
        Math.min(
          THEATER_COMMENTS_MAX_WIDTH,
          maxByViewport,
          Math.max(THEATER_COMMENTS_MIN_WIDTH, width)
        )
      );
    }

    applyWidth(width) {
      if (!this.watchFlexy || !Number.isFinite(width)) return;
      const clamped = this.clampWidth(width);
      this.widths[this.commentsSide] = clamped;
      this.watchFlexy.style.setProperty(
        "--ytm-comments-panel-width",
        `${clamped}px`
      );
      if (this.comments) {
        this.comments.style.setProperty("width", `${clamped}px`, "important");
      }
    }

    clearWidth() {
      this.watchFlexy?.style.removeProperty("--ytm-comments-panel-width");
      this.comments?.style.removeProperty("width");
    }

    saveWidth() {
      chrome.storage.local.set({
        [THEATER_COMMENTS_WIDTH_KEY]: this.widths,
      });
    }

    getHandleMount() {
      if (!this.comments) return null;
      const root = this.comments.shadowRoot;
      if (root) {
        this.injectShadowHandleStyles(root);
        const container =
          root.querySelector("#header")?.parentElement ||
          root.querySelector("#contents")?.parentElement ||
          root.querySelector("#container") ||
          root.firstElementChild;
        return container || root;
      }
      return this.comments;
    }

    injectShadowHandleStyles(root) {
      if (root.querySelector("#ytm-comments-handle-style")) return;
      const style = document.createElement("style");
      style.id = "ytm-comments-handle-style";
      style.textContent = `
        .ytm-comments-resize-handle {
          position: absolute;
          top: 50%;
          z-index: 5;
          width: 4px;
          height: 44px;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.22);
          transform: translateY(-50%);
          cursor: ew-resize;
          touch-action: none;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        :host(.ytm-comments-side-left) .ytm-comments-resize-handle {
          right: 10px;
          left: auto;
        }
        :host(.ytm-comments-side-right) .ytm-comments-resize-handle {
          left: 10px;
          right: auto;
        }
        :host(:hover) .ytm-comments-resize-handle,
        :host(.ytm-comments-interacting) .ytm-comments-resize-handle {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
        .ytm-comments-resize-handle:hover,
        .ytm-comments-resize-handle.ytm-comments-resize-active {
          background: rgba(255, 255, 255, 0.42);
        }
      `;
      root.appendChild(style);
    }

    ensureHandle() {
      const mount = this.getHandleMount();
      if (!mount) return;

      if (this.handle?.parentElement === mount) return;

      this.handle?.remove();
      this.handle = document.createElement("div");
      this.handle.className = "ytm-comments-resize-handle";
      this.handle.setAttribute("aria-hidden", "true");
      this.handle.addEventListener("pointerdown", (event) => this.startResize(event));
      mount.appendChild(this.handle);
    }

    removeHandle() {
      this.handle?.remove();
      this.handle = null;
      this.comments?.shadowRoot?.querySelector("#ytm-comments-handle-style")?.remove();
    }

    startResize(event) {
      if (!this.comments || !this.watchFlexy || !this.handle) return;
      event.preventDefault();
      event.stopPropagation();

      const startWidth =
        this.comments.getBoundingClientRect().width || this.getStoredWidth() || 360;
      const originX = event.clientX;
      const handle = event.currentTarget;
      const side = this.commentsSide;

      this.comments.classList.add("ytm-comments-interacting");
      this.handle.classList.add("ytm-comments-resize-active");
      handle.setPointerCapture(event.pointerId);

      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - originX;
        const nextWidth = side === "left" ? startWidth + dx : startWidth - dx;
        this.applyWidth(nextWidth);
      };

      const onEnd = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onEnd);
        handle.removeEventListener("pointercancel", onEnd);
        this.comments?.classList.remove("ytm-comments-interacting");
        this.handle?.classList.remove("ytm-comments-resize-active");
        this.saveWidth();
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onEnd);
      handle.addEventListener("pointercancel", onEnd);
    }

    detachComments() {
      if (!this.comments) return;
      this.comments.classList.remove(
        "ytm-theater-comments-resizable",
        "ytm-comments-interacting",
        "ytm-comments-side-left",
        "ytm-comments-side-right"
      );
      this.removeHandle();
      this.comments = null;
    }

    sync() {
      if (!this.enabled) return;

      const watchFlexy = document.querySelector("ytd-watch-flexy[theater]:not([fullscreen])");
      const inTheater = Boolean(watchFlexy);

      if (!inTheater) {
        if (this.watchFlexy) this.clearWidth();
        this.detachComments();
        this.watchFlexy = null;
        return;
      }

      const comments = watchFlexy.querySelector("ytd-comments");
      if (!comments) return;

      if (this.comments !== comments) {
        this.detachComments();
        this.comments = comments;
      }

      this.watchFlexy = watchFlexy;
      this.comments.classList.add("ytm-theater-comments-resizable");
      this.comments.classList.toggle("ytm-comments-side-left", this.commentsSide === "left");
      this.comments.classList.toggle("ytm-comments-side-right", this.commentsSide === "right");
      this.ensureHandle();

      const storedWidth = this.getStoredWidth();
      if (storedWidth) {
        this.applyWidth(storedWidth);
      } else {
        this.clearWidth();
      }
    }

    destroy() {
      this.observer?.disconnect();
      this.observer = null;
      window.removeEventListener("yt-navigate-finish", this.onPageChange);
      this.clearWidth();
      this.detachComments();
      this.watchFlexy = null;
    }
  }

  const theaterHoverComments = new TheaterHoverComments();

  async function applySettings(settings) {
    const generation = ++applyGeneration;
    const merged = mergeSettings(settings);
    const siteId = getCurrentSiteId();
    const siteEnabled = isCurrentSiteEnabled(merged, siteId);
    const enabledIds = siteEnabled
      ? Object.keys({ ...FEATURES, "theater-mode": true, "feed-layout": true }).filter(
          (id) => merged.features?.[id] !== false && getFeatureSite(id) === siteId
        )
      : [];

    const chunks = await Promise.all(
      enabledIds.map((id) => loadFeatureCss(id, merged))
    );
    if (generation !== applyGeneration) return;

    const el = getStyleEl();
    el.textContent = chunks.filter(Boolean).join("\n\n");
    ensureLastInHead();
    startObserver();

    const youtubeEnabled = siteId === "youtube" && siteEnabled;
    setTheaterLayoutSyncEnabled(
      youtubeEnabled && merged.features?.["theater-mode"] !== false
    );
    await movableLiveChat.setEnabled(
      youtubeEnabled && merged.features?.["movable-live-chat"] === true
    );
    await theaterHoverComments.setEnabled(
      youtubeEnabled &&
        merged.features?.["theater-mode"] !== false &&
        merged.subsettings?.theater?.hoverComments !== false,
      { commentsSide: merged.subsettings?.theater?.commentsSide ?? "left" }
    );
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
    const stored = await chrome.storage.sync.get([SETTINGS_KEY, LEGACY_SETTINGS_KEY]);
    await bootstrap(mergeSettings(stored[SETTINGS_KEY] ?? stored[LEGACY_SETTINGS_KEY]));
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes[SETTINGS_KEY]) {
      applySettings(mergeSettings(changes[SETTINGS_KEY].newValue));
      return;
    }
    if (changes[LEGACY_SETTINGS_KEY]) {
      applySettings(mergeSettings(changes[LEGACY_SETTINGS_KEY].newValue));
    }
  });

  init();
})();
