const applyVersions = document.getElementById("apply-versions");
const applyStatus = document.getElementById("apply-status");
const applyRun = document.getElementById("apply-run");
const applyFolder = document.getElementById("apply-folder");
const applyBar = document.getElementById("apply-progress-bar");
const applyProgress = document.querySelector(".apply-progress");
const applyCommandText = document.getElementById("apply-command-text");
const applyCopy = document.getElementById("apply-copy");

const APPLY_PROGRESS = {
  download: { label: "Downloading the release…", width: "28%" },
  extract: { label: "Unpacking…", width: "52%" },
  write: { label: "Writing files into the folder…", width: "78%" },
  reload: { label: "Reloading ChroMods…", width: "100%" },
};

let applyState = chromodsNormalizeUpdateState(null);
let savedDirectory = null;
let applyBusy = false;
let applyCopyTimer = 0;

function applyPlatform() {
  return navigator.userAgentData?.platform || navigator.platform || "";
}

function stampApplyIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    if (el.querySelector("svg")) return;
    const markup = iconMarkup(el.dataset.icon);
    if (markup) el.insertAdjacentHTML("afterbegin", markup);
  });
}

function setApplyButton(icon, text) {
  applyRun.replaceChildren();
  applyRun.dataset.icon = icon;
  applyRun.insertAdjacentHTML("afterbegin", iconMarkup(icon));
  applyRun.append(text);
}

function setApplyProgress(stage) {
  const next = APPLY_PROGRESS[stage];
  if (!next) {
    applyProgress.hidden = true;
    return;
  }
  applyProgress.hidden = false;
  applyBar.style.width = next.width;
  applyStatus.textContent = next.label;
}

function describeFolderState(permission) {
  if (!chromodsCanPickUpdateFolder()) {
    return "This browser can't grant folder access — use the terminal command below.";
  }
  if (savedDirectory && permission === "granted") {
    return "Using the ChroMods folder you picked last time.";
  }
  if (savedDirectory) {
    return "Click to allow write access to the folder you picked last time.";
  }
  return "The first time, pick the folder you loaded unpacked. ChroMods remembers it.";
}

function applyButtonLabel(permission) {
  const version = applyState.latestVersion ? ` v${applyState.latestVersion}` : "";
  if (!chromodsCanPickUpdateFolder()) return "Folder access unavailable";
  if (!chromodsUpdateAvailable(applyState)) return "Nothing to apply";
  if (savedDirectory && permission === "granted") return `Apply${version}`;
  if (savedDirectory) return `Allow folder & apply${version}`;
  return `Choose folder & apply${version}`;
}

async function renderApplyPage() {
  const available = chromodsUpdateAvailable(applyState);
  applyVersions.textContent = available
    ? `v${applyState.currentVersion} → v${applyState.latestVersion}`
    : `You're on v${applyState.currentVersion}`;
  applyCommandText.textContent = chromodsInstallCommand(applyPlatform());

  const permission = savedDirectory
    ? await chromodsQueryDirectoryPermission(savedDirectory)
    : "prompt";

  applyFolder.hidden = !available;
  applyFolder.textContent = describeFolderState(permission);

  const canRun =
    available &&
    Boolean(applyState.downloadUrl) &&
    chromodsCanPickUpdateFolder() &&
    chromodsIsAllowedUpdateUrl(applyState.downloadUrl);

  applyRun.disabled = applyBusy || !canRun;
  setApplyButton(savedDirectory ? "ui-update" : "ui-folder", applyButtonLabel(permission));

  if (!available) {
    applyStatus.textContent = "No update is waiting. You can close this window.";
  } else if (!chromodsCanPickUpdateFolder()) {
    applyStatus.textContent =
      "This Chromium build can't write the unpacked folder. Re-run the installer, then Reload ChroMods in the popup.";
  } else if (!applyState.downloadUrl) {
    applyStatus.textContent = "The updater has no download URL for this version.";
  }
}

async function runApply() {
  if (applyBusy || applyRun.disabled) return;
  applyBusy = true;
  applyRun.disabled = true;
  applyStatus.textContent = "Waiting for folder access…";

  try {
    const dir = await chromodsEnsureUpdateDirectory(savedDirectory);
    savedDirectory = dir;
    applyFolder.textContent = "Writing into the folder you picked.";
    const result = await chromodsApplyExtensionUpdate({
      downloadUrl: applyState.downloadUrl,
      expectedVersion: applyState.latestVersion,
      dirHandle: dir,
      onProgress: setApplyProgress,
    });
    applyStatus.textContent = `Installed v${result.version}. Reloading…`;
    await chromodsRequestExtensionReload({ refreshTabs: true });
  } catch (error) {
    applyBusy = false;
    setApplyProgress(null);
    applyStatus.textContent = String(error?.message || error || "Apply failed");
    await renderApplyPage();
  }
}

async function copyApplyCommand() {
  try {
    await navigator.clipboard.writeText(applyCommandText.textContent.trim());
    applyCopy.textContent = "Copied";
  } catch {
    applyCopy.textContent = "Copy failed";
  }
  clearTimeout(applyCopyTimer);
  applyCopyTimer = window.setTimeout(() => {
    applyCopy.textContent = "Copy";
  }, 1600);
}

async function initApplyPage() {
  stampApplyIcons();
  try {
    applyState = await chromodsGetUpdateState();
  } catch {
    applyState = chromodsNormalizeUpdateState(null);
  }
  savedDirectory = await chromodsGetSavedDirectoryHandle();
  applyRun.addEventListener("click", runApply);
  applyCopy.addEventListener("click", copyApplyCommand);
  await renderApplyPage();
}

initApplyPage();
