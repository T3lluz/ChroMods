# YouTube Theming

Chrome MV3 extension — CSS mods for `youtube.com`. Styles adapted from [my-internet](https://github.com/sameerasw/my-internet).

## Install

1. Clone → `chrome://extensions` → **Developer mode** → **Load unpacked** → select repo root
2. Reload any open YouTube tabs

## Features

| Mod | What it does |
|-----|--------------|
| **Immersive search** | Full-viewport blur on focus; search + suggestions on top |
| **Theater mode** | Full-window theater view; subsettings below |
| **Feed layout fix** | Denser grid, compact cards, hover menu; configurable columns |
| **Compact sidebar** | Icon-only guide; hides Studio/Sports/Settings/footer |

### Theater subsettings

| Setting | Default | Effect |
|---------|---------|--------|
| Auto-hide header | on | Hide masthead in theater; reveal when hovering top ~140px |
| Hover comments | on | Slide-in comments panel with solid background |
| Comments side | left | `left` or `right` edge for comments panel |

### Feed layout subsettings

| Setting | Default | Effect |
|---------|---------|--------|
| Videos per row | auto | `auto` (responsive 4–6) or fixed `3`–`6` columns |

## Dev

```bash
npm install          # playwright for e2e
npm test             # manifest, CSS compat, wiring (12 tests)
npm run test:e2e     # popup UI + YouTube injection (7 tests)
```

Screenshots: `tests/screenshots/`

## Structure

```
manifest.json          MV3 config
background.js          default settings on install
content-script.js      injects CSS from toggles + subsettings
popup/                 dark settings panel
styles/                per-feature CSS modules
tests/                 node:test + playwright e2e
```

## Notes

- Chromium only (`:has()`, `scale`, `backdrop-filter` with `-webkit-` prefix)
- YouTube DOM changes may break selectors — report issues on GitHub
- Settings sync via `chrome.storage.sync` under key `youtubeThemingSettings`

## License

MIT — CSS derived from [my-internet](https://github.com/sameerasw/my-internet) (MIT)
