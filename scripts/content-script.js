(function () {
  const STYLE_ID = "chromods-styles";
  const ACCENT_COLOR = "#ff8f6b";
  const SETTINGS_KEY = "chroModsSettings";
  const LEGACY_SETTINGS_KEY = "youtubeThemingSettings";
  const LIVE_CHAT_POSITION_KEY = "chroModsLiveChatPosition";
  const LIVE_CHAT_OPACITY_KEY = "chroModsLiveChatOpacity";
  const LIVE_CHAT_COMPACT_KEY = "chroModsLiveChatCompact";
  const LIVE_CHAT_OPACITY_MIGRATED_KEY = "chroModsLiveChatOpacityMigrated";
  const LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY = "chroModsLiveChatOpacityTranslucentV2";
  const LEGACY_LIVE_CHAT_POSITION_KEY = "youtubeThemingLiveChatPosition";
  const LEGACY_LIVE_CHAT_OPACITY_KEY = "youtubeThemingLiveChatOpacity";
  const MOVABLE_CHAT_STYLE_ID = "chromods-movable-chat-styles";
  const TWITCH_MOVABLE_CHAT_STYLE_ID = "chromods-twitch-movable-chat-styles";
  const TWITCH_LIVE_CHAT_POSITION_KEY = "chroModsTwitchLiveChatPosition";
  const TWITCH_LIVE_CHAT_OPACITY_KEY = "chroModsTwitchLiveChatOpacity";
  const TWITCH_LIVE_CHAT_COMPACT_KEY = "chroModsTwitchLiveChatCompact";
  const TWITCH_LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY =
    "chroModsTwitchLiveChatOpacityTranslucentV2";
  const LIVE_CHAT_MIN_WIDTH = 300;
  const LIVE_CHAT_MIN_HEIGHT = 320;
  const LIVE_CHAT_DEFAULT_OPACITY = 0.45;
  const LIVE_CHAT_LEGACY_DEFAULT_OPACITY = 0.82;
  const LIVE_CHAT_IFRAME_STYLE_ID = "ytm-movable-chat-iframe";
  const LIVE_CHAT_COMPACT_IFRAME_CSS = `
    yt-live-chat-header-renderer,
    yt-live-chat-message-input-renderer,
    yt-live-chat-viewer-engagement-message-renderer,
    yt-live-chat-banner-manager,
    yt-live-chat-ticker-renderer,
    #action-panel,
    yt-live-chat-action-panel-renderer {
      display: none !important;
    }
    yt-live-chat-renderer,
    yt-live-chat-item-list-renderer,
    #item-list,
    #items,
    #item-scroller,
    #chat-messages,
    #contents {
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }
  `;
  const LIVE_CHAT_SOFT_IFRAME_CSS = `
    yt-live-chat-renderer {
      background: color-mix(in srgb, var(--yt-spec-base-background, #0f0f0f) 88%, transparent) !important;
    }
  `;
  const LIVE_CHAT_TRANSLUCENT_IFRAME_CSS = `
    yt-live-chat-renderer {
      background: transparent !important;
      background-color: transparent !important;
    }
  `;

  const FEATURES = {
    "immersive-search": ["styles/youtube/immersive-search.css"],
    "compact-sidebar": ["styles/youtube/compact-sidebar.css"],
    "hide-filter-chips": ["styles/youtube/hide-filter-chips.css"],
    "player-blur": ["styles/youtube/player-blur.css"],
    "fullscreen-transition": ["styles/youtube/fullscreen-transition.css"],
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
    "twitch-no-footer": ["styles/twitch/twitch-no-footer.css"],
    "cgpt-sidebar": ["styles/chatgpt/cgpt-tokens.css", "styles/chatgpt/cgpt-sidebar.css"],
    "cgpt-page-header": ["styles/chatgpt/cgpt-tokens.css", "styles/chatgpt/cgpt-page-header.css"],
    "cgpt-composer": ["styles/chatgpt/cgpt-tokens.css", "styles/chatgpt/cgpt-composer.css"],
    "cgpt-messages": ["styles/chatgpt/cgpt-tokens.css", "styles/chatgpt/cgpt-messages.css"],
    "cgpt-code": ["styles/chatgpt/cgpt-tokens.css", "styles/chatgpt/cgpt-code.css"],
    "cgpt-flyout": ["styles/chatgpt/cgpt-tokens.css", "styles/chatgpt/cgpt-flyout.css"],
    "cgpt-popovers": ["styles/chatgpt/cgpt-tokens.css", "styles/chatgpt/cgpt-popovers.css"],
    "cgpt-pages": ["styles/chatgpt/cgpt-tokens.css", "styles/chatgpt/cgpt-pages.css"],
    "cgpt-decorative": ["styles/chatgpt/cgpt-decorative.css"],
    "cgpt-fallback": ["styles/chatgpt/cgpt-fallback.css"],
    "cgpt-reduced-motion": ["styles/chatgpt/cgpt-reduced-motion.css"],
    "cgpt-hide-hint": ["styles/chatgpt/cgpt-hide-hint.css"],
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
    "twitch-no-footer": "twitch",
    "cgpt-sidebar": "chatgpt",
    "cgpt-page-header": "chatgpt",
    "cgpt-composer": "chatgpt",
    "cgpt-messages": "chatgpt",
    "cgpt-code": "chatgpt",
    "cgpt-flyout": "chatgpt",
    "cgpt-popovers": "chatgpt",
    "cgpt-pages": "chatgpt",
    "cgpt-decorative": "chatgpt",
    "cgpt-fallback": "chatgpt",
    "cgpt-reduced-motion": "chatgpt",
    "cgpt-hide-hint": "chatgpt",
  };

  const FEED_PARTS = {
    compact: "styles/youtube/feed-layout-compact.css",
    grid: "styles/youtube/feed-layout-grid.css",
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

  const DEFAULT_MOVABLE_LIVE_CHAT = {
    chatOnly: false,
    background: "solid",
  };

  const DEFAULT_TWITCH_MOVABLE_LIVE_CHAT = {
    chatOnly: true,
    background: "solid",
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
      "fullscreen-transition": true,
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
      "twitch-movable-live-chat": false,
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
      theater: { ...DEFAULT_THEATER },
      feed: { ...DEFAULT_FEED },
      movableLiveChat: { ...DEFAULT_MOVABLE_LIVE_CHAT },
      twitchMovableLiveChat: { ...DEFAULT_TWITCH_MOVABLE_LIVE_CHAT },
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

  function migrateMovableLiveChat(movable = {}, defaults = DEFAULT_MOVABLE_LIVE_CHAT) {
    const migrated = { ...defaults };
    if ("chatOnly" in movable) migrated.chatOnly = Boolean(movable.chatOnly);
    if (["solid", "soft", "translucent"].includes(movable.background)) {
      migrated.background = movable.background;
    } else if ("translucent" in movable) {
      migrated.background = movable.translucent === false ? "solid" : "translucent";
    }
    return migrated;
  }

  function mergeSettings(stored = {}) {
    const features = { ...DEFAULT_SETTINGS.features, ...(stored.features || {}) };
    if (features["hide-side-guide"]) features["compact-sidebar"] = false;
    if (features["movable-live-chat"]) features["overlay-live-chat"] = false;

    const youtubeEnabled = stored.sites?.youtube?.enabled ?? stored.enabled ?? true;

    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      enabled: youtubeEnabled,
      features,
      sites: {
        ...DEFAULT_SETTINGS.sites,
        ...(stored.sites || {}),
        youtube: {
          ...(stored.sites?.youtube || DEFAULT_SETTINGS.sites.youtube),
          enabled: youtubeEnabled,
        },
      },
      subsettings: {
        theater: migrateTheater(stored.subsettings?.theater),
        feed: {
          ...DEFAULT_FEED,
          ...(stored.subsettings?.feed || {}),
        },
        movableLiveChat: migrateMovableLiveChat(
          stored.subsettings?.movableLiveChat
        ),
        twitchMovableLiveChat: migrateMovableLiveChat(
          stored.subsettings?.twitchMovableLiveChat,
          DEFAULT_TWITCH_MOVABLE_LIVE_CHAT
        ),
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
    if (id.startsWith("twitch-")) return "twitch";
    if (id.startsWith("cgpt-")) return "chatgpt";
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
    if (response.ok) cssCache.set(path, css);
    return css;
  }

  function getFeedColumnsCss(columns = "auto") {
    if (columns === "auto") {
      return "";
    }

    const count = Math.round(Number(columns));
    if (!Number.isFinite(count) || count < 3 || count > 6) {
      return "";
    }

    return `ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer {
  grid-template-columns: repeat(${count}, minmax(0, 1fr)) !important;
}`;
  }

  async function loadFeedLayoutCss(feed = DEFAULT_FEED) {
    const chunks = await Promise.all(
      [FEED_PARTS.compact, FEED_PARTS.grid].map(loadCssFile)
    );
    const columnOverride = getFeedColumnsCss(feed.columns ?? "auto");

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

  /* Watch-state notifications.
     Theater layout, movable chat, and the hover comments panel all need to know
     when the player switches between default, theater, and fullscreen. Watching
     childList mutations across the whole document costs a callback for every DOM
     change YouTube makes — thousands of them during a theater transition — so
     watch the two attributes that matter and re-check a few times after a
     navigation, when YouTube builds the rest of the watch page. */
  const WATCH_STATE_ATTRIBUTES = ["theater", "fullscreen"];
  const WATCH_SETTLE_DELAYS = [300, 900, 2000];
  const watchStateListeners = new Set();
  let watchStateObserver = null;
  let watchStateNotifyQueued = false;
  let watchSettleTimers = [];

  function notifyWatchStateListeners() {
    watchStateNotifyQueued = false;
    for (const listener of [...watchStateListeners]) listener();
  }

  function queueWatchStateNotify() {
    if (watchStateNotifyQueued || !watchStateListeners.size) return;
    watchStateNotifyQueued = true;
    requestAnimationFrame(notifyWatchStateListeners);
  }

  function clearWatchSettleTimers() {
    for (const timer of watchSettleTimers) clearTimeout(timer);
    watchSettleTimers = [];
  }

  function scheduleWatchStateSettle() {
    queueWatchStateNotify();
    clearWatchSettleTimers();
    watchSettleTimers = WATCH_SETTLE_DELAYS.map((delay) =>
      setTimeout(queueWatchStateNotify, delay)
    );
  }

  function startWatchStateObserver() {
    if (watchStateObserver) return;
    watchStateObserver = new MutationObserver(queueWatchStateNotify);
    watchStateObserver.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: WATCH_STATE_ATTRIBUTES,
    });
    window.addEventListener("yt-navigate-finish", scheduleWatchStateSettle);
    window.addEventListener("yt-page-data-updated", scheduleWatchStateSettle);
  }

  function stopWatchStateObserver() {
    watchStateObserver?.disconnect();
    watchStateObserver = null;
    window.removeEventListener("yt-navigate-finish", scheduleWatchStateSettle);
    window.removeEventListener("yt-page-data-updated", scheduleWatchStateSettle);
    clearWatchSettleTimers();
  }

  function addWatchStateListener(listener) {
    watchStateListeners.add(listener);
    startWatchStateObserver();
    scheduleWatchStateSettle();
  }

  function removeWatchStateListener(listener) {
    watchStateListeners.delete(listener);
    if (!watchStateListeners.size) stopWatchStateObserver();
  }

  let theaterLayoutSyncEnabled = false;
  let theaterLayoutTarget = null;
  let theaterLayoutState = null;

  function signalPlayerResize() {
    // One dispatch per real state change: YouTube's resize handler re-measures
    // the entire watch page, so repeats land as dropped frames mid-transition.
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }

  function syncTheaterLayout() {
    const target = document.querySelector("ytd-watch-flexy");
    const isTheater = Boolean(target?.hasAttribute("theater"));
    const stateChanged =
      target !== theaterLayoutTarget || isTheater !== theaterLayoutState;

    theaterLayoutTarget = target;
    theaterLayoutState = isTheater;

    if (stateChanged) signalPlayerResize();
  }

  function setTheaterLayoutSyncEnabled(enabled) {
    if (enabled === theaterLayoutSyncEnabled) return;
    theaterLayoutSyncEnabled = enabled;

    if (!enabled) {
      removeWatchStateListener(syncTheaterLayout);
      theaterLayoutTarget = null;
      theaterLayoutState = null;
      signalPlayerResize();
      return;
    }

    addWatchStateListener(syncTheaterLayout);
  }

  class MovableLiveChat {
    constructor() {
      this.enabled = false;
      this.chat = null;
      this.position = null;
      this.opacity = LIVE_CHAT_DEFAULT_OPACITY;
      this.compact = false;
      this.background = "solid";
      this.resizeSide = "right";
      this.listening = false;
      this.iframeObserver = null;
      this.onWatchStateChange = () => this.sync();
      this.onResize = () => this.constrainToViewport();
      this.onMouseEnter = () => this.syncChrome();
      this.onMouseLeave = () => this.syncChrome();
    }

    async setEnabled(enabled, options = {}) {
      const nextCompact = options.chatOnly === true;
      const nextBackground = ["solid", "soft", "translucent"].includes(options.background)
        ? options.background
        : "solid";

      if (enabled === this.enabled) {
        if (enabled) {
          this.compact = nextCompact;
          this.background = nextBackground;
          this.sync();
        }
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
        LIVE_CHAT_COMPACT_KEY,
        LIVE_CHAT_OPACITY_MIGRATED_KEY,
        LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY,
        LEGACY_LIVE_CHAT_POSITION_KEY,
        LEGACY_LIVE_CHAT_OPACITY_KEY,
      ]);
      if (!this.enabled) return;
      this.position = stored[LIVE_CHAT_POSITION_KEY] || stored[LEGACY_LIVE_CHAT_POSITION_KEY] || null;
      const storedOpacity =
        stored[LIVE_CHAT_OPACITY_KEY] ?? stored[LEGACY_LIVE_CHAT_OPACITY_KEY];
      if (
        !stored[LIVE_CHAT_OPACITY_MIGRATED_KEY] &&
        (storedOpacity == null || storedOpacity === 1)
      ) {
        this.opacity = LIVE_CHAT_DEFAULT_OPACITY;
        chrome.storage.local.set({
          [LIVE_CHAT_OPACITY_KEY]: this.opacity,
          [LIVE_CHAT_OPACITY_MIGRATED_KEY]: true,
          [LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY]: true,
        });
      } else if (
        !stored[LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY] &&
        (storedOpacity == null ||
          storedOpacity === 1 ||
          storedOpacity === LIVE_CHAT_LEGACY_DEFAULT_OPACITY)
      ) {
        this.opacity = LIVE_CHAT_DEFAULT_OPACITY;
        chrome.storage.local.set({
          [LIVE_CHAT_OPACITY_KEY]: this.opacity,
          [LIVE_CHAT_OPACITY_MIGRATED_KEY]: true,
          [LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY]: true,
        });
      } else {
        this.opacity = storedOpacity ?? LIVE_CHAT_DEFAULT_OPACITY;
        if (!stored[LIVE_CHAT_OPACITY_MIGRATED_KEY] || !stored[LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY]) {
          chrome.storage.local.set({
            [LIVE_CHAT_OPACITY_MIGRATED_KEY]: true,
            [LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY]: true,
          });
        }
      }
      this.compact = nextCompact;
      this.background = nextBackground;
      if (
        options.chatOnly == null &&
        stored[LIVE_CHAT_COMPACT_KEY] === true
      ) {
        this.compact = true;
        this.persistChatOnly(true);
      }
      this.injectStyles();
      this.startListening();
      this.sync();
    }

    startListening() {
      if (this.listening) return;
      this.listening = true;
      addWatchStateListener(this.onWatchStateChange);
      window.addEventListener("resize", this.onResize);
    }

    stopListening() {
      if (!this.listening) return;
      this.listening = false;
      removeWatchStateListener(this.onWatchStateChange);
      window.removeEventListener("resize", this.onResize);
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
          min-width: ${LIVE_CHAT_MIN_WIDTH}px !important;
          min-height: ${LIVE_CHAT_MIN_HEIGHT}px !important;
          margin: 0 !important;
          overflow: hidden !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 14px !important;
          background: var(--yt-spec-base-background, #0f0f0f) !important;
          box-shadow: 0 14px 50px rgba(0,0,0,.5) !important;
          transform: none !important;
          opacity: 1 !important;
          transition:
            border-color .2s ease,
            background-color .2s ease,
            box-shadow .2s ease,
            border-radius .2s ease !important;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-bg-soft {
          background: color-mix(
            in srgb,
            var(--yt-spec-base-background, #0f0f0f) 88%,
            transparent
          ) !important;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-bg-translucent {
          opacity: 1 !important;
          background: color-mix(
            in srgb,
            var(--yt-spec-base-background, #0f0f0f) var(--ytm-chat-rest-opacity-pct, 45%),
            transparent
          ) !important;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-bg-translucent:hover,
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-bg-translucent.ytm-chat-interacting {
          background: var(--yt-spec-base-background, #0f0f0f) !important;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-compact:not(:hover):not(.ytm-chat-interacting),
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-compact:not(:hover):not(.ytm-chat-interacting) #chat-container,
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-compact:not(:hover):not(.ytm-chat-interacting) ytd-live-chat-frame {
          border: none !important;
          border-width: 0 !important;
          outline: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-compact:not(:hover):not(.ytm-chat-interacting) #show-hide-button,
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-compact:not(:hover):not(.ytm-chat-interacting) #close-button {
          display: none !important;
        }
        #chat.ytm-movable-chat iframe {
          width: 100% !important;
          height: 100% !important;
          flex: 1 1 auto !important;
          min-height: 0 !important;
          border: 0 !important;
          outline: none !important;
          background: transparent !important;
        }
        #chat .ytm-chat-toolbar {
          display: none;
          flex: 0 0 auto;
          align-items: stretch;
          gap: 4px;
          min-height: 18px;
          padding: 2px 4px 0;
          box-sizing: border-box;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat .ytm-chat-toolbar {
          display: flex;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-compact:not(:hover):not(.ytm-chat-interacting) .ytm-chat-toolbar {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
        }
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-compact:not(:hover):not(.ytm-chat-interacting) .ytm-chat-resize-handle {
          display: none !important;
        }
        #chat .ytm-chat-drag-handle {
          flex: 1 1 auto;
          height: 14px;
          cursor: grab;
          touch-action: none;
          border-radius: 8px;
          background: linear-gradient(90deg, transparent, ${ACCENT_COLOR}99, transparent);
          opacity: .55;
          transition: opacity .18s ease;
        }
        #chat.ytm-movable-chat:hover .ytm-chat-drag-handle,
        #chat.ytm-movable-chat.ytm-chat-interacting .ytm-chat-drag-handle {
          opacity: 1;
        }
        #chat .ytm-chat-compact-btn {
          flex: 0 0 22px;
          width: 22px;
          height: 18px;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 6px;
          cursor: pointer;
          color: ${ACCENT_COLOR};
          background: rgba(255,255,255,.08);
          opacity: .7;
          transition: opacity .18s ease, background .18s ease;
        }
        #chat .ytm-chat-compact-btn:hover,
        #chat .ytm-chat-compact-btn[aria-pressed="true"] {
          opacity: 1;
          background: rgba(255,143,107,.22);
        }
        #chat .ytm-chat-compact-btn svg {
          display: block;
          width: 14px;
          height: 14px;
          margin: 2px auto 0;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
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
        ytd-watch-flexy[theater] #chat.ytm-movable-chat.ytm-chat-resize-left .ytm-chat-resize-handle {
          left: 0;
          right: auto;
          cursor: nesw-resize;
          background: linear-gradient(225deg, transparent 52%, ${ACCENT_COLOR} 53%);
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
      this.chat.classList.toggle("ytm-chat-compact", inTheater && this.compact);
      this.chat.classList.toggle("ytm-chat-bg-soft", inTheater && this.background === "soft");
      this.chat.classList.toggle(
        "ytm-chat-bg-translucent",
        inTheater && this.background === "translucent"
      );
      if (inTheater) {
        this.applyCompactButton();
        this.applyPosition();
        this.syncChrome();
      } else {
        this.clearPosition();
      }
    }

    setupChat() {
      const toolbar = document.createElement("div");
      toolbar.className = "ytm-chat-toolbar";

      const dragHandle = document.createElement("div");
      dragHandle.className = "ytm-chat-drag-handle";
      dragHandle.setAttribute("aria-hidden", "true");
      toolbar.appendChild(dragHandle);

      const compactBtn = document.createElement("button");
      compactBtn.type = "button";
      compactBtn.className = "ytm-chat-compact-btn";
      compactBtn.title = "Chat only";
      compactBtn.setAttribute("aria-label", "Chat only");
      compactBtn.setAttribute("aria-pressed", this.compact ? "true" : "false");
      compactBtn.innerHTML =
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 3.2h9.6a1.3 1.3 0 0 1 1.3 1.3v5.2a1.3 1.3 0 0 1-1.3 1.3H7.1L4.4 13.4V11H3.2a1.3 1.3 0 0 1-1.3-1.3V4.5a1.3 1.3 0 0 1 1.3-1.3z"/><path d="M5 6.4h6.2M5 8.8h4.2"/></svg>';
      toolbar.appendChild(compactBtn);
      this.chat.prepend(toolbar);
      this.applyCompactButton();

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
      compactBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setCompact(!this.compact);
      });
      dragHandle.addEventListener(
        "wheel",
        (event) => {
          if (!this.chat.classList.contains("ytm-movable-chat")) return;
          event.preventDefault();
          this.opacity = Math.max(
            0.25,
            Math.min(1, this.opacity + (event.deltaY < 0 ? 0.05 : -0.05))
          );
          this.applyOpacity();
          chrome.storage.local.set({
            [LIVE_CHAT_OPACITY_KEY]: this.opacity,
          });
        },
        { passive: false }
      );

      this.chat.addEventListener("mouseenter", this.onMouseEnter);
      this.chat.addEventListener("mouseleave", this.onMouseLeave);
      this.watchChatFrame();
    }

    applyCompactButton() {
      const btn = this.chat?.querySelector(".ytm-chat-compact-btn");
      if (!btn) return;
      btn.setAttribute("aria-pressed", this.compact ? "true" : "false");
      btn.title = this.compact ? "Show chat chrome" : "Chat only";
      btn.setAttribute("aria-label", btn.title);
    }

    setCompact(compact) {
      this.compact = Boolean(compact);
      this.chat?.classList.toggle("ytm-chat-compact", this.compact);
      this.applyCompactButton();
      chrome.storage.local.set({ [LIVE_CHAT_COMPACT_KEY]: this.compact });
      this.persistChatOnly(this.compact);
      this.syncChrome();
    }

    async persistChatOnly(chatOnly) {
      try {
        const stored = await chrome.storage.sync.get([
          SETTINGS_KEY,
          LEGACY_SETTINGS_KEY,
        ]);
        const current = mergeSettings(
          stored[SETTINGS_KEY] ?? stored[LEGACY_SETTINGS_KEY]
        );
        current.subsettings.movableLiveChat = {
          ...migrateMovableLiveChat(current.subsettings?.movableLiveChat),
          chatOnly: Boolean(chatOnly),
        };
        await chrome.storage.sync.set({ [SETTINGS_KEY]: current });
      } catch {
        /* ignore storage races */
      }
    }

    watchChatFrame() {
      this.iframeObserver?.disconnect();
      const iframe = this.chat?.querySelector("iframe");
      if (iframe) {
        iframe.addEventListener("load", () => this.syncChrome());
      }
      this.iframeObserver = new MutationObserver(() => {
        const next = this.chat?.querySelector("iframe");
        if (next) {
          next.addEventListener("load", () => this.syncChrome());
          this.syncChrome();
        }
      });
      if (this.chat) {
        this.iframeObserver.observe(this.chat, { childList: true, subtree: true });
      }
      this.syncChrome();
    }

    syncChrome() {
      if (!this.chat?.classList.contains("ytm-movable-chat")) return;
      const iframe = this.chat.querySelector("iframe");
      if (!iframe) return;
      try {
        const doc = iframe.contentDocument;
        if (!doc?.head) return;
        let style = doc.getElementById(LIVE_CHAT_IFRAME_STYLE_ID);
        if (!style) {
          style = doc.createElement("style");
          style.id = LIVE_CHAT_IFRAME_STYLE_ID;
          doc.head.appendChild(style);
        }
        const revealed =
          this.chat.matches(":hover") ||
          this.chat.classList.contains("ytm-chat-interacting");
        const parts = [];
        if (this.background === "soft") parts.push(LIVE_CHAT_SOFT_IFRAME_CSS);
        if (this.background === "translucent") {
          parts.push(LIVE_CHAT_TRANSLUCENT_IFRAME_CSS);
        }
        if (this.compact && !revealed) parts.push(LIVE_CHAT_COMPACT_IFRAME_CSS);
        style.textContent = parts.join("\n");
      } catch {
        /* cross-origin or not ready */
      }
    }

    startInteraction(event, mode) {
      if (!this.chat?.classList.contains("ytm-movable-chat")) return;
      event.preventDefault();
      const start = this.chat.getBoundingClientRect();
      const originX = event.clientX;
      const originY = event.clientY;
      const handle = event.currentTarget;
      const resizeFromLeft = mode === "resize" && this.resizeSide === "left";
      this.chat.classList.add("ytm-chat-interacting");
      this.syncChrome();
      handle.setPointerCapture(event.pointerId);

      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - originX;
        const dy = moveEvent.clientY - originY;
        if (mode === "move") {
          this.setRect(start.left + dx, start.top + dy, start.width, start.height);
          return;
        }
        if (resizeFromLeft) {
          const width = Math.max(LIVE_CHAT_MIN_WIDTH, start.width - dx);
          const left = start.left + (start.width - width);
          this.setRect(
            left,
            start.top,
            width,
            Math.max(LIVE_CHAT_MIN_HEIGHT, start.height + dy)
          );
          return;
        }
        this.setRect(
          start.left,
          start.top,
          Math.max(LIVE_CHAT_MIN_WIDTH, start.width + dx),
          Math.max(LIVE_CHAT_MIN_HEIGHT, start.height + dy)
        );
      };

      const onEnd = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onEnd);
        handle.removeEventListener("pointercancel", onEnd);
        this.chat?.classList.remove("ytm-chat-interacting");
        this.constrainToViewport();
        this.savePosition();
        this.syncChrome();
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onEnd);
      handle.addEventListener("pointercancel", onEnd);
    }

    /* Keep chat below the theater hover-header hit strip
       (theater-hide-header.css: top -40px + padding-bottom). */
    getMinTop() {
      if (!document.querySelector("ytd-watch-flexy[theater]:not([fullscreen])")) {
        return 0;
      }
      const masthead = document.querySelector("#masthead-container");
      if (!masthead) return 0;

      const hideOffset = 40;
      const paddingBottom = parseFloat(getComputedStyle(masthead).paddingBottom) || 0;
      if (paddingBottom > 0) {
        return Math.max(0, Math.round(masthead.offsetHeight - hideOffset));
      }
      return Math.max(0, Math.round(masthead.getBoundingClientRect().bottom));
    }

    getMoveBounds() {
      const minTop = this.getMinTop();
      const video =
        document.querySelector("ytd-watch-flexy[theater] #full-bleed-container") ||
        document.querySelector("ytd-watch-flexy[theater] #movie_player");
      if (video) {
        const rect = video.getBoundingClientRect();
        return {
          left: Math.max(0, Math.round(rect.left)),
          top: Math.max(minTop, Math.round(rect.top)),
          right: Math.min(window.innerWidth, Math.round(rect.right)),
          bottom: Math.min(window.innerHeight, Math.round(rect.bottom)),
        };
      }
      return {
        left: 0,
        top: minTop,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };
    }

    updateResizeSide(left, width) {
      if (!this.chat) return;
      const center = left + width / 2;
      const onRight = center >= window.innerWidth / 2;
      this.resizeSide = onRight ? "left" : "right";
      this.chat.classList.toggle("ytm-chat-resize-left", onRight);
    }

    applyOpacity() {
      if (!this.chat) return;
      this.chat.style.setProperty(
        "--ytm-chat-rest-opacity",
        String(this.opacity),
        "important"
      );
      this.chat.style.setProperty(
        "--ytm-chat-rest-opacity-pct",
        `${Math.round(this.opacity * 100)}%`,
        "important"
      );
      this.chat.style.removeProperty("opacity");
    }

    setRect(left, top, width, height) {
      if (!this.chat) return;
      const bounds = this.getMoveBounds();
      const maxWidth = Math.max(1, bounds.right - bounds.left);
      const maxHeight = Math.max(1, bounds.bottom - bounds.top);
      const minWidth = Math.min(LIVE_CHAT_MIN_WIDTH, maxWidth);
      const minHeight = Math.min(LIVE_CHAT_MIN_HEIGHT, maxHeight);
      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, width));
      const clampedHeight = Math.min(maxHeight, Math.max(minHeight, height));
      const clampedLeft = Math.min(
        Math.max(left, bounds.left),
        bounds.right - clampedWidth
      );
      const clampedTop = Math.min(
        Math.max(top, bounds.top),
        bounds.bottom - clampedHeight
      );
      this.chat.style.setProperty("left", `${Math.round(clampedLeft)}px`, "important");
      this.chat.style.setProperty("top", `${Math.round(clampedTop)}px`, "important");
      this.chat.style.setProperty("right", "auto", "important");
      this.chat.style.setProperty(
        "width",
        `${Math.round(clampedWidth)}px`,
        "important"
      );
      this.chat.style.setProperty(
        "height",
        `${Math.round(clampedHeight)}px`,
        "important"
      );
      this.updateResizeSide(clampedLeft, clampedWidth);
    }

    applyPosition() {
      if (!this.chat) return;
      const bounds = this.getMoveBounds();
      if (this.position && typeof this.position.top === "number" && this.position.top < bounds.top) {
        this.position = null;
        chrome.storage.local.remove([
          LIVE_CHAT_POSITION_KEY,
          LEGACY_LIVE_CHAT_POSITION_KEY,
        ]);
      }
      const fallback = {
        left: Math.max(bounds.left, bounds.right - 420),
        top: Math.max(bounds.top, Math.min(bounds.top + 20, bounds.bottom - LIVE_CHAT_MIN_HEIGHT)),
        width: Math.min(400, bounds.right - bounds.left),
        height: Math.min(620, bounds.bottom - bounds.top - 20),
      };
      const position = { ...fallback, ...(this.position || {}) };
      this.setRect(position.left, position.top, position.width, position.height);
      this.applyOpacity();
      const rect = this.chat.getBoundingClientRect();
      if (
        !this.position ||
        Math.round(this.position.top) !== Math.round(rect.top) ||
        Math.round(this.position.left) !== Math.round(rect.left) ||
        Math.round(this.position.width) !== Math.round(rect.width) ||
        Math.round(this.position.height) !== Math.round(rect.height)
      ) {
        this.savePosition();
      }
    }

    constrainToViewport() {
      if (!this.chat?.classList.contains("ytm-movable-chat")) return;
      const rect = this.chat.getBoundingClientRect();
      this.setRect(rect.left, rect.top, rect.width, rect.height);
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
        [LIVE_CHAT_COMPACT_KEY]: this.compact,
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
        "--ytm-chat-rest-opacity",
        "--ytm-chat-rest-opacity-pct",
      ]) {
        this.chat.style.removeProperty(property);
      }
    }

    detachChat() {
      if (!this.chat) return;
      this.iframeObserver?.disconnect();
      this.iframeObserver = null;
      this.chat.removeEventListener("mouseenter", this.onMouseEnter);
      this.chat.removeEventListener("mouseleave", this.onMouseLeave);
      this.chat.classList.remove(
        "ytm-movable-chat",
        "ytm-chat-interacting",
        "ytm-chat-compact",
        "ytm-chat-bg-soft",
        "ytm-chat-bg-translucent",
        "ytm-chat-resize-left"
      );
      this.clearPosition();
      this.chat.querySelector(".ytm-chat-toolbar")?.remove();
      this.chat.querySelector(".ytm-chat-resize-handle")?.remove();
      this.chat.querySelector(".ytm-chat-drag-handle")?.remove();
      this.chat.querySelector(".ytm-chat-compact-btn")?.remove();
      const iframe = this.chat.querySelector("iframe");
      try {
        iframe?.contentDocument?.getElementById(LIVE_CHAT_IFRAME_STYLE_ID)?.remove();
      } catch {
        /* ignore */
      }
      this.chat = null;
    }

    destroy() {
      this.stopListening();
      this.detachChat();
      document.getElementById(MOVABLE_CHAT_STYLE_ID)?.remove();
    }
  }

  const movableLiveChat = new MovableLiveChat();

  /* Twitch movable live chat — same drag/resize/opacity UX as YouTube, but
     targeting theater-mode `.channel-root__right-column` (no live-chat iframe). */
  class MovableTwitchLiveChat {
    constructor() {
      this.enabled = false;
      this.chat = null;
      this.position = null;
      this.opacity = LIVE_CHAT_DEFAULT_OPACITY;
      this.compact = false;
      this.background = "solid";
      this.resizeSide = "right";
      this.listening = false;
      this.checkInterval = null;
      this.onResize = () => this.constrainToViewport();
    }

    async setEnabled(enabled, options = {}) {
      const nextCompact = options.chatOnly === true;
      const nextBackground = ["solid", "soft", "translucent"].includes(options.background)
        ? options.background
        : "solid";

      if (enabled === this.enabled) {
        if (enabled) {
          this.compact = nextCompact;
          this.background = nextBackground;
          this.sync();
        }
        return;
      }

      this.enabled = enabled;
      if (!enabled) {
        this.destroy();
        return;
      }

      const stored = await chrome.storage.local.get([
        TWITCH_LIVE_CHAT_POSITION_KEY,
        TWITCH_LIVE_CHAT_OPACITY_KEY,
        TWITCH_LIVE_CHAT_COMPACT_KEY,
        TWITCH_LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY,
      ]);
      if (!this.enabled) return;
      this.position = stored[TWITCH_LIVE_CHAT_POSITION_KEY] || null;
      const storedOpacity = stored[TWITCH_LIVE_CHAT_OPACITY_KEY];
      if (
        !stored[TWITCH_LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY] &&
        (storedOpacity == null ||
          storedOpacity === 1 ||
          storedOpacity === LIVE_CHAT_LEGACY_DEFAULT_OPACITY)
      ) {
        this.opacity = LIVE_CHAT_DEFAULT_OPACITY;
        chrome.storage.local.set({
          [TWITCH_LIVE_CHAT_OPACITY_KEY]: this.opacity,
          [TWITCH_LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY]: true,
        });
      } else {
        this.opacity = storedOpacity ?? LIVE_CHAT_DEFAULT_OPACITY;
        if (!stored[TWITCH_LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY]) {
          chrome.storage.local.set({
            [TWITCH_LIVE_CHAT_OPACITY_TRANSLUCENT_V2_KEY]: true,
          });
        }
      }
      this.compact = nextCompact;
      this.background = nextBackground;
      if (
        options.chatOnly == null &&
        stored[TWITCH_LIVE_CHAT_COMPACT_KEY] === true
      ) {
        this.compact = true;
        this.persistChatOnly(true);
      }
      this.injectStyles();
      this.startListening();
      this.sync();
    }

    startListening() {
      if (this.listening) return;
      this.listening = true;
      window.addEventListener("resize", this.onResize);
      this.checkInterval = setInterval(() => this.sync(), 1000);
    }

    stopListening() {
      if (!this.listening) return;
      this.listening = false;
      window.removeEventListener("resize", this.onResize);
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    injectStyles() {
      let style = document.getElementById(TWITCH_MOVABLE_CHAT_STYLE_ID);
      if (!style) {
        style = document.createElement("style");
        style.id = TWITCH_MOVABLE_CHAT_STYLE_ID;
      }
      style.textContent = `
        body.ttv-movable-chat-on .persistent-player--theatre {
          width: 100% !important;
        }
        body.ttv-movable-chat-on .right-column--theatre:not(.right-column--collapsed) {
          width: 0 !important;
          min-width: 0 !important;
          border: none !important;
          transform: none !important;
        }
        body.ttv-movable-chat-on .right-column--theatre:not(.right-column--collapsed) .right-column__toggle-visibility {
          display: none !important;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat {
          position: fixed !important;
          z-index: 2001 !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
          min-width: ${LIVE_CHAT_MIN_WIDTH}px !important;
          min-height: ${LIVE_CHAT_MIN_HEIGHT}px !important;
          margin: 0 !important;
          overflow: hidden !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 14px !important;
          background: var(--color-background-base, #0e0e10) !important;
          box-shadow: 0 14px 50px rgba(0,0,0,.5) !important;
          transform: none !important;
          opacity: 1 !important;
          transition:
            border-color .2s ease,
            background-color .2s ease,
            box-shadow .2s ease,
            border-radius .2s ease !important;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-bg-soft,
        .right-column--theatre .channel-root__right-column.channel-root__right-column--expanded.ttv-movable-chat.ttv-chat-bg-soft {
          background: color-mix(
            in srgb,
            var(--color-background-base, #0e0e10) 88%,
            transparent
          ) !important;
          background-color: color-mix(
            in srgb,
            var(--color-background-base, #0e0e10) 88%,
            transparent
          ) !important;
          box-shadow: 0 10px 36px rgba(0,0,0,.28) !important;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-bg-translucent,
        .right-column--theatre .channel-root__right-column.channel-root__right-column--expanded.ttv-movable-chat.ttv-chat-bg-translucent {
          opacity: 1 !important;
          background: color-mix(
            in srgb,
            var(--color-background-base, #0e0e10) var(--ttv-chat-rest-opacity-pct, 45%),
            transparent
          ) !important;
          background-color: color-mix(
            in srgb,
            var(--color-background-base, #0e0e10) var(--ttv-chat-rest-opacity-pct, 45%),
            transparent
          ) !important;
          box-shadow: 0 8px 28px rgba(0,0,0,.22) !important;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-bg-translucent:hover,
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-bg-translucent.ttv-chat-interacting,
        .right-column--theatre .channel-root__right-column.channel-root__right-column--expanded.ttv-movable-chat.ttv-chat-bg-translucent:hover,
        .right-column--theatre .channel-root__right-column.channel-root__right-column--expanded.ttv-movable-chat.ttv-chat-bg-translucent.ttv-chat-interacting {
          background: var(--color-background-base, #0e0e10) !important;
          background-color: var(--color-background-base, #0e0e10) !important;
          box-shadow: 0 14px 50px rgba(0,0,0,.5) !important;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-compact:not(:hover):not(.ttv-chat-interacting) {
          border: none !important;
          border-width: 0 !important;
          outline: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        /* Strip Twitch chrome — messages only while floating */
        .channel-root__right-column.ttv-movable-chat .stream-chat-header,
        .channel-root__right-column.ttv-movable-chat .video-chat__header,
        .channel-root__right-column.ttv-movable-chat .channel-leaderboard,
        .channel-root__right-column.ttv-movable-chat .community-highlight-stack,
        .channel-root__right-column.ttv-movable-chat [class*="community-highlight"],
        .channel-root__right-column.ttv-movable-chat .marquee-animation,
        .channel-root__right-column.ttv-movable-chat .marquee-animation__original,
        .channel-root__right-column.ttv-movable-chat [data-test-selector="community-highlight-carousel"],
        .channel-root__right-column.ttv-movable-chat .pinned-chat,
        .channel-root__right-column.ttv-movable-chat .chat-room__header,
        .channel-root__right-column.ttv-movable-chat .right-column__toggle-visibility {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
          flex: 0 0 0 !important;
        }

        .channel-root__right-column.ttv-movable-chat > :not(.ttv-chat-toolbar):not(.ttv-chat-resize-handle),
        .channel-root__right-column.ttv-movable-chat .chat-shell,
        .channel-root__right-column.ttv-movable-chat .chat-shell__expanded,
        .channel-root__right-column.ttv-movable-chat .chat-room,
        .channel-root__right-column.ttv-movable-chat .stream-chat,
        .channel-root__right-column.ttv-movable-chat .video-chat,
        .channel-root__right-column.ttv-movable-chat .chat-room__content {
          display: flex !important;
          flex-direction: column !important;
          flex: 1 1 auto !important;
          min-height: 0 !important;
          height: auto !important;
          max-height: none !important;
        }
        .channel-root__right-column.ttv-movable-chat .chat-list,
        .channel-root__right-column.ttv-movable-chat .chat-list--default,
        .channel-root__right-column.ttv-movable-chat .chat-scrollable-area__message-container,
        .channel-root__right-column.ttv-movable-chat [data-test-selector="chat-scrollable-area__message-container"],
        .channel-root__right-column.ttv-movable-chat .simplebar-wrapper,
        .channel-root__right-column.ttv-movable-chat .simplebar-mask,
        .channel-root__right-column.ttv-movable-chat .simplebar-offset,
        .channel-root__right-column.ttv-movable-chat .simplebar-content-wrapper,
        .channel-root__right-column.ttv-movable-chat .video-chat__message-list-wrapper {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          height: auto !important;
        }

        .channel-root__right-column.ttv-movable-chat .ttv-chat-toolbar {
          display: none;
          flex: 0 0 auto !important;
          align-items: stretch;
          gap: 4px;
          height: auto !important;
          min-height: 18px;
          max-height: none !important;
          padding: 4px 6px 2px;
          box-sizing: border-box;
          z-index: 3;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat .ttv-chat-toolbar {
          display: flex;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-compact:not(:hover):not(.ttv-chat-interacting) .ttv-chat-toolbar {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-compact:not(:hover):not(.ttv-chat-interacting) .ttv-chat-resize-handle {
          display: none !important;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-compact:not(:hover):not(.ttv-chat-interacting) .chat-input,
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-compact:not(:hover):not(.ttv-chat-interacting) .chat-input-tray,
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-compact:not(:hover):not(.ttv-chat-interacting) [data-a-target="chat-input"] {
          display: none !important;
        }
        .channel-root__right-column.ttv-movable-chat .chat-input {
          flex: 0 0 auto !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
        }
        .channel-root__right-column .ttv-chat-drag-handle {
          flex: 1 1 auto;
          height: 14px;
          cursor: grab;
          touch-action: none;
          border-radius: 8px;
          background: linear-gradient(90deg, transparent, ${ACCENT_COLOR}99, transparent);
          opacity: .55;
          transition: opacity .18s ease;
        }
        .channel-root__right-column.ttv-movable-chat:hover .ttv-chat-drag-handle,
        .channel-root__right-column.ttv-movable-chat.ttv-chat-interacting .ttv-chat-drag-handle {
          opacity: 1;
        }
        .channel-root__right-column .ttv-chat-compact-btn {
          flex: 0 0 22px;
          width: 22px;
          height: 18px;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 6px;
          cursor: pointer;
          color: ${ACCENT_COLOR};
          background: rgba(255,255,255,.08);
          opacity: .7;
          transition: opacity .18s ease, background .18s ease;
        }
        .channel-root__right-column .ttv-chat-compact-btn:hover,
        .channel-root__right-column .ttv-chat-compact-btn[aria-pressed="true"] {
          opacity: 1;
          background: rgba(255,143,107,.22);
        }
        .channel-root__right-column .ttv-chat-compact-btn svg {
          display: block;
          width: 14px;
          height: 14px;
          margin: 2px auto 0;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .channel-root__right-column .ttv-chat-resize-handle {
          display: none;
          position: absolute;
          right: 0;
          bottom: 0;
          width: 28px;
          height: 28px;
          cursor: nwse-resize;
          touch-action: none;
          z-index: 20;
          background: linear-gradient(135deg, transparent 48%, ${ACCENT_COLOR} 49%);
          opacity: .95;
          pointer-events: auto;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat .ttv-chat-resize-handle {
          display: block;
        }
        .right-column--theatre .channel-root__right-column.ttv-movable-chat.ttv-chat-resize-left .ttv-chat-resize-handle {
          left: 0;
          right: auto;
          cursor: nesw-resize;
          background: linear-gradient(225deg, transparent 48%, ${ACCENT_COLOR} 49%);
        }
        .channel-root__right-column.ttv-chat-bg-soft > *:not(.ttv-chat-toolbar):not(.ttv-chat-resize-handle),
        .channel-root__right-column.ttv-chat-bg-soft .chat-shell,
        .channel-root__right-column.ttv-chat-bg-soft .chat-shell__expanded,
        .channel-root__right-column.ttv-chat-bg-soft .chat-room,
        .channel-root__right-column.ttv-chat-bg-soft .stream-chat,
        .channel-root__right-column.ttv-chat-bg-soft .video-chat,
        .channel-root__right-column.ttv-chat-bg-soft .chat-room__content,
        .channel-root__right-column.ttv-chat-bg-soft .chat-list,
        .channel-root__right-column.ttv-chat-bg-soft .chat-list--default,
        .channel-root__right-column.ttv-chat-bg-soft .scrollable-area,
        .channel-root__right-column.ttv-chat-bg-soft .simplebar-wrapper,
        .channel-root__right-column.ttv-chat-bg-soft .simplebar-mask,
        .channel-root__right-column.ttv-chat-bg-soft .simplebar-offset,
        .channel-root__right-column.ttv-chat-bg-soft .simplebar-content-wrapper,
        .channel-root__right-column.ttv-chat-bg-soft .simplebar-content,
        .channel-root__right-column.ttv-chat-bg-soft .chat-scrollable-area__message-container,
        .channel-root__right-column.ttv-chat-bg-soft [data-test-selector="chat-scrollable-area__message-container"],
        .channel-root__right-column.ttv-chat-bg-soft [data-test-selector="chat-room-component-layout"],
        .channel-root__right-column.ttv-chat-bg-soft [data-a-target="right-column-chat-bar"],
        .channel-root__right-column.ttv-chat-bg-soft .tw-c-background-base,
        .channel-root__right-column.ttv-chat-bg-soft .tw-c-background-alt,
        .channel-root__right-column.ttv-chat-bg-soft .tw-c-background-body,
        .channel-root__right-column.ttv-chat-bg-soft [class*="Layout-"],
        .channel-root__right-column.ttv-chat-bg-soft [class*="InjectLayout"],
        .channel-root__right-column.ttv-chat-bg-soft .chat-input,
        .channel-root__right-column.ttv-chat-bg-soft .chat-input__textarea,
        .channel-root__right-column.ttv-chat-bg-translucent > *:not(.ttv-chat-toolbar):not(.ttv-chat-resize-handle),
        .channel-root__right-column.ttv-chat-bg-translucent .chat-shell,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-shell__expanded,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-room,
        .channel-root__right-column.ttv-chat-bg-translucent .stream-chat,
        .channel-root__right-column.ttv-chat-bg-translucent .video-chat,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-room__content,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-list,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-list--default,
        .channel-root__right-column.ttv-chat-bg-translucent .scrollable-area,
        .channel-root__right-column.ttv-chat-bg-translucent .simplebar-wrapper,
        .channel-root__right-column.ttv-chat-bg-translucent .simplebar-mask,
        .channel-root__right-column.ttv-chat-bg-translucent .simplebar-offset,
        .channel-root__right-column.ttv-chat-bg-translucent .simplebar-content-wrapper,
        .channel-root__right-column.ttv-chat-bg-translucent .simplebar-content,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-scrollable-area__message-container,
        .channel-root__right-column.ttv-chat-bg-translucent [data-test-selector="chat-scrollable-area__message-container"],
        .channel-root__right-column.ttv-chat-bg-translucent [data-test-selector="chat-room-component-layout"],
        .channel-root__right-column.ttv-chat-bg-translucent [data-a-target="right-column-chat-bar"],
        .channel-root__right-column.ttv-chat-bg-translucent .tw-c-background-base,
        .channel-root__right-column.ttv-chat-bg-translucent .tw-c-background-alt,
        .channel-root__right-column.ttv-chat-bg-translucent .tw-c-background-body,
        .channel-root__right-column.ttv-chat-bg-translucent [class*="Layout-"],
        .channel-root__right-column.ttv-chat-bg-translucent [class*="InjectLayout"],
        .channel-root__right-column.ttv-chat-bg-translucent .chat-input,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-input__textarea {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
        .channel-root__right-column.ttv-chat-bg-soft .chat-line__message,
        .channel-root__right-column.ttv-chat-bg-soft [data-a-target="chat-line-message"],
        .channel-root__right-column.ttv-chat-bg-soft .text-fragment,
        .channel-root__right-column.ttv-chat-bg-soft .chat-author__display-name,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-line__message,
        .channel-root__right-column.ttv-chat-bg-translucent [data-a-target="chat-line-message"],
        .channel-root__right-column.ttv-chat-bg-translucent .text-fragment,
        .channel-root__right-column.ttv-chat-bg-translucent .chat-author__display-name {
          opacity: 1 !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    isTheatre() {
      const col = document.querySelector(".right-column");
      return Boolean(
        col?.classList.contains("right-column--theatre") &&
          !col.classList.contains("right-column--collapsed")
      );
    }

    findChat() {
      return document.querySelector(
        ".right-column--theatre:not(.right-column--collapsed) .channel-root__right-column"
      );
    }

    sync() {
      if (!this.enabled) return;
      this.injectStyles();
      const inTheater = this.isTheatre();
      document.body.classList.toggle("ttv-movable-chat-on", inTheater);

      const chat = this.findChat();
      if (!chat) {
        if (this.chat) this.detachChat();
        return;
      }

      if (this.chat !== chat) {
        this.detachChat();
        this.chat = chat;
        this.setupChat();
      }

      this.chat.classList.toggle("ttv-movable-chat", inTheater);
      this.chat.classList.toggle("ttv-chat-compact", inTheater && this.compact);
      this.chat.classList.toggle("ttv-chat-bg-soft", inTheater && this.background === "soft");
      this.chat.classList.toggle(
        "ttv-chat-bg-translucent",
        inTheater && this.background === "translucent"
      );
      if (inTheater) {
        this.applyCompactButton();
        this.applyPosition();
      } else {
        this.clearPosition();
      }
    }

    setupChat() {
      const toolbar = document.createElement("div");
      toolbar.className = "ttv-chat-toolbar";

      const dragHandle = document.createElement("div");
      dragHandle.className = "ttv-chat-drag-handle";
      dragHandle.setAttribute("aria-hidden", "true");
      toolbar.appendChild(dragHandle);

      const compactBtn = document.createElement("button");
      compactBtn.type = "button";
      compactBtn.className = "ttv-chat-compact-btn";
      compactBtn.title = "Chat only";
      compactBtn.setAttribute("aria-label", "Chat only");
      compactBtn.setAttribute("aria-pressed", this.compact ? "true" : "false");
      compactBtn.innerHTML =
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 3.2h9.6a1.3 1.3 0 0 1 1.3 1.3v5.2a1.3 1.3 0 0 1-1.3 1.3H7.1L4.4 13.4V11H3.2a1.3 1.3 0 0 1-1.3-1.3V4.5a1.3 1.3 0 0 1 1.3-1.3z"/><path d="M5 6.4h6.2M5 8.8h4.2"/></svg>';
      toolbar.appendChild(compactBtn);
      this.chat.prepend(toolbar);
      this.applyCompactButton();

      const resizeHandle = document.createElement("div");
      resizeHandle.className = "ttv-chat-resize-handle";
      resizeHandle.setAttribute("aria-hidden", "true");
      this.chat.appendChild(resizeHandle);

      dragHandle.addEventListener("pointerdown", (event) =>
        this.startInteraction(event, "move")
      );
      resizeHandle.addEventListener("pointerdown", (event) =>
        this.startInteraction(event, "resize")
      );
      compactBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setCompact(!this.compact);
      });
      dragHandle.addEventListener(
        "wheel",
        (event) => {
          if (!this.chat.classList.contains("ttv-movable-chat")) return;
          event.preventDefault();
          this.opacity = Math.max(
            0.25,
            Math.min(1, this.opacity + (event.deltaY < 0 ? 0.05 : -0.05))
          );
          this.applyOpacity();
          chrome.storage.local.set({
            [TWITCH_LIVE_CHAT_OPACITY_KEY]: this.opacity,
          });
        },
        { passive: false }
      );
    }

    applyCompactButton() {
      const btn = this.chat?.querySelector(".ttv-chat-compact-btn");
      if (!btn) return;
      btn.setAttribute("aria-pressed", this.compact ? "true" : "false");
      btn.title = this.compact ? "Show chat chrome" : "Chat only";
      btn.setAttribute("aria-label", btn.title);
    }

    setCompact(compact) {
      this.compact = Boolean(compact);
      this.chat?.classList.toggle("ttv-chat-compact", this.compact);
      this.applyCompactButton();
      chrome.storage.local.set({ [TWITCH_LIVE_CHAT_COMPACT_KEY]: this.compact });
      this.persistChatOnly(this.compact);
    }

    async persistChatOnly(chatOnly) {
      try {
        const stored = await chrome.storage.sync.get([
          SETTINGS_KEY,
          LEGACY_SETTINGS_KEY,
        ]);
        const current = mergeSettings(
          stored[SETTINGS_KEY] ?? stored[LEGACY_SETTINGS_KEY]
        );
        current.subsettings.twitchMovableLiveChat = {
          ...migrateMovableLiveChat(
            current.subsettings?.twitchMovableLiveChat,
            DEFAULT_TWITCH_MOVABLE_LIVE_CHAT
          ),
          chatOnly: Boolean(chatOnly),
        };
        await chrome.storage.sync.set({ [SETTINGS_KEY]: current });
      } catch {
        /* ignore storage races */
      }
    }

    startInteraction(event, mode) {
      if (!this.chat?.classList.contains("ttv-movable-chat")) return;
      event.preventDefault();
      const start = this.chat.getBoundingClientRect();
      const originX = event.clientX;
      const originY = event.clientY;
      const handle = event.currentTarget;
      const resizeFromLeft = mode === "resize" && this.resizeSide === "left";
      this.chat.classList.add("ttv-chat-interacting");
      handle.setPointerCapture(event.pointerId);

      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - originX;
        const dy = moveEvent.clientY - originY;
        if (mode === "move") {
          this.setRect(start.left + dx, start.top + dy, start.width, start.height);
          return;
        }
        if (resizeFromLeft) {
          const width = Math.max(LIVE_CHAT_MIN_WIDTH, start.width - dx);
          const left = start.left + (start.width - width);
          this.setRect(
            left,
            start.top,
            width,
            Math.max(LIVE_CHAT_MIN_HEIGHT, start.height + dy)
          );
          return;
        }
        this.setRect(
          start.left,
          start.top,
          Math.max(LIVE_CHAT_MIN_WIDTH, start.width + dx),
          Math.max(LIVE_CHAT_MIN_HEIGHT, start.height + dy)
        );
      };

      const onEnd = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onEnd);
        handle.removeEventListener("pointercancel", onEnd);
        this.chat?.classList.remove("ttv-chat-interacting");
        this.constrainToViewport();
        this.savePosition();
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onEnd);
      handle.addEventListener("pointercancel", onEnd);
    }

    getMoveBounds() {
      /* Theater chat floats over the full player; use the viewport so a
         mis-measured video rect cannot collapse the minimum size. */
      if (this.isTheatre()) {
        return {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        };
      }
      return {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };
    }

    updateResizeSide(left, width) {
      if (!this.chat) return;
      const center = left + width / 2;
      const onRight = center >= window.innerWidth / 2;
      this.resizeSide = onRight ? "left" : "right";
      this.chat.classList.toggle("ttv-chat-resize-left", onRight);
    }

    applyOpacity() {
      if (!this.chat) return;
      this.chat.style.setProperty(
        "--ttv-chat-rest-opacity",
        String(this.opacity),
        "important"
      );
      this.chat.style.setProperty(
        "--ttv-chat-rest-opacity-pct",
        `${Math.round(this.opacity * 100)}%`,
        "important"
      );
      this.chat.style.removeProperty("opacity");
    }

    setRect(left, top, width, height) {
      if (!this.chat) return;
      const bounds = this.getMoveBounds();
      const minWidth = Math.min(LIVE_CHAT_MIN_WIDTH, window.innerWidth);
      const minHeight = Math.min(LIVE_CHAT_MIN_HEIGHT, window.innerHeight);
      const maxWidth = Math.max(minWidth, bounds.right - bounds.left);
      const maxHeight = Math.max(minHeight, bounds.bottom - bounds.top);
      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, width));
      const clampedHeight = Math.min(maxHeight, Math.max(minHeight, height));
      const clampedLeft = Math.min(
        Math.max(left, bounds.left),
        bounds.right - clampedWidth
      );
      const clampedTop = Math.min(
        Math.max(top, bounds.top),
        bounds.bottom - clampedHeight
      );
      this.chat.style.setProperty("left", `${Math.round(clampedLeft)}px`, "important");
      this.chat.style.setProperty("top", `${Math.round(clampedTop)}px`, "important");
      this.chat.style.setProperty("right", "auto", "important");
      this.chat.style.setProperty(
        "width",
        `${Math.round(clampedWidth)}px`,
        "important"
      );
      this.chat.style.setProperty(
        "height",
        `${Math.round(clampedHeight)}px`,
        "important"
      );
      this.chat.style.setProperty("min-width", `${minWidth}px`, "important");
      this.chat.style.setProperty("min-height", `${minHeight}px`, "important");
      this.updateResizeSide(clampedLeft, clampedWidth);
    }

    applyPosition() {
      if (!this.chat) return;
      const bounds = this.getMoveBounds();
      const minWidth = Math.min(LIVE_CHAT_MIN_WIDTH, window.innerWidth);
      const minHeight = Math.min(LIVE_CHAT_MIN_HEIGHT, window.innerHeight);
      const fallback = {
        left: Math.max(bounds.left, bounds.right - 420),
        top: Math.max(bounds.top, Math.min(bounds.top + 20, bounds.bottom - minHeight)),
        width: Math.max(minWidth, Math.min(400, bounds.right - bounds.left)),
        height: Math.max(minHeight, Math.min(620, bounds.bottom - bounds.top - 20)),
      };
      const position = { ...fallback, ...(this.position || {}) };
      this.setRect(position.left, position.top, position.width, position.height);
      this.applyOpacity();
      const rect = this.chat.getBoundingClientRect();
      if (
        !this.position ||
        Math.round(this.position.top) !== Math.round(rect.top) ||
        Math.round(this.position.left) !== Math.round(rect.left) ||
        Math.round(this.position.width) !== Math.round(rect.width) ||
        Math.round(this.position.height) !== Math.round(rect.height)
      ) {
        this.savePosition();
      }
    }

    constrainToViewport() {
      if (!this.chat?.classList.contains("ttv-movable-chat")) return;
      const rect = this.chat.getBoundingClientRect();
      this.setRect(rect.left, rect.top, rect.width, rect.height);
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
        [TWITCH_LIVE_CHAT_POSITION_KEY]: this.position,
        [TWITCH_LIVE_CHAT_OPACITY_KEY]: this.opacity,
        [TWITCH_LIVE_CHAT_COMPACT_KEY]: this.compact,
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
        "min-width",
        "min-height",
        "opacity",
        "position",
        "--ttv-chat-rest-opacity",
        "--ttv-chat-rest-opacity-pct",
      ]) {
        this.chat.style.removeProperty(property);
      }
    }

    detachChat() {
      if (!this.chat) return;
      this.chat.classList.remove(
        "ttv-movable-chat",
        "ttv-chat-interacting",
        "ttv-chat-compact",
        "ttv-chat-bg-soft",
        "ttv-chat-bg-translucent",
        "ttv-chat-resize-left"
      );
      this.clearPosition();
      this.chat.querySelector(".ttv-chat-toolbar")?.remove();
      this.chat.querySelector(".ttv-chat-resize-handle")?.remove();
      this.chat.querySelector(".ttv-chat-drag-handle")?.remove();
      this.chat.querySelector(".ttv-chat-compact-btn")?.remove();
      this.chat = null;
    }

    destroy() {
      this.stopListening();
      this.detachChat();
      document.body.classList.remove("ttv-movable-chat-on");
      document.getElementById(TWITCH_MOVABLE_CHAT_STYLE_ID)?.remove();
    }
  }

  const movableTwitchLiveChat = new MovableTwitchLiveChat();

  const FULLSCREEN_TRANSITION_MS = 380;
  const FULLSCREEN_TRANSITION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
  const FULLSCREEN_EVENTS = ["fullscreenchange", "webkitfullscreenchange"];
  const FULLSCREEN_EXIT_STYLE_PROPS = [
    "position",
    "left",
    "top",
    "width",
    "height",
    "right",
    "bottom",
    "inset",
    "margin",
    "z-index",
    "max-width",
    "max-height",
    "transform-origin",
    "overflow",
  ];

  function copyBox(rect) {
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  function isUsableBox(box) {
    return Boolean(box && box.width >= 64 && box.height >= 64);
  }

  function boxesAreClose(a, b) {
    if (!a || !b) return false;
    return (
      Math.abs(a.left - b.left) < 8 &&
      Math.abs(a.top - b.top) < 8 &&
      Math.abs(a.width - b.width) < 8 &&
      Math.abs(a.height - b.height) < 8
    );
  }

  function invertBoxTransform(fromBox, toBox) {
    const sx = fromBox.width / toBox.width;
    const sy = fromBox.height / toBox.height;
    if (!Number.isFinite(sx) || !Number.isFinite(sy) || sx <= 0 || sy <= 0) {
      return null;
    }
    const tx = fromBox.left - toBox.left;
    const ty = fromBox.top - toBox.top;
    return `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${sx.toFixed(5)}, ${sy.toFixed(5)})`;
  }

  function prefersReducedMotion() {
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  }

  function getWatchPlayer() {
    const flexy = document.querySelector("ytd-watch-flexy:not([hidden])");
    const root = flexy || document;
    return root.querySelector("#movie_player") || root.querySelector(".html5-video-player");
  }

  function getNativeFullscreenPlayer() {
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fs || fs === document.documentElement || fs === document.body) {
      return null;
    }
    if (fs.id === "movie_player" || fs.classList?.contains("html5-video-player")) {
      return fs;
    }
    return (
      fs.closest?.("#movie_player, .html5-video-player") ||
      fs.querySelector?.("#movie_player, .html5-video-player")
    );
  }

  class FullscreenTransition {
    constructor() {
      this.enabled = false;
      this.listening = false;
      this.inPlayerFullscreen = false;
      this.fromRect = null;
      this.fullscreenRect = null;
      this.animation = null;
      this.finishTimer = 0;
      this.animatingPlayer = null;
      this.onFullscreenChange = () => this.sync();
      this.onWatchStateChange = () => this.sync();
      this.onPointerDown = () => this.sampleFromRect();
      this.onKeyDown = (event) => this.onSampleKey(event);
      this.onResize = () => this.onViewportChange();
    }

    setEnabled(enabled) {
      if (enabled === this.enabled) {
        if (enabled) this.sync();
        return;
      }
      this.enabled = enabled;
      if (!enabled) {
        this.stopListening();
        this.finishAnimation();
        this.inPlayerFullscreen = false;
        this.fromRect = null;
        this.fullscreenRect = null;
        return;
      }
      this.startListening();
      this.sampleFromRect();
      this.sync();
    }

    startListening() {
      if (this.listening) return;
      this.listening = true;
      for (const event of FULLSCREEN_EVENTS) {
        document.addEventListener(event, this.onFullscreenChange, true);
      }
      addWatchStateListener(this.onWatchStateChange);
      document.addEventListener("pointerdown", this.onPointerDown, true);
      document.addEventListener("keydown", this.onKeyDown, true);
      window.addEventListener("resize", this.onResize);
    }

    stopListening() {
      if (!this.listening) return;
      this.listening = false;
      for (const event of FULLSCREEN_EVENTS) {
        document.removeEventListener(event, this.onFullscreenChange, true);
      }
      removeWatchStateListener(this.onWatchStateChange);
      document.removeEventListener("pointerdown", this.onPointerDown, true);
      document.removeEventListener("keydown", this.onKeyDown, true);
      window.removeEventListener("resize", this.onResize);
    }

    onSampleKey(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key;
      if (key === "f" || key === "F" || key === "Escape") this.sampleFromRect();
    }

    onViewportChange() {
      if (this.inPlayerFullscreen) {
        const player = getNativeFullscreenPlayer() || getWatchPlayer();
        if (!player) return;
        const box = copyBox(player.getBoundingClientRect());
        if (isUsableBox(box)) this.fullscreenRect = box;
        return;
      }
      this.sampleFromRect();
    }

    sampleFromRect() {
      if (!this.enabled || this.inPlayerFullscreen) return;
      const player = getWatchPlayer();
      if (!player) return;
      const box = copyBox(player.getBoundingClientRect());
      if (isUsableBox(box)) this.fromRect = box;
    }

    fallbackFromBox(toBox) {
      return {
        left: toBox.left + toBox.width * 0.06,
        top: toBox.top + toBox.height * 0.06,
        width: toBox.width * 0.88,
        height: toBox.height * 0.88,
      };
    }

    pinPlayerBox(player, box) {
      const style = player.style;
      style.setProperty("position", "fixed", "important");
      style.setProperty("left", `${box.left}px`, "important");
      style.setProperty("top", `${box.top}px`, "important");
      style.setProperty("width", `${box.width}px`, "important");
      style.setProperty("height", `${box.height}px`, "important");
      style.setProperty("right", "auto", "important");
      style.setProperty("bottom", "auto", "important");
      style.setProperty("inset", "auto", "important");
      style.setProperty("margin", "0", "important");
      style.setProperty("z-index", "2147483646", "important");
      style.setProperty("max-width", "none", "important");
      style.setProperty("max-height", "none", "important");
      style.setProperty("transform-origin", "0 0", "important");
      style.setProperty("overflow", "visible", "important");
    }

    unpinPlayer(player) {
      if (!player) return;
      const style = player.style;
      for (const prop of FULLSCREEN_EXIT_STYLE_PROPS) style.removeProperty(prop);
    }

    animate(player, fromTransform, toTransform, exiting) {
      this.finishAnimation();
      this.animatingPlayer = player;
      player.classList.toggle("ytm-fs-exiting", Boolean(exiting));
      player.classList.add("ytm-fs-animating");

      if (typeof player.animate !== "function") {
        this.finishTimer = setTimeout(() => this.finishAnimation(), FULLSCREEN_TRANSITION_MS);
        return;
      }

      const animation = player.animate(
        [
          { transform: fromTransform, transformOrigin: "0 0" },
          { transform: toTransform, transformOrigin: "0 0" },
        ],
        {
          duration: FULLSCREEN_TRANSITION_MS,
          easing: FULLSCREEN_TRANSITION_EASING,
          fill: "both",
        }
      );
      this.animation = animation;
      const done = () => {
        if (this.animation !== animation) return;
        this.finishAnimation();
      };
      animation.finished.then(done, done);
      this.finishTimer = setTimeout(done, FULLSCREEN_TRANSITION_MS + 80);
    }

    finishAnimation() {
      if (this.finishTimer) {
        clearTimeout(this.finishTimer);
        this.finishTimer = 0;
      }
      if (this.animation) {
        try {
          this.animation.cancel();
        } catch {
          /* already finished */
        }
        this.animation = null;
      }
      const player = this.animatingPlayer;
      this.animatingPlayer = null;
      if (!player) return;
      player.classList.remove("ytm-fs-animating", "ytm-fs-exiting");
      this.unpinPlayer(player);
    }

    playEnter(retries = 0) {
      const player = getNativeFullscreenPlayer() || getWatchPlayer();
      if (!player || !this.inPlayerFullscreen) return;

      const toBox = copyBox(player.getBoundingClientRect());
      if (!isUsableBox(toBox)) {
        if (retries >= 8) return;
        requestAnimationFrame(() => {
          if (this.enabled && this.inPlayerFullscreen) this.playEnter(retries + 1);
        });
        return;
      }
      this.fullscreenRect = toBox;

      const fromBox = isUsableBox(this.fromRect) ? this.fromRect : this.fallbackFromBox(toBox);
      if (boxesAreClose(fromBox, toBox)) return;

      const invert = invertBoxTransform(fromBox, toBox);
      if (!invert) return;
      this.animate(player, invert, "none", false);
    }

    playExit() {
      const player = getWatchPlayer();
      if (!player) return;

      const toBox = copyBox(player.getBoundingClientRect());
      const fromBox = isUsableBox(this.fullscreenRect)
        ? this.fullscreenRect
        : {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
      if (!isUsableBox(toBox) || boxesAreClose(fromBox, toBox)) {
        this.sampleFromRect();
        return;
      }

      this.pinPlayerBox(player, toBox);
      const invert = invertBoxTransform(fromBox, toBox);
      if (!invert) {
        this.unpinPlayer(player);
        return;
      }
      this.animate(player, invert, "none", true);
    }

    sync() {
      if (!this.enabled) return;
      const playerFs = Boolean(getNativeFullscreenPlayer());
      if (playerFs === this.inPlayerFullscreen) {
        if (!playerFs) this.sampleFromRect();
        return;
      }
      this.inPlayerFullscreen = playerFs;
      if (prefersReducedMotion()) {
        this.finishAnimation();
        if (playerFs) {
          const player = getNativeFullscreenPlayer();
          if (player) {
            const box = copyBox(player.getBoundingClientRect());
            if (isUsableBox(box)) this.fullscreenRect = box;
          }
        } else {
          this.sampleFromRect();
        }
        return;
      }
      if (playerFs) this.playEnter();
      else this.playExit();
    }
  }

  const fullscreenTransition = new FullscreenTransition();

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
      this.listening = false;
      this.onWatchStateChange = () => this.sync();
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

      this.enabled = true;
      const stored = await chrome.storage.local.get([
        THEATER_COMMENTS_WIDTH_KEY,
        LEGACY_THEATER_COMMENTS_WIDTH_KEY,
      ]);
      if (!this.enabled) return;
      this.widths = {
        left: null,
        right: null,
        ...(stored[LEGACY_THEATER_COMMENTS_WIDTH_KEY] || {}),
        ...(stored[THEATER_COMMENTS_WIDTH_KEY] || {}),
      };
      this.startListening();
      this.sync();
    }

    startListening() {
      if (this.listening) return;
      this.listening = true;
      addWatchStateListener(this.onWatchStateChange);
    }

    stopListening() {
      if (!this.listening) return;
      this.listening = false;
      removeWatchStateListener(this.onWatchStateChange);
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
      this.stopListening();
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
    const twitchEnabled = siteId === "twitch" && siteEnabled;
    setTheaterLayoutSyncEnabled(
      youtubeEnabled && merged.features?.["theater-mode"] !== false
    );
    await movableLiveChat.setEnabled(
      youtubeEnabled && merged.features?.["movable-live-chat"] === true,
      merged.subsettings?.movableLiveChat
    );
    await movableTwitchLiveChat.setEnabled(
      twitchEnabled && merged.features?.["twitch-movable-live-chat"] === true,
      merged.subsettings?.twitchMovableLiveChat
    );
    await theaterHoverComments.setEnabled(
      youtubeEnabled &&
        merged.features?.["theater-mode"] !== false &&
        merged.subsettings?.theater?.hoverComments !== false,
      { commentsSide: merged.subsettings?.theater?.commentsSide ?? "left" }
    );
    fullscreenTransition.setEnabled(
      youtubeEnabled && merged.features?.["fullscreen-transition"] !== false
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
      applySettings(mergeSettings(changes[SETTINGS_KEY].newValue)).catch(() => {});
      return;
    }
    if (changes[LEGACY_SETTINGS_KEY]) {
      applySettings(mergeSettings(changes[LEGACY_SETTINGS_KEY].newValue)).catch(() => {});
    }
  });

  init().catch(() => {});
})();
