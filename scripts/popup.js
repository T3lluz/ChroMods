const DEFAULT_THEATER = {
  hideHeader: true,
  headerBlur: false,
  hoverComments: true,
  commentsSide: "left",
};

const DEFAULT_FEED = {
  columns: "auto",
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
    description: "Restore a denser home feed grid and compact video cards.",
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
    description: "Drag, resize, and adjust live chat opacity in theater mode.",
    defaultEnabled: false,
    conflictsWith: "overlay-live-chat",
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
  },
};

const appEl = document.getElementById("app");
const siteRail = document.getElementById("site-rail");
const currentPane = document.getElementById("current-pane");
const otherSitesList = document.getElementById("other-sites-list");
const otherSitesTitle = document.getElementById("other-sites-title");
const reloadBtn = document.getElementById("reload");
const versionPill = document.getElementById("version-pill");
const themeToggle = document.getElementById("theme-toggle");

let settings = structuredClone(DEFAULT_SETTINGS);
let currentSite = null;
let activeTab = null;
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

function getFeatureSubsettings(feature) {
  const key = feature.subsettingsKey;
  if (!key) return {};

  if (key === "theater") {
    return migrateTheater(settings.subsettings?.theater);
  }

  return {
    ...DEFAULT_FEED,
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
  return `${enabled} of ${features.length} enabled`;
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
  otherSitesTitle.textContent = currentSite ? "Other sites" : "Sites";

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
    const isolatedFiles = [
      "scripts/dark-chrome-guard.js",
      "scripts/vendor/darkreader.js",
      "scripts/dark-sites.js",
      "scripts/dark-mode.js",
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
  if (versionPill && chrome.runtime?.getManifest) {
    versionPill.textContent = `v${chrome.runtime.getManifest().version}`;
  }
  await loadSettings();
  await detectActiveTab();
  bindControls();
  renderPopup();
}

init();
