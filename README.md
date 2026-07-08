# YouTube Theming

Chrome MV3 extension — CSS mods for `youtube.com`. Styles adapted from [my-internet](https://github.com/sameerasw/my-internet).

## Install

1. Clone → `chrome://extensions` → **Developer mode** → **Load unpacked** → select repo root
2. Reload any open YouTube tabs

## Features

| Mod | What it does |
|-----|--------------|
| **Immersive search** | Blur + zoom on search focus; centered floating bar |
| **Theater mode** | Full-window theater view; subsettings below |
| **Feed layout fix** | Denser grid (4–6 cols), compact cards, hover menu |
| **Compact sidebar** | Icon-only guide; hides Studio/Sports/Settings/footer |

### Theater subsettings

| Setting | Default | Effect |
|---------|---------|--------|
| Auto-hide header | on | Hide masthead in theater; reveal on hover |
| Hover comments | on | Slide-in comments panel on screen edge |
| Glass background | on | Blur glass vs solid panel |
| Comments side | left | `left` or `right` edge for comments panel |

## Dev

```bash
npm install          # playwright for e2e
npm test             # manifest, CSS compat, wiring (9 tests)
npm run test:e2e     # popup UI + YouTube injection (4 tests)
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
