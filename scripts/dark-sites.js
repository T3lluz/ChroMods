const CHROMODS_DARK_STORAGE_KEY = "chroModsDarkMode";
const CHROMODS_DARK_PING = "chromods-dark-ping";
const CHROMODS_DARK_FETCH = "chromods-dark-fetch";
const CHROMODS_DARK_WIPE = "chromods-dark-wipe";
const CHROMODS_DARK_THEME_UPDATE = "chromods-dark-theme";

const CHROMODS_DARK_THEME = {
  mode: 1,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  darkSchemeBackgroundColor: "#181a1b",
  darkSchemeTextColor: "#e8e6e3",
  scrollbarColor: "auto",
  selectionColor: "auto",
  styleSystemControls: true,
  immediateModify: true,
};

const CHROMODS_DARK_SITE_DEFAULTS = {
  enabled: false,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  styleSystemControls: true,
  skipNativeDark: true,
};

const CHROMODS_DARK_SLIDERS = [
  { id: "brightness", label: "Brightness", icon: "dark-brightness", min: 50, max: 150 },
  { id: "contrast", label: "Contrast", icon: "dark-contrast", min: 50, max: 150 },
  { id: "sepia", label: "Sepia", icon: "dark-sepia", min: 0, max: 100 },
  { id: "grayscale", label: "Grayscale", icon: "dark-grayscale", min: 0, max: 100 },
];

function chromodsDarkHostKey(hostname) {
  return String(hostname || "")
    .trim()
    .replace(/^www\./i, "")
    .toLowerCase();
}

function chromodsDarkHostFromUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (parsed.hostname === "chromewebstore.google.com") return null;
    if (parsed.hostname === "chrome.google.com" && parsed.pathname.startsWith("/webstore")) {
      return null;
    }
    const host = chromodsDarkHostKey(parsed.hostname);
    return host || null;
  } catch {
    return null;
  }
}

function chromodsClampDarkValue(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function chromodsNormalizeDarkSite(value) {
  const base = { ...CHROMODS_DARK_SITE_DEFAULTS };
  if (value === true) return { ...base, enabled: true };
  if (!value || typeof value !== "object") return base;
  return {
    enabled: value.enabled !== false,
    brightness: chromodsClampDarkValue(value.brightness, 50, 150, base.brightness),
    contrast: chromodsClampDarkValue(value.contrast, 50, 150, base.contrast),
    grayscale: chromodsClampDarkValue(value.grayscale, 0, 100, base.grayscale),
    sepia: chromodsClampDarkValue(value.sepia, 0, 100, base.sepia),
    styleSystemControls: value.styleSystemControls !== false,
    skipNativeDark: value.skipNativeDark !== false,
  };
}

function chromodsDarkSiteHasCustomTheme(site) {
  const config = chromodsNormalizeDarkSite(site);
  return (
    config.brightness !== CHROMODS_DARK_SITE_DEFAULTS.brightness ||
    config.contrast !== CHROMODS_DARK_SITE_DEFAULTS.contrast ||
    config.grayscale !== CHROMODS_DARK_SITE_DEFAULTS.grayscale ||
    config.sepia !== CHROMODS_DARK_SITE_DEFAULTS.sepia ||
    config.styleSystemControls !== CHROMODS_DARK_SITE_DEFAULTS.styleSystemControls ||
    config.skipNativeDark !== CHROMODS_DARK_SITE_DEFAULTS.skipNativeDark
  );
}

function chromodsDarkReaderTheme(site) {
  const config = chromodsNormalizeDarkSite(site);
  return {
    ...CHROMODS_DARK_THEME,
    brightness: config.brightness,
    contrast: config.contrast,
    grayscale: config.grayscale,
    sepia: config.sepia,
    styleSystemControls: config.styleSystemControls,
    immediateModify: true,
  };
}

async function chromodsGetDarkState() {
  const stored = await chrome.storage.local.get(CHROMODS_DARK_STORAGE_KEY);
  const value = stored[CHROMODS_DARK_STORAGE_KEY];
  const sites = value?.sites && typeof value.sites === "object" ? { ...value.sites } : {};
  return { sites };
}

async function chromodsGetDarkSites() {
  const { sites } = await chromodsGetDarkState();
  return sites;
}

async function chromodsWriteDarkSites(sites) {
  await chrome.storage.local.set({ [CHROMODS_DARK_STORAGE_KEY]: { sites } });
  return { sites };
}

function chromodsIsDarkHostEnabled(sites, host) {
  const config = sites?.[chromodsDarkHostKey(host)];
  if (config === true) return true;
  if (config && typeof config === "object") return config.enabled !== false;
  return false;
}

function chromodsDarkSiteConfig(sites, host) {
  return chromodsNormalizeDarkSite(sites?.[chromodsDarkHostKey(host)]);
}

async function chromodsSetDarkSite(host, enabled) {
  const key = chromodsDarkHostKey(host);
  if (!key) return { sites: {} };
  const sites = await chromodsGetDarkSites();
  const current = chromodsNormalizeDarkSite(sites[key]);
  if (enabled) {
    sites[key] = { ...current, enabled: true };
  } else if (chromodsDarkSiteHasCustomTheme(current)) {
    sites[key] = { ...current, enabled: false };
  } else {
    delete sites[key];
  }
  return chromodsWriteDarkSites(sites);
}

async function chromodsSetDarkSiteTheme(host, patch = {}) {
  const key = chromodsDarkHostKey(host);
  if (!key) return { sites: {} };
  const sites = await chromodsGetDarkSites();
  const current = chromodsNormalizeDarkSite(sites[key]);
  const next = chromodsNormalizeDarkSite({ ...current, ...patch });
  if (!next.enabled && !chromodsDarkSiteHasCustomTheme(next)) {
    delete sites[key];
  } else {
    sites[key] = next;
  }
  return chromodsWriteDarkSites(sites);
}

function chromodsDarkEnabledHosts(sites = {}) {
  return Object.keys(sites)
    .filter((host) => chromodsIsDarkHostEnabled(sites, host))
    .sort((a, b) => a.localeCompare(b));
}

function chromodsElementLooksNativelyDark(el) {
  if (!el) return false;
  if (typeof el.hasAttribute === "function") {
    if (el.hasAttribute("dark")) return true;
    const attrs = [
      "data-color-mode",
      "data-color-scheme",
      "data-theme",
      "data-bs-theme",
      "data-theme-mode",
    ];
    for (const name of attrs) {
      const value = String(el.getAttribute(name) || "").trim().toLowerCase();
      if (value === "dark" || value === "night" || value.endsWith("-dark")) return true;
    }
  }
  const className =
    typeof el.className === "string"
      ? el.className
      : String(el.className?.baseVal || el.getAttribute?.("class") || "");
  return /(^|\s)(dark|theme-dark|dark-theme|darkmode|dark-mode|skin-theme-clientpref-night)(\s|$)/i.test(
    className
  );
}

function chromodsPageLooksNativelyDark(doc = typeof document !== "undefined" ? document : null) {
  if (!doc?.documentElement) return false;
  if (chromodsElementLooksNativelyDark(doc.documentElement)) return true;
  if (chromodsElementLooksNativelyDark(doc.body)) return true;
  const root = doc.documentElement;
  if (root.getAttribute?.("data-darkreader-mode")) return false;
  const scheme = String(
    doc.defaultView?.getComputedStyle?.(root)?.colorScheme || ""
  ).toLowerCase();
  return /\bdark\b/.test(scheme) && !/\blight\b/.test(scheme);
}
