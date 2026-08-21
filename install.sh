#!/usr/bin/env bash
# ChroMods installer / updater for macOS and Linux.
#   curl -fsSL https://raw.githubusercontent.com/T3lluz/ChroMods/main/install.sh | bash
# Re-run it any time to update. Set CHROMODS_DIR to install somewhere else.
set -euo pipefail

REPO_URL="https://github.com/T3lluz/ChroMods"
BRANCH="main"
DIR="${CHROMODS_DIR:-$HOME/.chromods}"

say() { printf '%s\n' "$*"; }

if command -v git >/dev/null 2>&1; then
  if [ -d "$DIR/.git" ]; then
    say "Updating $DIR"
    git -C "$DIR" fetch --depth 1 origin "$BRANCH"
    git -C "$DIR" reset --hard "origin/$BRANCH"
  else
    say "Cloning ChroMods into $DIR"
    rm -rf "$DIR"
    git clone --depth 1 --branch "$BRANCH" "$REPO_URL.git" "$DIR"
  fi
else
  command -v curl >/dev/null 2>&1 || { say "Need git or curl installed."; exit 1; }
  command -v unzip >/dev/null 2>&1 || { say "Need git or unzip installed."; exit 1; }
  say "git not found — downloading the ZIP into $DIR"
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  curl -fsSL "$REPO_URL/archive/refs/heads/$BRANCH.zip" -o "$TMP/chromods.zip"
  unzip -q "$TMP/chromods.zip" -d "$TMP"
  rm -rf "$DIR"
  mkdir -p "$(dirname "$DIR")"
  mv "$TMP/ChroMods-$BRANCH" "$DIR"
fi

VERSION="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$DIR/manifest.json" | head -n 1)"

cat <<EOF

ChroMods v${VERSION} is ready in:
  $DIR

First install:
  1. Open chrome://extensions
  2. Turn on Developer mode (top right)
  3. Load unpacked → pick the folder above

Already installed? Open the ChroMods popup → Settings → Updates → Reload ChroMods.
EOF
