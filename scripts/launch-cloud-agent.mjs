import fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const DEFAULT_API = "https://api.cursor.com/v1/agents";

function readClassification(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function buildAgentPayload({ classification, repoUrl, startingRef = "main" }) {
  if (!classification?.prompt) {
    throw new Error("classification.prompt is required");
  }
  const host = classification.host || "site";
  return {
    prompt: { text: classification.prompt },
    name: `Port ${host}`.slice(0, 100),
    repos: [
      {
        url: repoUrl,
        startingRef,
      },
    ],
    autoCreatePR: true,
    workOnCurrentBranch: false,
  };
}

export function parseAgentResponse(data) {
  const agent = data?.agent || data;
  const id = agent?.id || data?.id;
  const url = agent?.url || data?.url || data?.target?.urlUrl || data?.target?.url;
  if (!id) {
    throw new Error(`Cloud Agent API did not return an id: ${JSON.stringify(data)}`);
  }
  return {
    id,
    url: url || `https://cursor.com/agents/${id}`,
  };
}

export async function launchCloudAgent({
  classification,
  repoUrl,
  apiKey,
  startingRef = "main",
  apiUrl = DEFAULT_API,
  fetchImpl = fetch,
}) {
  if (!apiKey) throw new Error("CURSOR_API_KEY is missing");
  const payload = buildAgentPayload({ classification, repoUrl, startingRef });
  const response = await fetchImpl(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Cloud Agent API returned non-JSON (${response.status}): ${text.slice(0, 500)}`);
  }
  if (!response.ok) {
    throw new Error(`Cloud Agent API ${response.status}: ${text.slice(0, 800)}`);
  }
  return parseAgentResponse(data);
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/launch-cloud-agent.mjs <triage.json>");
    process.exit(1);
  }
  const classification = readClassification(file);
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) throw new Error("GITHUB_REPOSITORY is missing");
  const launched = await launchCloudAgent({
    classification,
    repoUrl: `https://github.com/${repo}`,
    apiKey: process.env.CURSOR_API_KEY,
    startingRef: process.env.CURSOR_STARTING_REF || "main",
  });
  process.stdout.write(JSON.stringify(launched, null, 2) + "\n");
}

const isCli =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isCli) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
