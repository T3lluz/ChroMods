(function () {
  const STYLE_ID = "youtube-theming-styles";
  const ACCENT_COLOR = "#ff8f6b";

  const FEATURES = {
    "immersive-search": ["styles/immersive-search.css"],
    "compact-sidebar": ["styles/compact-sidebar.css"],
    "hide-filter-chips": ["styles/hide-filter-chips.css"],
    "player-blur": ["styles/player-blur.css"],
    "thumbnail-hover": ["styles/thumbnail-hover.css"],
    "hide-distractions": ["styles/hide-distractions.css"],
    "hide-side-guide": ["styles/hide-side-guide.css"],
    "clean-side-guide": ["styles/clean-side-guide.css"],
    "disable-ambient-mode": ["styles/disable-ambient-mode.css"],
    "better-captions": ["styles/better-captions.css"],
    "youtube-tv": ["styles/youtube-tv.css"],
    "overlay-live-chat": ["styles/overlay-live-chat.css"],
  };

  const FEED_PARTS = {
    compact: "styles/feed-layout-compact.css",
    columnsAuto: "styles/feed-layout-columns-auto.css",
  };

  const THEATER_PARTS = {
    base: "styles/theater-base.css",
    hideHeader: "styles/theater-hide-header.css",
    headerBlur: "styles/theater-header-blur.css",
    hoverComments: "styles/theater-hover-comments.css",
    commentsRight: "styles/theater-comments-right.css",
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
    },
    subsettings: {
      theater: { ...DEFAULT_THEATER },
      feed: { ...DEFAULT_FEED },
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
      features,
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

  function checkTheaterLayoutState() {
    theaterLayoutCheckQueued = false;
    const target = document.querySelector("ytd-watch-flexy");
    const isTheater = Boolean(target?.hasAttribute("theater"));
    if (target === theaterLayoutTarget && isTheater === theaterLayoutState) return;
    theaterLayoutTarget = target;
    theaterLayoutState = isTheater;
    signalPlayerResize();
  }

  function queueTheaterLayoutCheck() {
    if (theaterLayoutCheckQueued) return;
    theaterLayoutCheckQueued = true;
    requestAnimationFrame(checkTheaterLayoutState);
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

  function setTheaterLayoutSyncEnabled(enabled) {
    if (enabled === theaterLayoutSyncEnabled) {
      if (enabled) queueTheaterLayoutCheck();
      return;
    }
    theaterLayoutSyncEnabled = enabled;

    if (!enabled) {
      theaterLayoutObserver?.disconnect();
      theaterLayoutObserver = null;
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
    queueTheaterLayoutCheck();
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
        "youtubeThemingLiveChatPosition",
        "youtubeThemingLiveChatOpacity",
      ]);
      if (!this.enabled) return;
      this.position = stored.youtubeThemingLiveChatPosition || null;
      this.opacity = stored.youtubeThemingLiveChatOpacity ?? 1;
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
      if (document.getElementById("youtube-theming-movable-chat-styles")) return;
      const style = document.createElement("style");
      style.id = "youtube-theming-movable-chat-styles";
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
            youtubeThemingLiveChatOpacity: this.opacity,
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
        youtubeThemingLiveChatPosition: this.position,
        youtubeThemingLiveChatOpacity: this.opacity,
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
      document.getElementById("youtube-theming-movable-chat-styles")?.remove();
    }
  }

  const movableLiveChat = new MovableLiveChat();

  async function applySettings(settings) {
    const generation = ++applyGeneration;
    const merged = mergeSettings(settings);
    const enabledIds = merged.enabled
      ? Object.keys({ ...FEATURES, "theater-mode": true, "feed-layout": true }).filter(
          (id) => merged.features?.[id] !== false
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
    setTheaterLayoutSyncEnabled(
      merged.enabled && merged.features?.["theater-mode"] !== false
    );
    await movableLiveChat.setEnabled(
      merged.enabled && merged.features?.["movable-live-chat"] === true
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
    const stored = await chrome.storage.sync.get("youtubeThemingSettings");
    await bootstrap(mergeSettings(stored.youtubeThemingSettings));
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes.youtubeThemingSettings) return;
    applySettings(mergeSettings(changes.youtubeThemingSettings.newValue));
  });

  init();
})();
