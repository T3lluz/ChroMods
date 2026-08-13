const CHROMODS_DARK_STORAGE_KEY = "chroModsDarkMode";
const CHROMODS_DARK_PING = "chromods-dark-ping";
const CHROMODS_DARK_FETCH = "chromods-dark-fetch";
const CHROMODS_DARK_WIPE = "chromods-dark-wipe";

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
};

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

async function chromodsGetDarkSites() {
  const stored = await chrome.storage.local.get(CHROMODS_DARK_STORAGE_KEY);
  const sites = stored[CHROMODS_DARK_STORAGE_KEY]?.sites;
  return sites && typeof sites === "object" ? { ...sites } : {};
}

async function chromodsSetDarkSite(host, enabled) {
  const key = chromodsDarkHostKey(host);
  if (!key) return { sites: {} };
  const sites = await chromodsGetDarkSites();
  if (enabled) sites[key] = true;
  else delete sites[key];
  await chrome.storage.local.set({ [CHROMODS_DARK_STORAGE_KEY]: { sites } });
  return { sites };
}

function chromodsIsDarkHostEnabled(sites, host) {
  return Boolean(sites?.[chromodsDarkHostKey(host)]);
}
