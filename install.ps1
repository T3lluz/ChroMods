# ChroMods installer / updater for Windows.
#   irm https://raw.githubusercontent.com/T3lluz/ChroMods/main/install.ps1 | iex
# Re-run it any time to update.
#
#   $env:CHROMODS_DIR         install somewhere other than %LOCALAPPDATA%\ChroMods
#   $env:CHROMODS_BRANCH      track a branch other than main
#   $env:CHROMODS_NO_OPEN     don't open chrome://extensions afterwards
#   $env:CHROMODS_NO_CLIPBOARD  don't copy the folder path to the clipboard
$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/T3lluz/ChroMods"
$Branch = if ($env:CHROMODS_BRANCH) { $env:CHROMODS_BRANCH } else { "main" }
$Dir = if ($env:CHROMODS_DIR) { $env:CHROMODS_DIR } else { Join-Path $env:LOCALAPPDATA "ChroMods" }
$ManifestPath = Join-Path $Dir "manifest.json"

$WasInstalled = Test-Path -PathType Leaf $ManifestPath

if (Get-Command git -ErrorAction SilentlyContinue) {
  if (Test-Path (Join-Path $Dir ".git")) {
    Write-Host "Updating $Dir"
    git -C $Dir fetch --depth 1 origin $Branch
    git -C $Dir reset --hard FETCH_HEAD
  } else {
    Write-Host "Cloning ChroMods into $Dir"
    if (Test-Path $Dir) { Remove-Item -Recurse -Force $Dir }
    New-Item -ItemType Directory -Path (Split-Path -Parent $Dir) -Force | Out-Null
    git clone --depth 1 --branch $Branch "$RepoUrl.git" $Dir
  }
} else {
  Write-Host "git not found - downloading the ZIP into $Dir"
  $Temp = Join-Path ([System.IO.Path]::GetTempPath()) ("chromods-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $Temp | Out-Null
  try {
    $Zip = Join-Path $Temp "chromods.zip"
    Invoke-WebRequest -Uri "$RepoUrl/archive/refs/heads/$Branch.zip" -OutFile $Zip
    $Unpacked = Join-Path $Temp "unpacked"
    Expand-Archive -Path $Zip -DestinationPath $Unpacked -Force
    # GitHub names the folder after the repo and the ref, with slashes flattened.
    $Source = Get-ChildItem -Path $Unpacked -Directory | Select-Object -First 1
    if (-not $Source) { throw "The downloaded ZIP looked empty." }
    if (Test-Path $Dir) { Remove-Item -Recurse -Force $Dir }
    New-Item -ItemType Directory -Path (Split-Path -Parent $Dir) -Force | Out-Null
    Move-Item $Source.FullName $Dir
  } finally {
    Remove-Item -Recurse -Force $Temp -ErrorAction SilentlyContinue
  }
}

if (-not (Test-Path -PathType Leaf $ManifestPath)) {
  throw "Install failed - no manifest.json in $Dir."
}
$Version = (Get-Content $ManifestPath -Raw | ConvertFrom-Json).version

# Whichever Chromium browser is installed decides how we open the extensions
# page, and what the page is even called.
function Find-ChromiumBrowser {
  $candidates = @(
    @{ Name = "Chrome";  Exe = "chrome.exe";  Path = "Google\Chrome\Application\chrome.exe" },
    @{ Name = "Brave";   Exe = "brave.exe";   Path = "BraveSoftware\Brave-Browser\Application\brave.exe" },
    @{ Name = "Edge";    Exe = "msedge.exe";  Path = "Microsoft\Edge\Application\msedge.exe" },
    @{ Name = "Vivaldi"; Exe = "vivaldi.exe"; Path = "Vivaldi\Application\vivaldi.exe" }
  )
  $roots = @($env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA) | Where-Object { $_ }
  foreach ($candidate in $candidates) {
    foreach ($root in $roots) {
      $full = Join-Path $root $candidate.Path
      if (Test-Path -PathType Leaf $full) {
        return [pscustomobject]@{ Name = $candidate.Name; Command = $full }
      }
    }
    $onPath = Get-Command $candidate.Exe -ErrorAction SilentlyContinue
    if ($onPath) {
      return [pscustomobject]@{ Name = $candidate.Name; Command = $onPath.Source }
    }
  }
  return $null
}

$Copied = $false
if (-not $env:CHROMODS_NO_CLIPBOARD) {
  try {
    Set-Clipboard -Value $Dir
    $Copied = $true
  } catch {
    # No clipboard on this host; the path is printed either way.
  }
}

Write-Host ""
if ($WasInstalled) {
  Write-Host "ChroMods updated to v$Version in:"
} else {
  Write-Host "ChroMods v$Version is ready in:"
}
Write-Host "  $Dir"
if ($Copied) { Write-Host "  (copied to your clipboard)" }
Write-Host ""

if ($WasInstalled) {
  Write-Host "Finish the update in one click:"
  Write-Host "  Open the ChroMods popup -> Settings -> Updates -> Reload ChroMods"
  Write-Host ""
  Write-Host "That re-reads the folder above and refreshes your themed tabs."
} else {
  $Browser = $null
  if (-not $env:CHROMODS_NO_OPEN) { $Browser = Find-ChromiumBrowser }
  if ($Browser) {
    try {
      Start-Process -FilePath $Browser.Command -ArgumentList "chrome://extensions/"
      Write-Host "Opening $($Browser.Name) on the extensions page. Three clicks left:"
    } catch {
      $Browser = $null
    }
  }
  if (-not $Browser) {
    Write-Host "Load it into your browser (open chrome://extensions first):"
  }
  Write-Host "  1. Turn on Developer mode (top right)"
  Write-Host "  2. Click Load unpacked"
  if ($Copied) {
    Write-Host "  3. Paste the path above into the file picker and confirm"
  } else {
    Write-Host "  3. Pick the folder above"
  }
  Write-Host ""
  Write-Host "After that, updates are: Settings -> Updates -> Apply update in the popup"
  Write-Host "(or re-run this command, then hit Reload ChroMods)."
}
