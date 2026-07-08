const DEFAULT_THEATER = {
  hideHeader: true,
  hoverComments: true,
  glassComments: true,
  commentsSide: "left",
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
    id: "glassComments",
    title: "Glass background",
    description: "Use a blurred glass effect for the comments panel.",
    type: "toggle",
    dependsOn: "hoverComments",
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
  },
  {
    id: "feed-layout",
    title: "Feed layout fix",
    description: "Restore a denser home feed grid and compact video cards.",
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
  },
};

const masterToggle = document.getElementById("master-toggle");
const featuresList = document.getElementById("features-list");
const reloadBtn = document.getElementById("reload");
const featureCount = document.getElementById("feature-count");
const versionPill = document.getElementById("version-pill");

let settings = structuredClone(DEFAULT_SETTINGS);

function getTheaterSettings() {
  return {
    ...DEFAULT_THEATER,
    ...(settings.subsettings?.theater || {}),
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
      theater: {
        ...DEFAULT_THEATER,
        ...(stored.youtubeThemingSettings?.subsettings?.theater || {}),
      },
    },
  };
}

async function saveSettings() {
  await chrome.storage.sync.set({ youtubeThemingSettings: settings });
  await notifyActiveTab();
}

async function notifyActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.includes("youtube.com")) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: "applySettings",
      settings,
    });
  } catch {
    // Content script may not be ready yet.
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

function isSubsettingActive(sub, theater) {
  if (!sub.dependsOn) return true;
  return theater[sub.dependsOn] !== false;
}

function renderSubsettings(feature, theater) {
  if (!feature.subsettings?.length) return "";

  const featureEnabled =
    settings.enabled && settings.features[feature.id] !== false;

  const rows = feature.subsettings
    .map((sub) => {
      const active = isSubsettingActive(sub, theater);
      const disabled = !featureEnabled || !active;

      if (sub.type === "select") {
        const options = sub.options
          .map(
            (opt) =>
              `<option value="${opt.value}" ${theater[sub.id] === opt.value ? "selected" : ""}>${opt.label}</option>`
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

      const checked = theater[sub.id] !== false;
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
  if (feature.id !== "theater-mode") return;

  card.querySelectorAll("[data-subsetting]").forEach((control) => {
    control.addEventListener("change", async (event) => {
      const id = event.target.dataset.subsetting;
      const theater = getTheaterSettings();

      if (event.target.type === "checkbox") {
        theater[id] = event.target.checked;

        if (id === "hoverComments" && !event.target.checked) {
          theater.glassComments = false;
        }
      } else {
        theater[id] = event.target.value;
      }

      settings.subsettings.theater = theater;
      renderFeatures();
      await saveSettings();
    });
  });
}

function renderFeatures() {
  featuresList.innerHTML = "";
  updateFeatureCount();

  const theater = getTheaterSettings();

  for (const feature of FEATURE_META) {
    const enabled = settings.features[feature.id] !== false;
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
      ${enabled && settings.enabled ? renderSubsettings(feature, theater) : ""}
    `;

    featuresList.appendChild(card);
    bindSubsettings(card, feature);
  }

  featuresList.querySelectorAll("input[data-feature]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const id = event.target.dataset.feature;
      settings.features[id] = event.target.checked;
      updateFeatureCount();
      renderFeatures();
      await saveSettings();
    });
  });
}

function bindControls() {
  masterToggle.checked = settings.enabled;
  masterToggle.addEventListener("change", async () => {
    settings.enabled = masterToggle.checked;
    renderFeatures();
    await saveSettings();
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
