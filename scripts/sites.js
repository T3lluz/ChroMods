const GOOGLE_SEARCH_HOST =
  /^(?:images\.)?google\.(?:com(?:\.[a-z]{2})?|co\.[a-z]{2}|[a-z]{2,3})$/i;

const SITE_META = [
  {
    id: "youtube",
    title: "YouTube",
    hostnames: ["youtube.com", "youtu.be", "youtube-nocookie.com"],
    icon: "site-youtube",
  },
  {
    id: "github",
    title: "GitHub",
    hostnames: ["github.com"],
    icon: "site-github",
  },
  {
    id: "google",
    title: "Google",
    hostnames: ["google.com"],
    hostnamePattern: GOOGLE_SEARCH_HOST,
    icon: "site-google",
  },
  {
    id: "gmail",
    title: "Gmail",
    hostnames: ["mail.google.com"],
    icon: "site-gmail",
  },
  {
    id: "gemini",
    title: "Gemini",
    hostnames: ["gemini.google.com"],
    icon: "site-gemini",
  },
  {
    id: "duckduckgo",
    title: "DuckDuckGo",
    hostnames: ["duckduckgo.com"],
    icon: "site-duckduckgo",
  },
  {
    id: "x",
    title: "X",
    hostnames: ["x.com", "twitter.com"],
    icon: "site-x",
  },
];

const SITE_BY_ID = Object.fromEntries(SITE_META.map((site) => [site.id, site]));

function normalizeHostname(hostname) {
  return String(hostname || "")
    .trim()
    .replace(/^www\./i, "")
    .toLowerCase();
}

function hostMatchesSite(host, site) {
  if (site.hostnamePattern) {
    return site.hostnamePattern.test(host);
  }
  return site.hostnames.some(
    (candidate) => host === candidate || host.endsWith(`.${candidate}`)
  );
}

function matchSiteFromHostname(hostname) {
  const host = normalizeHostname(hostname);
  if (!host) return null;
  return SITE_META.find((site) => hostMatchesSite(host, site)) ?? null;
}

function matchSiteFromUrl(url) {
  try {
    return matchSiteFromHostname(new URL(url).hostname);
  } catch {
    return null;
  }
}
