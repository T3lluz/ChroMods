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
];

const FEATURE_BY_ID = Object.fromEntries(FEATURE_META.map((feature) => [feature.id, feature]));

const DEFAULT_SETTINGS = {
  enabled: true,
  features: Object.fromEntries(
    FEATURE_META.map((feature) => [feature.id, feature.defaultEnabled !== false])
  ),
  subsettings: {
    theater: { ...DEFAULT_THEATER },
    feed: { ...DEFAULT_FEED },
  },
};

const masterToggle = document.getElementById("master-toggle");
const featuresList = document.getElementById("features-list");
const reloadBtn = document.getElementById("reload");
const featureCount = document.getElementById("feature-count");
const versionPill = document.getElementById("version-pill");

let settings = structuredClone(DEFAULT_SETTINGS);
const collapsedCategories = new Set();

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

async function loadSettings() {
  const stored = await chrome.storage.sync.get("youtubeThemingSettings");
  const storedSettings = stored.youtubeThemingSettings;
  settings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    features: mergeFeatureSettings(storedSettings?.features),
    subsettings: {
      theater: migrateTheater(storedSettings?.subsettings?.theater),
      feed: {
        ...DEFAULT_FEED,
        ...(storedSettings?.subsettings?.feed || {}),
      },
    },
  };

  if (JSON.stringify(settings) !== JSON.stringify(storedSettings)) {
    await chrome.storage.sync.set({ youtubeThemingSettings: settings });
  }
}

async function saveSettings() {
  await chrome.storage.sync.set({ youtubeThemingSettings: settings });
}

const YOUTUBE_URLS = ["*://*.youtube.com/*", "*://youtube.com/*"];

function updateFeatureCount() {
  if (!featureCount) return;
  const total = FEATURE_META.length;
  const enabled = settings.enabled
    ? FEATURE_META.filter((feature) => settings.features[feature.id] !== false).length
    : 0;
  featureCount.textContent = settings.enabled
    ? `${enabled} of ${total} enabled`
    : "All disabled";
}

function isSubsettingActive(sub, featureSettings) {
  if (!sub.dependsOn) return true;
  return featureSettings[sub.dependsOn] !== false;
}

function renderSubsettings(feature, featureSettings) {
  if (!feature.subsettings?.length) return "";

  const featureEnabled =
    settings.enabled && settings.features[feature.id] !== false;

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
          <label class="switch switch-sm" aria-label="${sub.title}">
            <input type="checkbox" data-subsetting="${sub.id}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
            <span class="slider"></span>
          </label>
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
          !settings.enabled || settings.features[feature.id] === false || !active;
        dependentControl.disabled = disabled;
        dependentControl.closest(".subsetting-row")?.classList.toggle("disabled", disabled);
      });
      await saveSettings();

    });
  });
}

function renderFeatureCard(feature) {
  const enabled = settings.features[feature.id] !== false;
  const featureSettings = getFeatureSubsettings(feature);
  const card = document.createElement("article");
  card.className = `feature-card${settings.enabled ? "" : " disabled"}`;
  card.dataset.feature = feature.id;

  card.innerHTML = `
    <div class="feature-header">
      <div class="feature-info">
        <h4>${feature.title}</h4>
        <p>${feature.description}</p>
      </div>
      <label class="switch" aria-label="${feature.title}">
        <input type="checkbox" data-feature="${feature.id}" ${enabled ? "checked" : ""} ${settings.enabled ? "" : "disabled"} />
        <span class="slider"></span>
      </label>
    </div>
    ${renderSubsettings(feature, featureSettings)}
  `;

  bindSubsettings(card, feature);
  return card;
}

function renderFeatures() {
  featuresList.innerHTML = "";
  updateFeatureCount();

  for (const category of CATEGORY_META) {
    const features = FEATURE_META.filter((feature) => feature.category === category.id);
    if (!features.length) continue;

    const section = document.createElement("section");
    section.className = "category-section";
    section.dataset.category = category.id;

    section.innerHTML = `
      <button class="category-header" type="button" aria-expanded="${!collapsedCategories.has(category.id)}">
        <span class="category-icon" aria-hidden="true">${iconMarkup(category.icon)}</span>
        <h3 class="category-title">${category.title}</h3>
        <span class="category-count">${features.length}</span>
        <span class="category-chevron" aria-hidden="true"></span>
      </button>
      <div class="category-expansion${collapsedCategories.has(category.id) ? "" : " is-open"}">
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
        collapsedCategories.delete(category.id);
      } else {
        collapsedCategories.add(category.id);
      }
    });

    featuresList.appendChild(section);
  }

  featuresList.querySelectorAll("input[data-feature]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const id = event.target.dataset.feature;
      const checked = event.target.checked;
      settings.features[id] = checked;
      const meta = FEATURE_BY_ID[id];

      if (checked && meta?.conflictsWith) {
        settings.features[meta.conflictsWith] = false;
      }

      updateFeatureCount();
      const card = event.target.closest(".feature-card");
      card
        ?.querySelector(".feature-expansion")
        ?.classList.toggle("is-open", checked && settings.enabled);
      card?.querySelectorAll("[data-subsetting]").forEach((control) => {
        const sub = meta?.subsettings?.find(
          (item) => item.id === control.dataset.subsetting
        );
        const active = sub ? isSubsettingActive(sub, getFeatureSubsettings(meta)) : true;
        control.disabled = !checked || !settings.enabled || !active;
        control
          .closest(".subsetting-row")
          ?.classList.toggle("disabled", control.disabled);
      });

      if (checked && meta?.conflictsWith) {
        const conflictingCard = featuresList.querySelector(
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

function updateMasterState() {
  updateFeatureCount();

  for (const feature of FEATURE_META) {
    const card = featuresList.querySelector(
      `.feature-card[data-feature="${feature.id}"]`
    );
    if (!card) continue;

    const featureEnabled = settings.features[feature.id] !== false;
    card.classList.toggle("disabled", !settings.enabled);
    const featureInput = card.querySelector("input[data-feature]");
    if (featureInput) featureInput.disabled = !settings.enabled;
    card
      .querySelector(".feature-expansion")
      ?.classList.toggle("is-open", settings.enabled && featureEnabled);

    const featureSettings = getFeatureSubsettings(feature);
    card.querySelectorAll("[data-subsetting]").forEach((control) => {
      const sub = feature.subsettings?.find(
        (item) => item.id === control.dataset.subsetting
      );
      const active = sub ? isSubsettingActive(sub, featureSettings) : true;
      control.disabled = !settings.enabled || !featureEnabled || !active;
      control
        .closest(".subsetting-row")
        ?.classList.toggle("disabled", control.disabled);
    });
  }
}

function bindControls() {
  masterToggle.checked = settings.enabled;
  masterToggle.addEventListener("change", async () => {
    settings.enabled = masterToggle.checked;
    updateMasterState();
    await saveSettings();
  });

  reloadBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
      url: YOUTUBE_URLS,
    });
    if (tab?.id) {
      await chrome.tabs.reload(tab.id);
      window.close();
    }
  });
}

async function init() {
  if (versionPill && chrome.runtime?.getManifest) {
    versionPill.textContent = `v${chrome.runtime.getManifest().version}`;
  }
  await loadSettings();
  bindControls();
  renderFeatures();
}

init();
