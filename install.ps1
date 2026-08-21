# ChroMods installer / updater for Windows.
#   irm https://raw.githubusercontent.com/T3lluz/ChroMods/main/install.ps1 | iex
# Re-run it any time to update. Set $env:CHROMODS_DIR to install somewhere else.
$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/T3lluz/ChroMods"
$Branch = "main"
$Dir = if ($env:CHROMODS_DIR) { $env:CHROMODS_DIR } else { Join-Path $env:LOCALAPPDATA "ChroMods" }

if (Get-Command git -ErrorAction SilentlyContinue) {
  if (Test-Path (Join-Path $Dir ".git")) {
    Write-Host "Updating $Dir"
    git -C $Dir fetch --depth 1 origin $Branch
    git -C $Dir reset --hard "origin/$Branch"
  } else {
    Write-Host "Cloning ChroMods into $Dir"
    if (Test-Path $Dir) { Remove-Item -Recurse -Force $Dir }
    git clone --depth 1 --branch $Branch "$RepoUrl.git" $Dir
  }
} else {
  Write-Host "git not found - downloading the ZIP into $Dir"
  $Temp = Join-Path ([System.IO.Path]::GetTempPath()) ("chromods-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $Temp | Out-Null
  try {
    $Zip = Join-Path $Temp "chromods.zip"
    Invoke-WebRequest -Uri "$RepoUrl/archive/refs/heads/$Branch.zip" -OutFile $Zip
    Expand-Archive -Path $Zip -DestinationPath $Temp -Force
    if (Test-Path $Dir) { Remove-Item -Recurse -Force $Dir }
    New-Item -ItemType Directory -Path (Split-Path -Parent $Dir) -Force | Out-Null
    Move-Item (Join-Path $Temp "ChroMods-$Branch") $Dir
  } finally {
    Remove-Item -Recurse -Force $Temp -ErrorAction SilentlyContinue
  }
}

$Version = (Get-Content (Join-Path $Dir "manifest.json") -Raw | ConvertFrom-Json).version

Write-Host ""
Write-Host "ChroMods v$Version is ready in:"
Write-Host "  $Dir"
Write-Host ""
Write-Host "First install:"
Write-Host "  1. Open chrome://extensions"
Write-Host "  2. Turn on Developer mode (top right)"
Write-Host "  3. Load unpacked -> pick the folder above"
Write-Host ""
Write-Host "Already installed? Open the ChroMods popup -> Settings -> Updates -> Reload ChroMods."
