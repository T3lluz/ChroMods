#!/usr/bin/env bash
# ChroMods installer / updater for macOS and Linux.
#   curl -fsSL https://raw.githubusercontent.com/T3lluz/ChroMods/main/install.sh | bash
# Re-run it any time to update.
#
#   CHROMODS_DIR=/path/to/dir   install somewhere other than ~/.chromods
#   CHROMODS_BRANCH=some-branch track a branch other than main
#   CHROMODS_NO_OPEN=1          don't open chrome://extensions afterwards
#   CHROMODS_NO_CLIPBOARD=1     don't copy the folder path to the clipboard
set -euo pipefail

REPO_URL="https://github.com/T3lluz/ChroMods"
BRANCH="${CHROMODS_BRANCH:-main}"
DIR="${CHROMODS_DIR:-$HOME/.chromods}"

say() { printf '%s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }

if [ -d "$DIR/manifest.json" ]; then
  say "$DIR/manifest.json is a directory — refusing to touch $DIR."
  exit 1
fi

WAS_INSTALLED=0
if [ -f "$DIR/manifest.json" ]; then WAS_INSTALLED=1; fi

if have git; then
  if [ -d "$DIR/.git" ]; then
    say "Updating $DIR"
    git -C "$DIR" fetch --depth 1 origin "$BRANCH"
    git -C "$DIR" reset --hard "FETCH_HEAD"
  else
    say "Cloning ChroMods into $DIR"
    rm -rf "$DIR"
    mkdir -p "$(dirname "$DIR")"
    git clone --depth 1 --branch "$BRANCH" "$REPO_URL.git" "$DIR"
  fi
else
  have curl || { say "Need git or curl installed."; exit 1; }
  have unzip || { say "Need git or unzip installed."; exit 1; }
  say "git not found — downloading the ZIP into $DIR"
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  curl -fsSL "$REPO_URL/archive/refs/heads/$BRANCH.zip" -o "$TMP/chromods.zip"
  unzip -q "$TMP/chromods.zip" -d "$TMP/unpacked"
  # GitHub names the folder after the repo and the ref, with slashes flattened.
  SRC="$(find "$TMP/unpacked" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
  [ -n "$SRC" ] || { say "The downloaded ZIP looked empty."; exit 1; }
  rm -rf "$DIR"
  mkdir -p "$(dirname "$DIR")"
  mv "$SRC" "$DIR"
fi

[ -f "$DIR/manifest.json" ] || { say "Install failed — no manifest.json in $DIR."; exit 1; }
VERSION="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$DIR/manifest.json" | head -n 1)"

# Whichever Chromium browser is installed decides how we open the extensions
# page, and what the page is even called.
BROWSER_NAME=""
BROWSER_OPEN=""
detect_browser() {
  if [ "$(uname -s)" = "Darwin" ]; then
    local app
    for app in "Google Chrome" "Brave Browser" "Microsoft Edge" "Chromium" "Vivaldi" "Arc"; do
      if [ -d "/Applications/$app.app" ] || [ -d "$HOME/Applications/$app.app" ]; then
        BROWSER_NAME="$app"
        BROWSER_OPEN="open -a"
        return
      fi
    done
    return
  fi
  local bin
  for bin in google-chrome google-chrome-stable brave-browser microsoft-edge chromium chromium-browser vivaldi-stable; do
    if have "$bin"; then
      BROWSER_NAME="$bin"
      BROWSER_OPEN="direct"
      return
    fi
  done
}
detect_browser

copy_path() {
  if [ -n "${CHROMODS_NO_CLIPBOARD:-}" ]; then return 1; fi
  if have pbcopy; then printf '%s' "$DIR" | pbcopy; return $?; fi
  if [ -n "${WAYLAND_DISPLAY:-}" ] && have wl-copy; then printf '%s' "$DIR" | wl-copy; return $?; fi
  if [ -n "${DISPLAY:-}" ] && have xclip; then printf '%s' "$DIR" | xclip -selection clipboard; return $?; fi
  if [ -n "${DISPLAY:-}" ] && have xsel; then printf '%s' "$DIR" | xsel --clipboard --input; return $?; fi
  return 1
}

open_extensions_page() {
  if [ -n "${CHROMODS_NO_OPEN:-}" ] || [ -z "$BROWSER_NAME" ]; then return 1; fi
  if [ "$BROWSER_OPEN" = "open -a" ]; then
    open -a "$BROWSER_NAME" "chrome://extensions/" >/dev/null 2>&1
    return $?
  fi
  ( "$BROWSER_NAME" "chrome://extensions/" >/dev/null 2>&1 & )
  return 0
}

COPIED=0
if copy_path; then COPIED=1; fi

say ""
if [ "$WAS_INSTALLED" = "1" ]; then
  say "ChroMods updated to v${VERSION} in:"
else
  say "ChroMods v${VERSION} is ready in:"
fi
say "  $DIR"
if [ "$COPIED" = "1" ]; then say "  (copied to your clipboard)"; fi
say ""

if [ "$WAS_INSTALLED" = "1" ]; then
  say "Finish the update in one click:"
  say "  Open the ChroMods popup -> Settings -> Updates -> Reload ChroMods"
  say ""
  say "That re-reads the folder above and refreshes your themed tabs."
else
  OPENED=0
  if open_extensions_page; then OPENED=1; fi
  if [ "$OPENED" = "1" ]; then
    say "Opening ${BROWSER_NAME} on the extensions page. Three clicks left:"
  else
    say "Load it into your browser (open chrome://extensions first):"
  fi
  say "  1. Turn on Developer mode (top right)"
  say "  2. Click Load unpacked"
  if [ "$COPIED" = "1" ]; then
    say "  3. Paste the path above into the file picker and confirm"
  else
    say "  3. Pick the folder above"
  fi
  say ""
  say "After that, updates are: re-run this command, then hit Reload ChroMods"
  say "in the popup's Settings -> Updates."
fi
