const CHROMODS_GITHUB = { owner: "T3lluz", repo: "ChroMods" };

function chromodsRequestableHostFromUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (parsed.hostname === "chromewebstore.google.com") return null;
    if (parsed.hostname === "chrome.google.com" && parsed.pathname.startsWith("/webstore")) {
      return null;
    }
    const host = String(parsed.hostname || "")
      .trim()
      .replace(/^www\./i, "")
      .toLowerCase();
    return host || null;
  } catch {
    return null;
  }
}

function chromodsStyleRequestIssueUrl(host, pageUrl) {
  const title = `[STYLE] ${host}`;
  const safeUrl = String(pageUrl || "").slice(0, 500);
  const body = [
    `Please add styling for **${host}**.`,
    "",
    `**URL:** ${safeUrl}`,
    "",
    "---",
    "",
    "*Requested from the ChroMods popup.*",
  ].join("\n");
  const params = new URLSearchParams({ title, body });
  return `https://github.com/${CHROMODS_GITHUB.owner}/${CHROMODS_GITHUB.repo}/issues/new?${params}`;
}

function chromodsMatchStyleRequestIssue(items, host) {
  const needle = String(host || "").toLowerCase();
  if (!needle || !Array.isArray(items)) return null;

  const matches = items.filter((issue) =>
    String(issue?.title || "").toLowerCase().includes(needle)
  );
  const open = matches.find((issue) => issue.state === "open");
  const match = open ?? null;
  if (!match) return null;

  return {
    htmlUrl: match.html_url,
    title: match.title,
    state: match.state,
  };
}

async function chromodsFindExistingStyleRequest(host) {
  const query = encodeURIComponent(
    `[STYLE] ${host} repo:${CHROMODS_GITHUB.owner}/${CHROMODS_GITHUB.repo} in:title type:issue state:open`
  );
  const response = await fetch(`https://api.github.com/search/issues?q=${query}&per_page=5`, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return chromodsMatchStyleRequestIssue(data.items, host);
}
