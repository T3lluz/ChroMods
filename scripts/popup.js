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

const DEFAULT_YTMUSIC_QUEUE = {
  autoCompact: true,
};

const THEATER_SUBSETTINGS = [
  {
    id: "hideHeader",
    title: "Auto-hide header",
    description: "Hide the top bar in theater mode, reveal on hover.",
    type: "toggle",
  },
  {
    id: "headerBlur",
    title: "Blur header",
    description: "Frosted-glass blur on the masthead, matching player controls.",
    type: "toggle",
  },
  {
    id: "hoverComments",
    title: "Hover comments",
    description: "Show comments in a slide-in panel when hovering the edge.",
    type: "toggle",
  },
  {
    id: "commentsSide",
    title: "Comments side",
    description: "Which edge the comments panel slides in from.",
    type: "select",
    dependsOn: "hoverComments",
    options: [
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
    ],
  },
];

const FEED_SUBSETTINGS = [
  {
    id: "columns",
    title: "Videos per row",
    description: "How many videos appear horizontally in the home feed grid.",
    type: "select",
    options: [
      { value: "auto", label: "Auto (responsive)" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6", label: "6" },
    ],
  },
];

const MOVABLE_LIVE_CHAT_SUBSETTINGS = [
  {
    id: "chatOnly",
    title: "Chat only",
    description: "Hide border, header, and input until you hover the chat.",
    type: "toggle",
  },
  {
    id: "background",
    title: "Background",
    description: "How opaque the chat background is over the video. Text stays solid.",
    type: "select",
    options: [
      { value: "solid", label: "Solid" },
      { value: "soft", label: "Soft" },
      { value: "translucent", label: "Translucent until hover" },
    ],
  },
];

const YTMUSIC_QUEUE_SUBSETTINGS = [
  {
    id: "autoCompact",
    title: "Tuck away when narrow",
    description: "Collapse the queue when the window has no room for it beside the page.",
    type: "toggle",
  },
];

const CATEGORY_META = [
  { id: "search", title: "Search", icon: "category-search" },
  { id: "feed", title: "Home feed", icon: "category-feed" },
  { id: "navigation", title: "Navigation", icon: "category-nav" },
  { id: "appearance", title: "Appearance", icon: "category-appearance" },
  { id: "player", title: "Player", icon: "category-player" },
  { id: "live", title: "Live & comments", icon: "category-live" },
];

const FEATURE_META = [
  {
    id: "immersive-search",
    category: "search",
    title: "Immersive search",
    description: "Smooth blur and zoom effect when focusing the search bar.",
  },
  {
    id: "feed-layout",
    category: "feed",
    title: "Feed layout fix",
    description: "Denser home feed that follows the feed width, or a fixed column count.",
    subsettings: FEED_SUBSETTINGS,
    subsettingsKey: "feed",
  },
  {
    id: "hide-filter-chips",
    category: "feed",
    title: "Hide filter chips",
    description: "Remove the category chip bar and header row on the home feed.",
  },
  {
    id: "thumbnail-hover",
    category: "feed",
    title: "Thumbnail hover",
    description: "Enlarge inline video previews after hovering a thumbnail.",
    defaultEnabled: false,
  },
  {
    id: "hide-distractions",
    category: "feed",
    title: "Hide distractions",
    description: "Remove Shorts shelves, merch shelves, and legacy annotations.",
    defaultEnabled: false,
  },
  {
    id: "compact-sidebar",
    category: "navigation",
    title: "Compact sidebar",
    description: "Icon-only guide sidebar with a cleaner, minimal layout.",
    conflictsWith: "hide-side-guide",
  },
  {
    id: "hide-side-guide",
    category: "navigation",
    title: "Hide side guide",
    description: "Completely remove YouTube's side navigation.",
    defaultEnabled: false,
    conflictsWith: "compact-sidebar",
  },
  {
    id: "clean-side-guide",
    category: "navigation",
    title: "Clean side guide",
    description: "Hide Studio, Sports, Settings, and footer links from the guide.",
    defaultEnabled: false,
  },
  {
    id: "theater-mode",
    category: "player",
    title: "Theater mode",
    description: "Full-window theater view with configurable comments panel.",
    subsettings: THEATER_SUBSETTINGS,
    subsettingsKey: "theater",
  },
  {
    id: "fullscreen-transition",
    category: "player",
    title: "Fullscreen transition",
    description: "Scale the player up and down when entering or leaving fullscreen, like theater mode.",
  },
  {
    id: "player-blur",
    category: "player",
    title: "Player blur",
    description: "Frosted-glass blur on video player controls and menus.",
  },
  {
    id: "disable-ambient-mode",
    category: "player",
    title: "Disable ambient mode",
    description: "Remove YouTube's cinematic ambient glow behind the player.",
    defaultEnabled: false,
  },
  {
    id: "better-captions",
    category: "player",
    title: "Better captions",
    description: "Use a compact frosted caption panel with clearer text.",
    defaultEnabled: false,
  },
  {
    id: "youtube-tv",
    category: "player",
    title: "YouTube TV",
    description: "Polish the large-screen YouTube TV player and overlays.",
    defaultEnabled: false,
  },
  {
    id: "overlay-live-chat",
    category: "live",
    title: "Overlay live chat",
    description: "Float live chat at the right edge while in theater mode.",
    defaultEnabled: false,
    conflictsWith: "movable-live-chat",
  },
  {
    id: "movable-live-chat",
    category: "live",
    title: "Movable live chat",
    description: "Drag and resize live chat in theater mode.",
    defaultEnabled: false,
    conflictsWith: "overlay-live-chat",
    subsettings: MOVABLE_LIVE_CHAT_SUBSETTINGS,
    subsettingsKey: "movableLiveChat",
  },
  {
    id: "ytm-sticky-queue",
    site: "ytmusic",
    category: "player",
    title: "Sticky queue",
    description:
      "Dock Up next on the right so the queue stays visible while you browse playlists. Drag its edge to resize, or collapse it out of the way.",
    subsettings: YTMUSIC_QUEUE_SUBSETTINGS,
    subsettingsKey: "ytmusicQueue",
  },
  {
    id: "gh-immersive-search",
    site: "github",
    category: "search",
    title: "Immersive search",
    description: "Blur and zoom the page when focusing the header search bar.",
  },
  {
    id: "gh-hover",
    site: "github",
    category: "feed",
    title: "Hover sidebars",
    description: "Hide the home-feed left and right sidebars until you hover them.",
    defaultEnabled: false,
  },
  {
    id: "gh-no-tab-text",
    site: "github",
    category: "navigation",
    title: "No tab text",
    description: "Repository tabs show icons only; labels appear on hover.",
  },
  {
    id: "gh-repo-sidebar-hover",
    site: "github",
    category: "navigation",
    title: "Repo sidebar hover",
    description: "Collapse the repository About sidebar until you hover it.",
    defaultEnabled: false,
  },
  {
    id: "gh-no-footer",
    site: "github",
    category: "navigation",
    title: "Hide footer",
    description: "Hide GitHub's page footer.",
  },
  {
    id: "gh-hide-toolbar-separator",
    site: "github",
    category: "navigation",
    title: "Hide toolbar separator",
    description: "Remove the divider in the header actions toolbar.",
  },
  {
    id: "gh-glass-effect",
    site: "github",
    category: "appearance",
    title: "Glass effect",
    description: "Frosted-glass look on buttons, comments, editors, and cards.",
  },
  {
    id: "gh-border-mods",
    site: "github",
    category: "appearance",
    title: "Softer borders",
    description: "Drop table borders and round file, tab, and header edges.",
  },
  {
    id: "gh-remove-borders",
    site: "github",
    category: "appearance",
    title: "Remove button borders",
    description: "Strip borders from secondary buttons, inputs, and the branch bar.",
  },
  {
    id: "gh-timeline-badge",
    site: "github",
    category: "appearance",
    title: "Timeline badges",
    description: "Give issue and pull-request timeline icons a clearer glass background.",
  },
  {
    id: "gh-chip-margin",
    site: "github",
    category: "appearance",
    title: "Chip spacing",
    description: "Add breathing room around overview chips and the Copilot menu button.",
  },
  {
    id: "g-search-zoom",
    site: "google",
    category: "search",
    title: "Immersive search",
    description: "Blur and scale the results page when the search box is focused.",
  },
  {
    id: "g-hover",
    site: "google",
    category: "feed",
    title: "Hover filter chips",
    description: "Hide the Images and search filter chip row until you hover it.",
    defaultEnabled: false,
  },
  {
    id: "g-glass-effect",
    site: "google",
    category: "appearance",
    title: "Glass search bar",
    description: "Inset glass on the search box and a softer AI Overview panel.",
  },
  {
    id: "g-overlay-fix",
    site: "google",
    category: "appearance",
    title: "Solid overlays",
    description: "Keep sports, dialog, and mini-search overlays readable.",
  },
  {
    id: "g-shadows-borders",
    site: "google",
    category: "appearance",
    title: "Softer chrome",
    description: "Drop extra search-bar shadows and hide the page footer.",
  },
  {
    id: "ddg-immersive-search",
    site: "duckduckgo",
    category: "search",
    title: "Immersive search",
    description: "Blur and scale the page when the search box is focused.",
  },
  {
    id: "ddg-immersive-popup",
    site: "duckduckgo",
    category: "search",
    title: "Immersive popups",
    description: "Blur the page behind menus and settings.",
  },
  {
    id: "ddg-no-learn-more",
    site: "duckduckgo",
    category: "feed",
    title: "Hide Learn more",
    description: "Remove the homepage features section and scroll prompt.",
  },
  {
    id: "ddg-hidden-promo",
    site: "duckduckgo",
    category: "feed",
    title: "Hide homepage hero",
    description: "Remove the homepage hero promo block.",
    defaultEnabled: false,
  },
  {
    id: "ddg-no-share-feedback",
    site: "duckduckgo",
    category: "navigation",
    title: "Hide feedback",
    description: "Remove the Share Feedback control.",
  },
  {
    id: "ddg-no-footer",
    site: "duckduckgo",
    category: "navigation",
    title: "Hide footer",
    description: "Hide DuckDuckGo's page footer.",
  },
  {
    id: "ddg-glass-effect",
    site: "duckduckgo",
    category: "appearance",
    title: "Glass surfaces",
    description: "Frosted panels on the search box, cards, menus, and modules.",
  },
  {
    id: "ddg-animations",
    site: "duckduckgo",
    category: "appearance",
    title: "Smooth blur",
    description: "Ease the immersive blur in and out.",
  },
  {
    id: "ddg-misc",
    site: "duckduckgo",
    category: "appearance",
    title: "Clean decorations",
    description: "Remove leftover nav and chat form overlays.",
  },
  {
    id: "gmail-no-borders",
    site: "gmail",
    category: "appearance",
    title: "No borders",
    description: "Drop borders and shadows from Gmail chrome.",
  },
  {
    id: "gmail-hidden",
    site: "gmail",
    category: "feed",
    title: "Hide extras",
    description: "Hide leftover promo chrome and the thread extras column.",
  },
  {
    id: "gmail-preview",
    site: "gmail",
    category: "feed",
    title: "Preview restyle",
    description: "Card-style conversation chrome; leaves the email body alone.",
    defaultEnabled: false,
  },
  {
    id: "gmail-glass",
    site: "gmail",
    category: "appearance",
    title: "Glass inbox",
    description: "Inset glass on the main mail pane using Gmail surface colors.",
  },
  {
    id: "gmail-rounded-corners",
    site: "gmail",
    category: "appearance",
    title: "Rounded corners",
    description: "Round the list and thread containers.",
  },
  {
    id: "gmail-flashbangless-loading",
    site: "gmail",
    category: "appearance",
    title: "Soft loading",
    description: "Blur the inbox while Gmail loads and frost compose chrome.",
  },
  {
    id: "gemini-better-text-input",
    site: "gemini",
    category: "appearance",
    title: "Clean composer",
    description: "Drop the composer border and use a matching fill.",
  },
  {
    id: "gemini-other-changes",
    site: "gemini",
    category: "feed",
    title: "Cleaner chat",
    description: "Hide the disclaimer, add composer space, and solid overlay cards.",
  },
  {
    id: "gemini-hover",
    site: "gemini",
    category: "navigation",
    title: "Hover chrome",
    description: "Hide the conversation sidebar and top actions until hover.",
    defaultEnabled: false,
  },
  {
    id: "gemini-input-code",
    site: "gemini",
    category: "appearance",
    title: "Glass input",
    description: "Frosted glass on the composer and code blocks.",
  },
  {
    id: "x-overlay-fix",
    site: "x",
    category: "appearance",
    title: "Solid overlays",
    description: "Keep menus and dialogs readable.",
  },
  {
    id: "x-layout-fixes",
    site: "x",
    category: "navigation",
    title: "Sticky header",
    description: "Keep the timeline header offset while scrolling.",
  },
  {
    id: "x-hover",
    site: "x",
    category: "navigation",
    title: "Hover sidebars",
    description: "Hide the left and right rails until you hover them.",
    defaultEnabled: false,
  },
  {
    id: "x-no-thanks",
    site: "x",
    category: "feed",
    title: "Hide Premium",
    description: "Remove Premium subscribe, footer, and upsell cards.",
  },
  {
    id: "twitch-no-footer",
    site: "twitch",
    category: "navigation",
    title: "Hide footer",
    description: "Hide Twitch's page footer.",
  },
  {
    id: "twitch-movable-live-chat",
    site: "twitch",
    category: "live",
    title: "Movable live chat",
    description: "Drag and resize theater chat; chrome stays hidden until hover.",
    defaultEnabled: false,
    subsettings: MOVABLE_LIVE_CHAT_SUBSETTINGS,
    subsettingsKey: "twitchMovableLiveChat",
  },
  {
    id: "cgpt-sidebar",
    site: "chatgpt",
    category: "navigation",
    title: "Sidebar glass",
    description: "Frosted glass on the sidebar header, New chat, and Search chats.",
  },
  {
    id: "cgpt-page-header",
    site: "chatgpt",
    category: "navigation",
    title: "Header actions",
    description: "Frosted share and conversation buttons in the chat header.",
  },
  {
    id: "cgpt-composer",
    site: "chatgpt",
    category: "appearance",
    title: "Glass composer",
    description: "Frosted glass composer with clearer text and pills.",
  },
  {
    id: "cgpt-messages",
    site: "chatgpt",
    category: "feed",
    title: "Message bubbles",
    description: "Style chat turns as readable glass bubbles.",
  },
  {
    id: "cgpt-code",
    site: "chatgpt",
    category: "appearance",
    title: "Code panels",
    description: "Frosted panels for code blocks and copy buttons.",
  },
  {
    id: "cgpt-flyout",
    site: "chatgpt",
    category: "appearance",
    title: "Flyout glass",
    description: "Glass styling for reasoning and stage thread flyouts.",
  },
  {
    id: "cgpt-popovers",
    site: "chatgpt",
    category: "appearance",
    title: "Popover glass",
    description: "Strong glass on menus, dialogs, tooltips, and composer dropdowns.",
  },
  {
    id: "cgpt-pages",
    site: "chatgpt",
    category: "appearance",
    title: "Library surfaces",
    description: "Fix Library, Apps, GPTs, and search surfaces.",
  },
  {
    id: "cgpt-decorative",
    site: "chatgpt",
    category: "appearance",
    title: "Softer splash",
    description: "Soften splash artwork and hide a floating upgrade badge.",
  },
  {
    id: "cgpt-fallback",
    site: "chatgpt",
    category: "appearance",
    title: "Solid fallback",
    description: "Use semi-solid surfaces when backdrop-filter is not supported.",
  },
  {
    id: "cgpt-reduced-motion",
    site: "chatgpt",
    category: "appearance",
    title: "Reduced motion",
    description: "Reduce transitions when the user prefers less motion.",
  },
  {
    id: "cgpt-hide-hint",
    site: "chatgpt",
    category: "feed",
    title: "Hide hint",
    description: "Hide the ChatGPT can make mistakes disclaimer.",
  },
];

for (const feature of FEATURE_META) {
  feature.site ??= "youtube";
}

const FEATURE_BY_ID = Object.fromEntries(FEATURE_META.map((feature) => [feature.id, feature]));

const DEFAULT_SITES = Object.fromEntries(SITE_META.map((site) => [site.id, { enabled: true }]));

const DEFAULT_SETTINGS = {
  enabled: true,
  sites: structuredClone(DEFAULT_SITES),
  features: Object.fromEntries(
    FEATURE_META.map((feature) => [feature.id, feature.defaultEnabled !== false])
  ),
  subsettings: {
    theater: { ...DEFAULT_THEATER },
    feed: { ...DEFAULT_FEED },
    movableLiveChat: { ...DEFAULT_MOVABLE_LIVE_CHAT },
    twitchMovableLiveChat: { ...DEFAULT_TWITCH_MOVABLE_LIVE_CHAT },
    ytmusicQueue: { ...DEFAULT_YTMUSIC_QUEUE },
  },
};

const appEl = document.getElementById("app");
const shellEl = document.getElementById("shell");
const siteRail = document.getElementById("site-rail");
const currentPane = document.getElementById("current-pane");
const otherSitesList = document.getElementById("other-sites-list");
const otherSitesTitle = document.getElementById("other-sites-title");
const reloadBtn = document.getElementById("reload");
const versionPill = document.getElementById("version-pill");
const themeToggle = document.getElementById("theme-toggle");
const settingsView = document.getElementById("settings-view");
const settingsOpenBtn = document.getElementById("settings-open");
const settingsBackBtn = document.getElementById("settings-back");
const searchInput = document.getElementById("mod-search");
const searchResults = document.getElementById("search-results");
const shortcutList = document.getElementById("shortcut-list");
const darkSiteTitle = document.getElementById("dark-site-title");
const darkSiteHost = document.getElementById("dark-site-host");
const darkSiteToggle = document.getElementById("dark-site-toggle");
const darkSliders = document.getElementById("dark-sliders");
const darkSystemControls = document.getElementById("dark-system-controls");
const darkSkipNative = document.getElementById("dark-skip-native");
const darkSiteListWrap = document.getElementById("dark-site-list-wrap");
const darkSiteList = document.getElementById("dark-site-list");
const updateSection = document.getElementById("update-section");
const updateLead = document.getElementById("update-lead");
const updateDot = document.getElementById("update-dot");
const updateHeadline = document.getElementById("update-headline");
const updateStatus = document.getElementById("update-status");
const updateCheckBtn = document.getElementById("update-check");
const updateDetails = document.getElementById("update-details");
const updateNotes = document.getElementById("update-notes");
const updateCommandText = document.getElementById("update-command-text");
const updateGitCommand = document.getElementById("update-git-command");
const updateCopyBtn = document.getElementById("update-copy");
const updateDownloadBtn = document.getElementById("update-download");
const updateApplyBtn = document.getElementById("update-apply");
const updateReloadBtn = document.getElementById("update-reload");
const updateExtensionsBtn = document.getElementById("update-extensions");
const updateNotesLink = document.getElementById("update-notes-link");
const updateDismissBtn = document.getElementById("update-dismiss");
const updateFoot = document.getElementById("update-foot");
const updateApplyHint = document.getElementById("update-apply-hint");
const shortcutsPageBtn = document.getElementById("shortcuts-page");

let settings = structuredClone(DEFAULT_SETTINGS);
let currentSite = null;
let activeTab = null;
let darkSettingsHost = null;
let darkThemeSaveTimer = 0;
let darkThemePushFrame = 0;
let darkScriptReady = false;
let shortcutState = chromodsMergeShortcuts();
let recordingShortcutId = null;
let searchActiveIndex = -1;
let searchHitTimer = 0;
let updateState = chromodsNormalizeUpdateState(null);
let installType = "unknown";
let updateCopyTimer = 0;
const collapsedCategories = new Set();
const collapsedOtherSites = new Set();

function mergeFeatureSettings(storedFeatures = {}) {
  const merged = Object.fromEntries(
    Object.entries(DEFAULT_SETTINGS.features).map(([id, defaultValue]) => [
      id,
      typeof storedFeatures[id] === "boolean" ? storedFeatures[id] : defaultValue,
    ])
  );

  if (merged["hide-side-guide"]) merged["compact-sidebar"] = false;
  if (merged["movable-live-chat"]) merged["overlay-live-chat"] = false;
  return merged;
}

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

function getFeatureSubsettings(feature) {
  const key = feature.subsettingsKey;
  if (!key) return {};

  if (key === "theater") {
    return migrateTheater(settings.subsettings?.theater);
  }
  if (key === "feed") {
    return {
      ...DEFAULT_FEED,
      ...(settings.subsettings?.feed || {}),
    };
  }
  if (key === "movableLiveChat") {
    return migrateMovableLiveChat(settings.subsettings?.movableLiveChat);
  }
  if (key === "twitchMovableLiveChat") {
    return migrateMovableLiveChat(
      settings.subsettings?.twitchMovableLiveChat,
      DEFAULT_TWITCH_MOVABLE_LIVE_CHAT
    );
  }
  if (key === "ytmusicQueue") {
    return {
      ...DEFAULT_YTMUSIC_QUEUE,
      ...(settings.subsettings?.ytmusicQueue || {}),
    };
  }

  return {
    ...(settings.subsettings?.[key] || {}),
  };
}

const SETTINGS_KEY = "chroModsSettings";
const LEGACY_SETTINGS_KEY = "youtubeThemingSettings";

async function loadSettings() {
  const stored = await chrome.storage.sync.get([SETTINGS_KEY, LEGACY_SETTINGS_KEY]);
  const storedSettings = stored[SETTINGS_KEY] ?? stored[LEGACY_SETTINGS_KEY];
  settings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    features: mergeFeatureSettings(storedSettings?.features),
    sites: mergeSiteSettings(storedSettings),
    subsettings: {
      theater: migrateTheater(storedSettings?.subsettings?.theater),
      feed: {
        ...DEFAULT_FEED,
        ...(storedSettings?.subsettings?.feed || {}),
      },
      movableLiveChat: migrateMovableLiveChat(
        storedSettings?.subsettings?.movableLiveChat
      ),
      twitchMovableLiveChat: migrateMovableLiveChat(
        storedSettings?.subsettings?.twitchMovableLiveChat,
        DEFAULT_TWITCH_MOVABLE_LIVE_CHAT
      ),
      ytmusicQueue: {
        ...DEFAULT_YTMUSIC_QUEUE,
        ...(storedSettings?.subsettings?.ytmusicQueue || {}),
      },
    },
  };

  if (JSON.stringify(settings) !== JSON.stringify(storedSettings) || !stored[SETTINGS_KEY]) {
    await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
  }
}

async function saveSettings() {
  await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
}

function mergeSiteSettings(storedSettings = {}) {
  const storedSites = storedSettings.sites || {};
  const youtubeEnabled =
    typeof storedSites.youtube?.enabled === "boolean"
      ? storedSites.youtube.enabled
      : storedSettings.enabled !== false;

  return Object.fromEntries(
    SITE_META.map((site) => [
      site.id,
      {
        enabled:
          site.id === "youtube"
            ? youtubeEnabled
            : typeof storedSites[site.id]?.enabled === "boolean"
              ? storedSites[site.id].enabled
              : true,
      },
    ])
  );
}

function featuresForSite(siteId) {
  return FEATURE_META.filter((feature) => feature.site === siteId);
}

function isSiteEnabled(siteId) {
  return settings.sites?.[siteId]?.enabled !== false;
}

function setSiteEnabled(siteId, enabled) {
  settings.sites[siteId] = { ...(settings.sites[siteId] || {}), enabled };
  if (siteId === "youtube") settings.enabled = enabled;
}

function siteCountLabel(siteId) {
  const features = featuresForSite(siteId);
  if (!features.length) return "No mods yet";
  if (!isSiteEnabled(siteId)) return "All disabled";
  const enabled = features.filter((feature) => settings.features[feature.id] !== false).length;
  return `${enabled}/${features.length}`;
}

async function detectActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    activeTab = tab ?? null;
  } catch {
    activeTab = null;
  }
  currentSite = matchSiteFromUrl(activeTab?.url || "");
}

function updateFeatureCount() {
  document.querySelectorAll("[data-site-count]").forEach((el) => {
    el.textContent = siteCountLabel(el.dataset.siteCount);
  });
}

function isSubsettingActive(sub, featureSettings) {
  if (!sub.dependsOn) return true;
  return featureSettings[sub.dependsOn] !== false;
}

function renderSwitch({ ariaLabel, checked = false, disabled = false, className = "", inputAttrs = "" }) {
  return `
    <label class="switch${className ? ` ${className}` : ""}" aria-label="${ariaLabel}">
      <input type="checkbox" ${inputAttrs} ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
      <span class="slider">
        <span class="knob">
          <svg class="switch-check" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.1 6.2 4.8 8.8 9.9 3.2" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </span>
    </label>
  `;
}

function renderSubsettings(feature, featureSettings) {
  if (!feature.subsettings?.length) return "";

  const siteEnabled = isSiteEnabled(feature.site);
  const featureEnabled = siteEnabled && settings.features[feature.id] !== false;

  const rows = feature.subsettings
    .map((sub) => {
      const active = isSubsettingActive(sub, featureSettings);
      const disabled = !featureEnabled || !active;

      if (sub.type === "select") {
        const options = sub.options
          .map(
            (opt) =>
              `<option value="${opt.value}" ${featureSettings[sub.id] === opt.value ? "selected" : ""}>${opt.label}</option>`
          )
          .join("");

        return `
          <div class="subsetting-row${disabled ? " disabled" : ""}">
            <div class="subsetting-info">
              <span class="subsetting-title">${sub.title}</span>
              <span class="subsetting-desc">${sub.description}</span>
            </div>
            <select class="subsetting-select" data-subsetting="${sub.id}" ${disabled ? "disabled" : ""}>
              ${options}
            </select>
          </div>
        `;
      }

      const checked = featureSettings[sub.id] !== false;
      return `
        <div class="subsetting-row${disabled ? " disabled" : ""}">
          <div class="subsetting-info">
            <span class="subsetting-title">${sub.title}</span>
            <span class="subsetting-desc">${sub.description}</span>
          </div>
          ${renderSwitch({
            ariaLabel: sub.title,
            checked,
            disabled,
            className: "switch-sm",
            inputAttrs: `data-subsetting="${sub.id}"`,
          })}
        </div>
      `;
    })
    .join("");

  return `
    <div class="feature-expansion${featureEnabled ? " is-open" : ""}">
      <div class="feature-expansion-inner">
        <div class="subsettings">${rows}</div>
      </div>
    </div>
  `;
}

function bindSubsettings(card, feature) {
  if (!feature.subsettingsKey) return;

  card.querySelectorAll("[data-subsetting]").forEach((control) => {
    control.addEventListener("change", async (event) => {
      const id = event.target.dataset.subsetting;
      const featureSettings = getFeatureSubsettings(feature);

      if (event.target.type === "checkbox") {
        featureSettings[id] = event.target.checked;
      } else {
        featureSettings[id] = event.target.value;
      }

      settings.subsettings[feature.subsettingsKey] = featureSettings;
      const dependentControls = card.querySelectorAll("[data-subsetting]");
      dependentControls.forEach((dependentControl) => {
        const dependentMeta = feature.subsettings.find(
          (item) => item.id === dependentControl.dataset.subsetting
        );
        const active = isSubsettingActive(dependentMeta, featureSettings);
        const disabled =
          !isSiteEnabled(feature.site) || settings.features[feature.id] === false || !active;
        dependentControl.disabled = disabled;
        dependentControl.closest(".subsetting-row")?.classList.toggle("disabled", disabled);
      });
      await saveSettings();

    });
  });
}

function renderFeatureCard(feature) {
  const siteEnabled = isSiteEnabled(feature.site);
  const enabled = settings.features[feature.id] !== false;
  const featureSettings = getFeatureSubsettings(feature);
  const card = document.createElement("article");
  card.className = `feature-card${siteEnabled ? "" : " disabled"}`;
  card.dataset.feature = feature.id;
  card.dataset.site = feature.site;

  card.innerHTML = `
    <div class="feature-header">
      <h4 class="feature-title">${feature.title}</h4>
      ${renderSwitch({
        ariaLabel: feature.title,
        checked: enabled,
        disabled: !siteEnabled,
        inputAttrs: `data-feature="${feature.id}"`,
      })}
      <p class="feature-desc">${feature.description}</p>
    </div>
    ${renderSubsettings(feature, featureSettings)}
  `;

  bindSubsettings(card, feature);
  return card;
}

function renderCategoryList(parent, siteId) {
  const siteFeatures = featuresForSite(siteId);
  parent.innerHTML = "";

  if (!siteFeatures.length) {
    const empty = document.createElement("p");
    empty.className = "site-empty";
    empty.textContent = `No ${SITE_BY_ID[siteId]?.title ?? siteId} mods yet. They'll appear here once added.`;
    parent.appendChild(empty);
    return;
  }

  for (const category of CATEGORY_META) {
    const features = siteFeatures.filter((feature) => feature.category === category.id);
    if (!features.length) continue;

    const section = document.createElement("section");
    section.className = "category-section";
    section.dataset.category = `${siteId}:${category.id}`;

    const collapsedKey = `${siteId}:${category.id}`;
    section.innerHTML = `
      <button class="category-header" type="button" aria-expanded="${!collapsedCategories.has(collapsedKey)}">
        <span class="category-icon" aria-hidden="true">${iconMarkup(category.icon)}</span>
        <h3 class="category-title">${category.title}</h3>
        <span class="category-count">${features.length}</span>
        <span class="category-chevron" aria-hidden="true"></span>
      </button>
      <div class="category-expansion${collapsedCategories.has(collapsedKey) ? "" : " is-open"}">
        <div class="category-expansion-inner">
          <div class="category-features"></div>
        </div>
      </div>
    `;

    const container = section.querySelector(".category-features");
    for (const feature of features) {
      container.appendChild(renderFeatureCard(feature));
    }

    const categoryHeader = section.querySelector(".category-header");
    const categoryExpansion = section.querySelector(".category-expansion");
    categoryHeader.addEventListener("click", () => {
      const willOpen = !categoryExpansion.classList.contains("is-open");
      categoryExpansion.classList.toggle("is-open", willOpen);
      categoryHeader.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) {
        collapsedCategories.delete(collapsedKey);
      } else {
        collapsedCategories.add(collapsedKey);
      }
    });

    parent.appendChild(section);
  }

  bindFeatureToggles(parent);
}

function bindFeatureToggles(scope) {
  scope.querySelectorAll("input[data-feature]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const id = event.target.dataset.feature;
      const checked = event.target.checked;
      settings.features[id] = checked;
      const meta = FEATURE_BY_ID[id];
      const siteEnabled = isSiteEnabled(meta.site);

      if (checked && meta?.conflictsWith) {
        settings.features[meta.conflictsWith] = false;
      }

      updateFeatureCount();
      const card = event.target.closest(".feature-card");
      card
        ?.querySelector(".feature-expansion")
        ?.classList.toggle("is-open", checked && siteEnabled);
      card?.querySelectorAll("[data-subsetting]").forEach((control) => {
        const sub = meta?.subsettings?.find(
          (item) => item.id === control.dataset.subsetting
        );
        const active = sub ? isSubsettingActive(sub, getFeatureSubsettings(meta)) : true;
        control.disabled = !checked || !siteEnabled || !active;
        control
          .closest(".subsetting-row")
          ?.classList.toggle("disabled", control.disabled);
      });

      if (checked && meta?.conflictsWith) {
        const conflictingCard = document.querySelector(
          `.feature-card[data-feature="${meta.conflictsWith}"]`
        );
        const conflictingInput = conflictingCard?.querySelector("input[data-feature]");
        if (conflictingInput) conflictingInput.checked = false;
        conflictingCard
          ?.querySelector(".feature-expansion")
          ?.classList.remove("is-open");
      }

      await saveSettings();
    });
  });
}

function bindSiteEnableToggle(input, siteId) {
  input.checked = isSiteEnabled(siteId);
  input.addEventListener("click", (event) => event.stopPropagation());
  input.addEventListener("change", async () => {
    setSiteEnabled(siteId, input.checked);
    updateMasterState(siteId);
    await saveSettings();
  });
}

function renderEnableSwitch(site) {
  const idAttr = site.id === "youtube" ? ` id="master-toggle"` : "";
  const countId = site.id === "youtube" ? ` id="feature-count"` : "";
  return `
    <div class="heading-actions">
      <span class="feature-count" data-site-count="${site.id}"${countId}>${siteCountLabel(site.id)}</span>
      ${renderSwitch({
        ariaLabel: `Enable ${site.title}`,
        checked: isSiteEnabled(site.id),
        inputAttrs: `data-site-enable="${site.id}"${idAttr}`,
      })}
    </div>
  `;
}

function requestableHost() {
  return chromodsRequestableHostFromUrl(activeTab?.url || "");
}

function renderUnsupportedBar() {
  const host = requestableHost();
  if (!host) {
    return `
      <div class="unsupported-bar">
        <span class="unsupported-tag">No mods for this tab</span>
      </div>
    `;
  }

  return `
    <div class="unsupported-bar">
      <span class="unsupported-tag">No mods for this site</span>
      <span class="unsupported-host" title="${host}">${host}</span>
      <button id="request-style" class="request-style-btn" type="button">Request styling</button>
    </div>
  `;
}

async function openStyleRequest() {
  const host = requestableHost();
  if (!host) return;

  const button = document.getElementById("request-style");
  if (button) {
    button.disabled = true;
    button.textContent = "Checking…";
  }

  const pageUrl = activeTab?.url || "";
  let dest = chromodsStyleRequestIssueUrl(host, pageUrl);
  try {
    const existing = await chromodsFindExistingStyleRequest(host);
    if (existing?.htmlUrl) dest = existing.htmlUrl;
  } catch {
    /* fall through to a new issue */
  }

  await chrome.tabs.create({ url: dest });
  window.close();
}

function renderCurrentPane() {
  currentPane.innerHTML = "";

  if (!currentSite) {
    currentPane.innerHTML = renderUnsupportedBar();
    currentPane.querySelector("#request-style")?.addEventListener("click", openStyleRequest);
    return;
  }

  const panel = document.createElement("section");
  panel.className = "site-panel-current";
  panel.dataset.site = currentSite.id;
  panel.id = `site-panel-${currentSite.id}`;
  panel.innerHTML = `
    <div class="site-heading">
      <span class="site-heading-icon" aria-hidden="true">${iconMarkup(currentSite.icon)}</span>
      <div class="site-heading-text">
        <h2>${currentSite.title}</h2>
        <p class="site-heading-meta">On this page</p>
      </div>
      ${
        featuresForSite(currentSite.id).length
          ? renderEnableSwitch(currentSite)
          : `<div class="heading-actions"><span class="feature-count" data-site-count="${currentSite.id}">${siteCountLabel(currentSite.id)}</span></div>`
      }
    </div>
    <div class="features-list" id="features-list"></div>
  `;
  currentPane.appendChild(panel);
  const enableInput = panel.querySelector("[data-site-enable]");
  if (enableInput) bindSiteEnableToggle(enableInput, currentSite.id);
  renderCategoryList(panel.querySelector(".features-list"), currentSite.id);
}

function renderOtherSitePanel(site, expanded) {
  const features = featuresForSite(site.id);
  const panel = document.createElement("section");
  panel.className = "site-panel-other card";
  panel.dataset.site = site.id;
  panel.id = `site-panel-${site.id}`;

  const listId = !currentSite && site.id === "youtube" ? "features-list" : "";
  panel.innerHTML = `
    <div class="site-accordion-bar">
      <button class="site-accordion-toggle" type="button" aria-expanded="${expanded}">
        <span class="site-heading-icon" aria-hidden="true">${iconMarkup(site.icon)}</span>
        <div class="site-accordion-copy">
          <h2>${site.title}</h2>
          <p>${features.length ? `${features.length} mods` : "Coming soon"}</p>
        </div>
        <span class="category-chevron" aria-hidden="true"></span>
      </button>
      <div class="heading-actions">
        <span class="feature-count" data-site-count="${site.id}"${site.id === "youtube" && !currentSite ? ` id="feature-count"` : ""}>${siteCountLabel(site.id)}</span>
        ${
          features.length
            ? renderSwitch({
                ariaLabel: `Enable ${site.title}`,
                checked: isSiteEnabled(site.id),
                inputAttrs: `data-site-enable="${site.id}"${site.id === "youtube" && !currentSite ? ` id="master-toggle"` : ""}`,
              })
            : ""
        }
      </div>
    </div>
    <div class="category-expansion${expanded ? " is-open" : ""}">
      <div class="category-expansion-inner">
        <div class="site-panel-body${listId ? `" id="${listId}` : ""}"></div>
      </div>
    </div>
  `;

  const header = panel.querySelector(".site-accordion-toggle");
  const expansion = panel.querySelector(".category-expansion");
  const body = panel.querySelector(".site-panel-body");
  const enableInput = panel.querySelector("[data-site-enable]");
  if (enableInput) bindSiteEnableToggle(enableInput, site.id);

  header.addEventListener("click", () => {
    const willOpen = !expansion.classList.contains("is-open");
    expansion.classList.toggle("is-open", willOpen);
    header.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      collapsedOtherSites.delete(site.id);
      if (!body.dataset.rendered) {
        renderCategoryList(body, site.id);
        body.dataset.rendered = "true";
      }
    } else {
      collapsedOtherSites.add(site.id);
    }
  });

  if (expanded) {
    renderCategoryList(body, site.id);
    body.dataset.rendered = "true";
  }

  return panel;
}

function renderOtherSites() {
  otherSitesList.innerHTML = "";
  setTitledIcon(otherSitesTitle, "ui-globe", currentSite ? "Other sites" : "Sites");

  const others = SITE_META.filter((site) => site.id !== currentSite?.id);
  for (const site of others) {
    collapsedOtherSites.add(site.id);
    otherSitesList.appendChild(renderOtherSitePanel(site, false));
  }
}

function scrollToSite(siteId) {
  const panel = document.getElementById(`site-panel-${siteId}`);
  if (!panel) return;

  const header = panel.querySelector(".site-accordion-toggle");
  const expansion = panel.querySelector(".category-expansion");
  if (header && expansion && !expansion.classList.contains("is-open")) {
    header.click();
  }

  requestAnimationFrame(() => {
    const headerHeight = document.querySelector(".app-header")?.offsetHeight ?? 0;
    const top = panel.getBoundingClientRect().top + appEl.scrollTop - headerHeight - 6;
    appEl.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  });
}

function renderSiteRail() {
  siteRail.innerHTML = "";
  for (const site of SITE_META) {
    const isCurrent = currentSite?.id === site.id;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `site-chip${isCurrent ? " is-current" : ""}`;
    chip.dataset.site = site.id;
    chip.title = isCurrent ? `${site.title} — on this page` : `Show ${site.title} mods`;
    chip.innerHTML = `
      <span class="site-chip-icon" aria-hidden="true">${iconMarkup(site.icon)}</span>
      <span class="site-chip-name">${site.title}</span>
      ${isCurrent ? `<span class="site-chip-dot" aria-hidden="true"></span>` : ""}
    `;
    chip.addEventListener("click", () => scrollToSite(site.id));
    siteRail.appendChild(chip);
  }
}

function updateMasterState(siteId) {
  updateFeatureCount();
  const siteEnabled = isSiteEnabled(siteId);

  document.querySelectorAll(`[data-site-enable="${siteId}"]`).forEach((input) => {
    input.checked = siteEnabled;
  });

  for (const feature of featuresForSite(siteId)) {
    const card = document.querySelector(`.feature-card[data-feature="${feature.id}"]`);
    if (!card) continue;

    const featureEnabled = settings.features[feature.id] !== false;
    card.classList.toggle("disabled", !siteEnabled);
    const featureInput = card.querySelector("input[data-feature]");
    if (featureInput) featureInput.disabled = !siteEnabled;
    card
      .querySelector(".feature-expansion")
      ?.classList.toggle("is-open", siteEnabled && featureEnabled);

    const featureSettings = getFeatureSubsettings(feature);
    card.querySelectorAll("[data-subsetting]").forEach((control) => {
      const sub = feature.subsettings?.find(
        (item) => item.id === control.dataset.subsetting
      );
      const active = sub ? isSubsettingActive(sub, featureSettings) : true;
      control.disabled = !siteEnabled || !featureEnabled || !active;
      control
        .closest(".subsetting-row")
        ?.classList.toggle("disabled", control.disabled);
    });
  }
}

function updateReloadButton() {
  const canReload = Boolean(currentSite && activeTab?.id);
  reloadBtn.disabled = !canReload;
  reloadBtn.title = canReload ? `Reload ${currentSite.title}` : "Open a supported site to reload it";
}

function setThemeTogglePressed(enabled) {
  themeToggle.setAttribute("aria-pressed", String(enabled));
  themeToggle.classList.toggle("is-dark", enabled);
}

async function updateThemeToggle() {
  const host = chromodsDarkHostFromUrl(activeTab?.url || "");
  if (!host || !activeTab?.id) {
    setThemeTogglePressed(false);
    themeToggle.disabled = true;
    themeToggle.title = "Dark mode is unavailable on this page";
    themeToggle.setAttribute("aria-label", "Force dark mode");
    return;
  }

  const sites = await chromodsGetDarkSites();
  const enabled = chromodsIsDarkHostEnabled(sites, host);
  themeToggle.disabled = false;
  setThemeTogglePressed(enabled);
  themeToggle.title = enabled
    ? `Dark mode on for ${host} — click for light`
    : `Force dark mode on ${host}`;
  themeToggle.setAttribute(
    "aria-label",
    enabled ? `Turn off dark mode for ${host}` : `Force dark mode on ${host}`
  );
}

async function ensureDarkModeScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: CHROMODS_DARK_PING });
    return true;
  } catch {
    let already = false;
    try {
      const [probe] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => Boolean(globalThis.__chromodsDarkReady),
      });
      already = Boolean(probe?.result);
    } catch {
      /* restricted pages reject executeScript */
    }
    if (already) {
      try {
        await chrome.tabs.sendMessage(tabId, { type: CHROMODS_DARK_PING });
        return true;
      } catch {
        return false;
      }
    }
    const isolatedFiles = [
      "scripts/dark-chrome-guard.js",
      "scripts/vendor/darkreader.js",
      "scripts/dark-sites.js",
      "scripts/dark-mode.js",
      "scripts/sites.js",
      "scripts/shortcuts.js",
    ];
    try {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ["scripts/dark-proxy.js"],
        world: "MAIN",
        injectImmediately: true,
      });
    } catch {
      /* MAIN-world inject can fail on some child frames */
    }
    try {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: isolatedFiles,
        injectImmediately: true,
      });
    } catch {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: isolatedFiles,
          injectImmediately: true,
        });
      } catch {
        return false;
      }
    }
    try {
      await chrome.tabs.sendMessage(tabId, { type: CHROMODS_DARK_PING });
      return true;
    } catch {
      return false;
    }
  }
}

async function captureVisibleTab(tab) {
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

function activeDarkHost() {
  return chromodsDarkHostFromUrl(activeTab?.url || "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function highlightMatch(text, query) {
  const escaped = escapeHtml(text);
  const needle = query.trim();
  if (!needle) return escaped;
  const re = new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return escaped.replace(re, "<mark>$1</mark>");
}

function buildSearchIndex() {
  const items = [];
  for (const site of SITE_META) {
    const hosts = (site.hostnames || []).join(" ");
    items.push({
      type: "site",
      siteId: site.id,
      title: site.title,
      meta: hosts || site.id,
      haystack: `${site.title} ${site.id} ${hosts}`.toLowerCase(),
    });
    for (const feature of featuresForSite(site.id)) {
      items.push({
        type: "mod",
        siteId: site.id,
        featureId: feature.id,
        title: feature.title,
        meta: `${site.title} · ${feature.description}`,
        haystack: `${site.title} ${feature.title} ${feature.description} ${feature.id}`.toLowerCase(),
      });
    }
  }
  return items;
}

function stampStaticIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    if (el.querySelector("svg")) return;
    const markup = iconMarkup(el.dataset.icon);
    if (markup) el.insertAdjacentHTML("afterbegin", markup);
  });
}

function setTitledIcon(el, icon, text) {
  if (!el) return;
  el.replaceChildren();
  el.dataset.icon = icon;
  el.insertAdjacentHTML("afterbegin", iconMarkup(icon));
  el.append(text);
}

function setSearchFocused(on) {
  const wrap = document.querySelector(".search-wrap");
  const headerTop = document.querySelector(".header-top");
  if (wrap) {
    if (on && headerTop) {
      const lift = Math.max(0, headerTop.offsetHeight - 30);
      wrap.style.setProperty("--search-lift", `${-lift}px`);
    } else {
      wrap.style.setProperty("--search-lift", "0px");
    }
  }
  shellEl.classList.toggle("is-search-focused", Boolean(on));
}

function clearSearchResults() {
  searchActiveIndex = -1;
  searchResults.hidden = true;
  searchResults.innerHTML = "";
  if (document.activeElement !== searchInput) setSearchFocused(false);
}

function clearSearch() {
  searchInput.value = "";
  clearSearchResults();
}

function currentSearchItems() {
  return [...searchResults.querySelectorAll(".search-result")];
}

function setSearchActiveIndex(index) {
  const items = currentSearchItems();
  if (!items.length) {
    searchActiveIndex = -1;
    return;
  }
  searchActiveIndex = (index + items.length) % items.length;
  items.forEach((item, i) => item.classList.toggle("is-active", i === searchActiveIndex));
  items[searchActiveIndex]?.scrollIntoView({ block: "nearest" });
}

function renderSearchResults(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    clearSearchResults();
    return;
  }

  const matches = buildSearchIndex().filter((item) => item.haystack.includes(needle)).slice(0, 14);
  searchResults.hidden = false;
  if (!matches.length) {
    searchResults.innerHTML = `<p class="search-empty">No matching sites or mods</p>`;
    searchActiveIndex = -1;
    return;
  }

  searchResults.innerHTML = matches
    .map((item) => {
      const icon = iconMarkup(SITE_BY_ID[item.siteId]?.icon);
      const attrs =
        item.type === "mod"
          ? `data-type="mod" data-site="${item.siteId}" data-feature="${item.featureId}"`
          : `data-type="site" data-site="${item.siteId}"`;
      return `
        <button class="search-result" type="button" role="option" ${attrs}>
          <span class="search-result-icon" aria-hidden="true">${icon}</span>
          <span class="search-result-copy">
            <span class="search-result-title">${highlightMatch(item.title, query)}</span>
            <span class="search-result-meta">${highlightMatch(item.meta, query)}</span>
          </span>
        </button>
      `;
    })
    .join("");
  setSearchActiveIndex(0);
}

function revealFeature(siteId, featureId) {
  scrollToSite(siteId);
  const tryHighlight = (attempt = 0) => {
    const card = document.querySelector(`.feature-card[data-feature="${featureId}"]`);
    if (!card) {
      if (attempt < 10) requestAnimationFrame(() => tryHighlight(attempt + 1));
      return;
    }
    const section = card.closest(".category-section");
    const expansion = section?.querySelector(".category-expansion");
    const header = section?.querySelector(".category-header");
    if (expansion && !expansion.classList.contains("is-open")) header?.click();
    card.classList.add("is-search-hit");
    clearTimeout(searchHitTimer);
    searchHitTimer = window.setTimeout(() => card.classList.remove("is-search-hit"), 1600);
    const headerHeight = document.querySelector(".app-header")?.offsetHeight ?? 0;
    const top = card.getBoundingClientRect().top + appEl.scrollTop - headerHeight - 8;
    appEl.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };
  requestAnimationFrame(() => tryHighlight());
}

function activateSearchResult(button) {
  if (!button) return;
  const siteId = button.dataset.site;
  const featureId = button.dataset.feature;
  clearSearch();
  searchInput.blur();
  setSearchFocused(false);
  if (featureId) revealFeature(siteId, featureId);
  else scrollToSite(siteId);
}

function isSettingsOpen() {
  return shellEl.classList.contains("is-settings-open");
}

async function setSettingsOpen(open) {
  if (open === isSettingsOpen()) {
    if (open) await renderSettings();
    return;
  }
  if (open) {
    setSearchFocused(false);
    await renderSettings();
    settingsView.setAttribute("aria-hidden", "false");
    settingsOpenBtn.setAttribute("aria-expanded", "true");
    void settingsView.offsetWidth;
    shellEl.classList.add("is-settings-open");
    return;
  }
  stopShortcutRecording();
  shellEl.classList.remove("is-settings-open");
  settingsView.setAttribute("aria-hidden", "true");
  settingsOpenBtn.setAttribute("aria-expanded", "false");
  settingsOpenBtn.focus({ preventScroll: true });
}

function readDarkConfigFromUi() {
  const values = {};
  for (const slider of CHROMODS_DARK_SLIDERS) {
    const input = darkSliders.querySelector(`[data-dark-slider="${slider.id}"]`);
    values[slider.id] = Number(input?.value);
  }
  return chromodsNormalizeDarkSite({
    enabled: darkSiteToggle.checked,
    styleSystemControls: darkSystemControls.checked,
    skipNativeDark: darkSkipNative.checked,
    ...values,
  });
}

function sendDarkThemeMessage(tabId, config, enabled) {
  try {
    const sent = chrome.tabs.sendMessage(tabId, {
      type: CHROMODS_DARK_THEME_UPDATE,
      config,
      enabled,
    });
    if (sent && typeof sent.catch === "function") sent.catch(() => {});
  } catch {
    /* page may not have the script yet */
  }
}

async function pushDarkThemeToTab(host, config) {
  if (!host || !activeTab?.id) return;
  if (host !== chromodsDarkHostFromUrl(activeTab.url)) return;
  const next = config || readDarkConfigFromUi();
  const enabled = next.enabled !== false;
  const tabId = activeTab.id;
  if (!darkScriptReady) darkScriptReady = await ensureDarkModeScript(tabId);
  if (darkScriptReady) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (siteConfig, isEnabled) => {
          globalThis.__chromodsApplyDarkTheme?.(siteConfig, isEnabled);
        },
        args: [next, enabled],
      });
      return;
    } catch {
      /* fall through to a runtime message */
    }
  }
  sendDarkThemeMessage(tabId, next, enabled);
}

function queueDarkThemeSave(host) {
  if (!host) return;
  if (!darkThemePushFrame) {
    darkThemePushFrame = requestAnimationFrame(() => {
      darkThemePushFrame = 0;
      pushDarkThemeToTab(host, readDarkConfigFromUi());
    });
  }
  clearTimeout(darkThemeSaveTimer);
  darkThemeSaveTimer = window.setTimeout(() => {
    const config = readDarkConfigFromUi();
    chromodsSetDarkSiteTheme(host, {
      brightness: config.brightness,
      contrast: config.contrast,
      sepia: config.sepia,
      grayscale: config.grayscale,
      styleSystemControls: config.styleSystemControls,
      skipNativeDark: config.skipNativeDark,
    }).catch(() => {});
  }, 80);
}

function popupPlatform() {
  return navigator.userAgentData?.platform || navigator.platform || "";
}

async function sendUpdateMessage(message) {
  try {
    const response = await chrome.runtime.sendMessage(message);
    if (response?.ok && response.state) return chromodsNormalizeUpdateState(response.state);
  } catch {
    /* the service worker can be missing on a freshly reloaded install */
  }
  return null;
}

async function loadUpdateState() {
  try {
    updateState = await chromodsGetUpdateState();
  } catch {
    updateState = chromodsNormalizeUpdateState(null);
  }
  return updateState;
}

async function loadInstallType() {
  try {
    installType = await chromodsInstallType();
  } catch {
    installType = "unknown";
  }
  return installType;
}

function renderVersionPill() {
  if (!versionPill) return;
  const available = chromodsUpdateAvailable(updateState);
  versionPill.textContent = `v${updateState.currentVersion}`;
  versionPill.classList.toggle("has-update", available);
  versionPill.title = available
    ? `Update available — v${updateState.latestVersion}`
    : "Version — open update settings";
}

function renderUpdateCard() {
  if (!updateSection) return;

  const available = chromodsUpdateAvailable(updateState);
  const dismissed = available && !chromodsUpdateNoticeVisible(updateState);
  const fromStore = chromodsStoreInstall(installType);
  const canApply =
    available &&
    !dismissed &&
    !fromStore &&
    Boolean(updateState.downloadUrl) &&
    chromodsIsAllowedUpdateUrl(updateState.downloadUrl);

  updateSection.classList.toggle("has-update", available);
  updateDot.classList.toggle("is-available", available);
  updateDot.classList.toggle("is-error", Boolean(updateState.error) && !available);
  updateHeadline.textContent = available
    ? `Update available — v${updateState.latestVersion}`
    : `ChroMods v${updateState.currentVersion}`;

  if (updateLead) {
    updateLead.textContent = fromStore
      ? "Chrome Web Store builds update themselves. Check now asks Chrome to look again."
      : "Styles already ship inside ChroMods. When a new version is published, apply it here — no terminal required.";
  }

  const checked = `checked ${chromodsUpdateRelativeTime(updateState.checkedAt)}`;
  if (updateState.error) {
    updateStatus.textContent = `Couldn't check — ${updateState.error}.`;
  } else if (dismissed) {
    updateStatus.textContent = `You're on v${updateState.currentVersion}. Hidden until you check again.`;
  } else if (available) {
    updateStatus.textContent = `You're on v${updateState.currentVersion}, ${checked}.`;
  } else if (updateState.checkedAt) {
    updateStatus.textContent = `Up to date, ${checked}.`;
  } else {
    updateStatus.textContent = "Not checked yet.";
  }

  if (updateFoot) {
    updateFoot.textContent = fromStore
      ? "Chrome installs updates in the background. Reloading applies one if it is already waiting."
      : canApply
        ? "Apply downloads the release into the folder you loaded unpacked, then reloads your themed tabs."
        : "Reloading re-reads the folder from disk and refreshes your themed tabs.";
  }

  /* Reloading is useful whether or not an update is pending, so the actions
     row stays put and only the instructions come and go. */
  updateNotesLink.hidden = !available || !updateState.url;
  updateNotesLink.textContent = updateState.source === "release" ? "What's new" : "See commits";
  updateDismissBtn.hidden = !available || dismissed;
  if (updateApplyBtn) {
    updateApplyBtn.hidden = !canApply;
    if (canApply) {
      setTitledIcon(updateApplyBtn, "ui-update", `Apply v${updateState.latestVersion}`);
    }
  }
  if (updateApplyHint) {
    updateApplyHint.hidden = fromStore;
    if (!fromStore && !chromodsCanPickUpdateFolder()) {
      updateApplyHint.textContent =
        "This browser can't grant folder access. Use the terminal fallback below, then Reload ChroMods.";
    }
  }

  updateDetails.hidden = !available || dismissed;
  if (updateDetails.hidden) return;

  const lines = chromodsUpdateNoteLines(updateState.notes);
  updateNotes.hidden = lines.length === 0;
  updateNotes.innerHTML = lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  updateCommandText.textContent = chromodsInstallCommand(popupPlatform());
  updateGitCommand.textContent = chromodsUpdateCommand(popupPlatform());
  updateDownloadBtn.hidden = !updateState.downloadUrl;
  updateDownloadBtn.textContent = `download v${updateState.latestVersion}`;
}

function renderUpdates() {
  renderUpdateCard();
  renderVersionPill();
}

async function runUpdateCheck({ force = false } = {}) {
  if (updateCheckBtn.disabled) return;
  updateCheckBtn.disabled = true;
  if (force) updateCheckBtn.textContent = "Checking…";

  if (force && chromodsStoreInstall(installType) && chrome.runtime.requestUpdateCheck) {
    try {
      chrome.runtime.requestUpdateCheck(() => {});
    } catch {
      /* unpacked installs throw; GitHub remains the source of truth */
    }
  }

  const next =
    (await sendUpdateMessage({ type: CHROMODS_UPDATE_CHECK, force })) ??
    (await chromodsCheckForUpdate({ force }).catch(() => null));
  if (next) updateState = next;
  else await loadUpdateState();

  /* Asking explicitly means the user wants to see it again. */
  if (force && updateState.dismissedVersion) {
    updateState = await chromodsSetUpdateState({ ...updateState, dismissedVersion: null });
    await chromodsApplyUpdateBadge(updateState);
  }

  updateCheckBtn.disabled = false;
  updateCheckBtn.textContent = "Check now";
  renderUpdates();
}

async function dismissUpdate() {
  const next =
    (await sendUpdateMessage({ type: CHROMODS_UPDATE_DISMISS })) ??
    (await chromodsDismissUpdate().catch(() => null));
  if (next) updateState = next;
  else await loadUpdateState();
  renderUpdates();
}

async function copyUpdateCommand() {
  try {
    await navigator.clipboard.writeText(updateCommandText.textContent.trim());
    updateCopyBtn.textContent = "Copied";
  } catch {
    updateCopyBtn.textContent = "Copy failed";
  }
  clearTimeout(updateCopyTimer);
  updateCopyTimer = window.setTimeout(() => {
    updateCopyBtn.textContent = "Copy";
  }, 1600);
}

async function openUpdateLink(url) {
  if (!url) return;
  await chrome.tabs.create({ url });
  window.close();
}

/* The request is parked in storage before the reload because this popup does
   not survive it — the restarted service worker refreshes the tabs. */
async function reloadExtension() {
  updateReloadBtn.disabled = true;
  updateReloadBtn.textContent = "Reloading…";
  try {
    await chromodsRequestExtensionReload({ refreshTabs: true });
  } catch {
    chrome.runtime.reload();
  }
}

async function openApplyUpdate() {
  if (!updateApplyBtn || updateApplyBtn.hidden || updateApplyBtn.disabled) return;
  updateApplyBtn.disabled = true;
  try {
    await chromodsOpenApplyPage();
    window.close();
  } catch {
    updateApplyBtn.disabled = false;
    setTitledIcon(updateApplyBtn, "ui-update", "Couldn't open");
  }
}

function bindUpdateControls() {
  updateCheckBtn.addEventListener("click", () => runUpdateCheck({ force: true }));
  updateCopyBtn.addEventListener("click", copyUpdateCommand);
  updateDownloadBtn.addEventListener("click", () => openUpdateLink(updateState.downloadUrl));
  updateNotesLink.addEventListener("click", () => openUpdateLink(updateState.url));
  updateDismissBtn.addEventListener("click", dismissUpdate);
  updateApplyBtn?.addEventListener("click", openApplyUpdate);
  updateReloadBtn.addEventListener("click", reloadExtension);
  updateExtensionsBtn.addEventListener("click", () => openUpdateLink(CHROMODS_EXTENSIONS_URL));
  shortcutsPageBtn?.addEventListener("click", () => openUpdateLink(CHROMODS_SHORTCUTS_URL));
  versionPill?.addEventListener("click", () => setSettingsOpen(true));

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[CHROMODS_UPDATE_KEY]) return;
    updateState = chromodsNormalizeUpdateState(changes[CHROMODS_UPDATE_KEY].newValue);
    renderUpdates();
  });
}

function stopShortcutRecording() {
  recordingShortcutId = null;
  shortcutList?.querySelectorAll(".shortcut-bind").forEach((button) => {
    button.classList.remove("is-recording");
    button.textContent = chromodsShortcutLabel(shortcutState[button.dataset.shortcut]);
  });
}

function renderShortcutList() {
  shortcutList.innerHTML = CHROMODS_SHORTCUT_ACTIONS.map((action) => {
    const label = chromodsShortcutLabel(shortcutState[action.id]);
    return `
      <div class="shortcut-row">
        <span class="shortcut-icon" aria-hidden="true">${iconMarkup(action.icon)}</span>
        <div class="shortcut-copy">
          <h3>${action.title}</h3>
          <p>${action.description}</p>
        </div>
        <button class="shortcut-bind" type="button" data-shortcut="${action.id}">${label}</button>
      </div>
    `;
  }).join("");

  shortcutList.querySelectorAll(".shortcut-bind").forEach((button) => {
    button.addEventListener("click", () => {
      const actionId = button.dataset.shortcut;
      if (recordingShortcutId === actionId) {
        stopShortcutRecording();
        return;
      }
      stopShortcutRecording();
      recordingShortcutId = actionId;
      button.classList.add("is-recording");
      button.textContent = "Press keys…";
      button.focus();
    });
  });
}

async function handleShortcutCapture(event) {
  if (!recordingShortcutId) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.key === "Escape") {
    stopShortcutRecording();
    return;
  }
  if (event.key === "Backspace" || event.key === "Delete") {
    shortcutState = await chromodsSetShortcut(recordingShortcutId, null);
    stopShortcutRecording();
    renderShortcutList();
    return;
  }
  const next = chromodsShortcutFromEvent(event);
  if (!next) return;
  for (const action of CHROMODS_SHORTCUT_ACTIONS) {
    if (action.id !== recordingShortcutId && chromodsShortcutsEqual(shortcutState[action.id], next)) {
      await chromodsSetShortcut(action.id, null);
    }
  }
  shortcutState = await chromodsSetShortcut(recordingShortcutId, next);
  stopShortcutRecording();
  renderShortcutList();
}

function renderDarkSliders(config, enabled) {
  darkSliders.innerHTML = CHROMODS_DARK_SLIDERS.map((slider) => {
    const value = config[slider.id];
    return `
      <div class="dark-slider-row">
        <label for="dark-${slider.id}">
          <span class="dark-slider-icon" aria-hidden="true">${iconMarkup(slider.icon)}</span>
          ${slider.label}
        </label>
        <input
          id="dark-${slider.id}"
          type="range"
          min="${slider.min}"
          max="${slider.max}"
          value="${value}"
          data-dark-slider="${slider.id}"
          ${enabled ? "" : "disabled"}
        />
        <span class="dark-slider-value" data-dark-value="${slider.id}">${value}</span>
      </div>
    `;
  }).join("");

  darkSliders.querySelectorAll("[data-dark-slider]").forEach((input) => {
    input.addEventListener("input", () => {
      const host = darkSettingsHost;
      if (!host) return;
      const id = input.dataset.darkSlider;
      const valueLabel = darkSliders.querySelector(`[data-dark-value="${id}"]`);
      if (valueLabel) valueLabel.textContent = String(input.value);
      queueDarkThemeSave(host);
    });
  });
}

async function renderDarkSettings() {
  const sites = await chromodsGetDarkSites();
  if (!darkSettingsHost) darkSettingsHost = activeDarkHost();
  const host = darkSettingsHost;
  const config = host ? chromodsDarkSiteConfig(sites, host) : chromodsNormalizeDarkSite();
  const canEdit = Boolean(host);

  darkSiteTitle.textContent = host ? host : "This site";
  darkSiteHost.textContent = host
    ? "Brightness, contrast, sepia, and grayscale apply only here."
    : "Open a website to configure dark mode for it.";
  darkSiteToggle.disabled = !canEdit;
  darkSiteToggle.checked = Boolean(host && config.enabled);
  darkSystemControls.disabled = !canEdit;
  darkSystemControls.checked = config.styleSystemControls;
  darkSkipNative.disabled = !canEdit;
  darkSkipNative.checked = config.skipNativeDark;
  renderDarkSliders(config, canEdit);

  const enabledHosts = chromodsDarkEnabledHosts(sites);
  darkSiteListWrap.hidden = enabledHosts.length === 0;
  darkSiteList.innerHTML = enabledHosts
    .map(
      (item) => `
        <button class="dark-site-item${item === host ? " is-active" : ""}" type="button" data-dark-host="${item}">
          <span class="ui-icon" aria-hidden="true">${iconMarkup("ui-globe")}</span>
          <span class="dark-site-item-name">${item}</span>
        </button>
      `
    )
    .join("");
  darkSiteList.querySelectorAll("[data-dark-host]").forEach((button) => {
    button.addEventListener("click", () => {
      darkSettingsHost = button.dataset.darkHost;
      renderDarkSettings();
    });
  });
}

async function renderSettings() {
  shortcutState = await chromodsGetShortcuts();
  if (!darkSettingsHost) darkSettingsHost = activeDarkHost();
  renderUpdates();
  runUpdateCheck();
  renderShortcutList();
  await renderDarkSettings();
  if (activeTab?.id && activeDarkHost()) {
    darkScriptReady = await ensureDarkModeScript(activeTab.id);
  }
}

async function applyDarkOnActiveTab(enabled) {
  const host = activeDarkHost();
  if (!host || !activeTab?.id) return false;
  const injected = await ensureDarkModeScript(activeTab.id);
  if (!injected) return false;
  if (host === chromodsDarkHostFromUrl(activeTab.url)) {
    const screenshot = await captureVisibleTab(activeTab);
    if (screenshot) {
      try {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: CHROMODS_DARK_WIPE,
          enabled,
          screenshot,
        });
      } catch {
        /* storage apply still runs */
      }
    }
  }
  return true;
}

function bindControls() {
  reloadBtn.addEventListener("click", async () => {
    if (!activeTab?.id || !currentSite) return;
    await chrome.tabs.reload(activeTab.id);
    window.close();
  });

  themeToggle.addEventListener("click", async () => {
    const host = chromodsDarkHostFromUrl(activeTab?.url || "");
    if (!host || !activeTab?.id || themeToggle.disabled) return;

    const next = themeToggle.getAttribute("aria-pressed") !== "true";
    setThemeTogglePressed(next);
    themeToggle.disabled = true;

    try {
      const [injected, screenshot] = await Promise.all([
        ensureDarkModeScript(activeTab.id),
        captureVisibleTab(activeTab),
      ]);
      if (!injected) {
        setThemeTogglePressed(!next);
        themeToggle.title = "Can't inject dark mode on this page";
        return;
      }
      if (screenshot) {
        try {
          await chrome.tabs.sendMessage(activeTab.id, {
            type: CHROMODS_DARK_WIPE,
            enabled: next,
            screenshot,
          });
        } catch {
          /* storage apply below still runs */
        }
      }
      await chromodsSetDarkSite(host, next);
    } finally {
      await updateThemeToggle();
      if (isSettingsOpen()) await renderDarkSettings();
    }
  });

  settingsOpenBtn.addEventListener("click", () => setSettingsOpen(true));
  settingsBackBtn.addEventListener("click", () => setSettingsOpen(false));
  bindUpdateControls();

  searchInput.addEventListener("focus", () => setSearchFocused(true));
  searchInput.addEventListener("blur", () => {
    requestAnimationFrame(() => {
      if (document.activeElement === searchInput) return;
      if (!searchResults.hidden) return;
      setSearchFocused(false);
    });
  });
  searchInput.addEventListener("input", () => {
    setSearchFocused(true);
    renderSearchResults(searchInput.value);
  });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchActiveIndex(searchActiveIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchActiveIndex(searchActiveIndex - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      activateSearchResult(currentSearchItems()[Math.max(0, searchActiveIndex)]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      clearSearch();
      searchInput.blur();
    }
  });
  searchResults.addEventListener("mousedown", (event) => {
    const button = event.target.closest(".search-result");
    if (button) {
      event.preventDefault();
      activateSearchResult(button);
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrap")) clearSearchResults();
  });

  darkSiteToggle.addEventListener("change", async () => {
    const host = darkSettingsHost;
    if (!host) return;
    const next = darkSiteToggle.checked;
    if (host === activeDarkHost() && activeTab?.id) {
      setThemeTogglePressed(next);
      const ok = await applyDarkOnActiveTab(next);
      if (!ok) {
        darkSiteToggle.checked = !next;
        await updateThemeToggle();
        return;
      }
    }
    await chromodsSetDarkSite(host, next);
    await updateThemeToggle();
    await renderDarkSettings();
  });

  darkSystemControls.addEventListener("change", () => {
    if (!darkSettingsHost) return;
    queueDarkThemeSave(darkSettingsHost);
  });

  darkSkipNative.addEventListener("change", () => {
    if (!darkSettingsHost) return;
    queueDarkThemeSave(darkSettingsHost);
  });

  document.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || event.defaultPrevented) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (event.target.closest("input, textarea, select")) return;

      const root = isSettingsOpen() ? settingsView : appEl;
      if (!root) return;
      let node = event.target.nodeType === 1 ? event.target : event.target.parentElement;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        const canY =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight + 1;
        const canX =
          (style.overflowX === "auto" || style.overflowX === "scroll") &&
          node.scrollWidth > node.clientWidth + 1;
        if (canY) {
          const atTop = node.scrollTop <= 0 && event.deltaY < 0;
          const atBottom =
            node.scrollTop + node.clientHeight >= node.scrollHeight - 1 && event.deltaY > 0;
          if ((atTop || atBottom) && node !== root) {
            event.preventDefault();
            root.scrollTop += event.deltaY;
          }
          return;
        }
        if (canX) {
          event.preventDefault();
          root.scrollTop += event.deltaY;
          return;
        }
        node = node.parentElement;
      }
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (recordingShortcutId) {
      handleShortcutCapture(event);
      return;
    }
    if (event.key !== "Escape") return;
    if (isSettingsOpen()) {
      event.preventDefault();
      setSettingsOpen(false);
    }
  });
}

function renderPopup() {
  renderSiteRail();
  renderCurrentPane();
  renderOtherSites();
  updateReloadButton();
  updateFeatureCount();
  updateThemeToggle();
}

async function init() {
  stampStaticIcons();
  await Promise.all([loadUpdateState(), loadInstallType()]);
  renderUpdates();
  await loadSettings();
  shortcutState = await chromodsGetShortcuts();
  await detectActiveTab();
  darkSettingsHost = activeDarkHost();
  bindControls();
  renderPopup();
}

init();
