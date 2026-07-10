# YouTube Theming

Chrome MV3 extension — CSS mods for `youtube.com`. Styles adapted from [my-internet](https://github.com/sameerasw/my-internet).

## Install

1. Clone → `chrome://extensions` → **Developer mode** → **Load unpacked** → select repo root
2. Reload any open YouTube tabs

## Features

| Mod | What it does |
|-----|--------------|
| **Immersive search** | Centered search with instant page blur on focus; suggestions aligned below |
| **Theater mode** | Full-window theater view; subsettings below |
| **Feed layout fix** | Denser grid, compact cards, hover menu; configurable columns |
| **Compact sidebar** | Icon-only guide; hides Studio/Sports/Settings/footer |
| **Hide filter chips** | Removes the home feed category chip bar and header row |
| **Player blur** | Frosted-glass blur on video player controls and menus |

The curated panel also includes side-guide controls, thumbnail previews, distraction hiding, ambient-mode control, captions, live-chat overlays, movable live chat, and YouTube TV. Disruptive mods default to off.

### Popup categories

Settings are grouped in animated, collapsible **Search**, **Home feed**, **Navigation**, **Player**, and **Live & comments** categories.

### Theater subsettings

| Setting | Default | Effect |
|---------|---------|--------|
| Auto-hide header | on | Hide masthead in theater; reveal when hovering top ~140px |
| Blur header | off | Frosted-glass blur on the masthead, matching player controls |
| Hover comments | on | Slide-in comments panel with solid background |
| Comments side | left | `left` or `right` edge for comments panel |

### Feed layout subsettings

| Setting | Default | Effect |
|---------|---------|--------|
| Videos per row | auto | `auto` (responsive 4–6) or fixed `3`–`6` columns |

## Dev

```bash
npm install          # playwright for e2e
npm test             # manifest, CSS compatibility, and wiring
npm run test:e2e     # popup UI, theater geometry, and YouTube injection
```

Screenshots: `tests/screenshots/`

## Structure

```
manifest.json          MV3 config
scripts/               background, content, popup, and icon JavaScript
popup/                 dark settings panel markup and styles
icons/                 extension icon (SVG source + PNG sizes)
styles/                per-feature CSS modules
tests/                 node:test + playwright e2e
```

## Notes

- Chromium only (`:has()`, `scale`, `backdrop-filter` with `-webkit-` prefix)
- Movable live chat stores its position and opacity in `chrome.storage.local`
- Zen's browser-window transparency mod is intentionally excluded because Chromium cannot expose the browser chrome backdrop to page CSS
- YouTube DOM changes may break selectors — report issues on GitHub
- Settings sync via `chrome.storage.sync` under key `youtubeThemingSettings`

## License

MIT — CSS derived from [my-internet](https://github.com/sameerasw/my-internet) (MIT)
