const DEFAULT_THEATER = {
  hideHeader: true,
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

const FEATURE_META = [
  {
    id: "immersive-search",
    title: "Immersive search",
    description: "Smooth blur and zoom effect when focusing the search bar.",
  },
  {
    id: "theater-mode",
    title: "Theater mode",
    description: "Full-window theater view with configurable comments panel.",
    subsettings: THEATER_SUBSETTINGS,
    subsettingsKey: "theater",
  },
  {
    id: "feed-layout",
    title: "Feed layout fix",
    description: "Restore a denser home feed grid and compact video cards.",
    subsettings: FEED_SUBSETTINGS,
    subsettingsKey: "feed",
  },
  {
    id: "compact-sidebar",
    title: "Compact sidebar",
    description: "Icon-only guide sidebar with a cleaner, minimal layout.",
  },
];

const DEFAULT_SETTINGS = {
  enabled: true,
  features: Object.fromEntries(FEATURE_META.map((f) => [f.id, true])),
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

function getTheaterSettings() {
  return migrateTheater(settings.subsettings?.theater);
}

function getFeedSettings() {
  return {
    ...DEFAULT_FEED,
    ...(settings.subsettings?.feed || {}),
  };
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get("youtubeThemingSettings");
  settings = {
    ...DEFAULT_SETTINGS,
    ...stored.youtubeThemingSettings,
    features: {
      ...DEFAULT_SETTINGS.features,
      ...(stored.youtubeThemingSettings?.features || {}),
    },
    subsettings: {
      theater: migrateTheater(stored.youtubeThemingSettings?.subsettings?.theater),
      feed: {
        ...DEFAULT_FEED,
        ...(stored.youtubeThemingSettings?.subsettings?.feed || {}),
      },
    },
  };
}

async function saveSettings() {
  await chrome.storage.sync.set({ youtubeThemingSettings: settings });
  await notifyActiveTab();
}

const YOUTUBE_URLS = ["*://*.youtube.com/*", "*://youtube.com/*"];

async function getYouTubeTabs() {
  return chrome.tabs.query({ url: YOUTUBE_URLS });
}

async function getYouTubeTab() {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
    url: YOUTUBE_URLS,
  });
  if (activeTab?.id) return activeTab;

  const tabs = await getYouTubeTabs();
  return tabs[0] ?? null;
}

async function notifyAllYouTubeTabs() {
  const tabs = await getYouTubeTabs();
  await Promise.allSettled(
    tabs.map((tab) =>
      chrome.tabs.sendMessage(tab.id, {
        action: "applySettings",
        settings,
      })
    )
  );
}

async function notifyActiveTab() {
  await notifyAllYouTubeTabs();
}

async function showPageToast(text, isEnabled) {
  const tab = await getYouTubeTab();
  if (!tab?.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: "showToast",
      text,
      isEnabled,
    });
  } catch {
    const tabs = await getYouTubeTabs();
    await Promise.allSettled(
      tabs.map((t) =>
        chrome.tabs.sendMessage(t.id, {
          action: "showToast",
          text,
          isEnabled,
        })
      )
    );
  }
}

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

  return `<div class="subsettings">${rows}</div>`;
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
      renderFeatures();
      await saveSettings();

      const sub = feature.subsettings.find((item) => item.id === id);
      if (sub) {
        const value =
          event.target.type === "checkbox"
            ? event.target.checked
              ? "On"
              : "Off"
            : event.target.value;
        const isEnabled =
          event.target.type === "checkbox" ? event.target.checked : true;
        await showPageToast(`${feature.title} · ${sub.title}: ${value}`, isEnabled);
      }
    });
  });
}

function renderFeatures() {
  featuresList.innerHTML = "";
  updateFeatureCount();

  for (const feature of FEATURE_META) {
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
      ${enabled && settings.enabled ? renderSubsettings(feature, featureSettings) : ""}
    `;

    featuresList.appendChild(card);
    bindSubsettings(card, feature);
  }

  featuresList.querySelectorAll("input[data-feature]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const id = event.target.dataset.feature;
      const checked = event.target.checked;
      settings.features[id] = checked;
      updateFeatureCount();
      renderFeatures();
      await saveSettings();

      const meta = FEATURE_META.find((feature) => feature.id === id);
      if (meta) {
        await showPageToast(`${meta.title}: ${checked ? "On" : "Off"}`, checked);
      }
    });
  });
}

function bindControls() {
  masterToggle.checked = settings.enabled;
  masterToggle.addEventListener("change", async () => {
    settings.enabled = masterToggle.checked;
    renderFeatures();
    await saveSettings();
    await showPageToast(
      `YouTube Theming: ${masterToggle.checked ? "On" : "Off"}`,
      masterToggle.checked
    );
  });

  reloadBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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
