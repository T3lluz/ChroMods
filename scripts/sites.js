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
    id: "ytmusic",
    title: "YouTube Music",
    hostnames: ["music.youtube.com"],
    icon: "site-ytmusic",
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
  {
    id: "twitch",
    title: "Twitch",
    hostnames: ["twitch.tv"],
    icon: "site-twitch",
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    hostnames: ["chatgpt.com"],
    icon: "site-chatgpt",
  },
];

const SITE_BY_ID = Object.fromEntries(SITE_META.map((site) => [site.id, site]));

function normalizeHostname(hostname) {
  return String(hostname || "")
    .trim()
    .replace(/^www\./i, "")
    .toLowerCase();
}

/* Scores how specifically a site claims a host: the length of the hostname it
   matched, or 0 for no match. music.youtube.com is claimed by both YouTube
   Music and YouTube, and the longer claim is the one the user means. */
function siteHostMatchLength(host, site) {
  if (site.hostnamePattern) {
    return site.hostnamePattern.test(host) ? host.length : 0;
  }
  let longest = 0;
  for (const candidate of site.hostnames) {
    if (host === candidate || host.endsWith(`.${candidate}`)) {
      longest = Math.max(longest, candidate.length);
    }
  }
  return longest;
}

function hostMatchesSite(host, site) {
  return siteHostMatchLength(host, site) > 0;
}

function matchSiteFromHostname(hostname) {
  const host = normalizeHostname(hostname);
  if (!host) return null;
  let match = null;
  let matchLength = 0;
  for (const site of SITE_META) {
    const length = siteHostMatchLength(host, site);
    if (length > matchLength) {
      match = site;
      matchLength = length;
    }
  }
  return match;
}

function matchSiteFromUrl(url) {
  try {
    return matchSiteFromHostname(new URL(url).hostname);
  } catch {
    return null;
  }
}
