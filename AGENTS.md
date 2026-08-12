# Agent notes

This Chrome MV3 extension (**ChroMods**) ports [sameerasw](https://github.com/sameerasw)'s website theming to Chromium. It currently covers YouTube, GitHub, Google Search, and DuckDuckGo, and can grow to other sites. When the user asks to import or refresh a theming mod, **fetch the latest files from the upstream repos** — do not rely on memory of their CSS.

## Upstream sources

| Repo | Role | Default branch |
|------|------|----------------|
| [sameerasw/my-internet](https://github.com/sameerasw/my-internet) | **Primary CSS source.** Zen Internet website styles. | `main` |
| [sameerasw/zeninternet](https://github.com/sameerasw/zeninternet) | **Addon / JS source.** Firefox extension that injects those styles (movable live chat, feature toggles, parsing). | `master` |

Raw file URLs:

- `https://raw.githubusercontent.com/sameerasw/my-internet/main/websites/youtube.com.css`
- `https://raw.githubusercontent.com/sameerasw/my-internet/main/websites/music.youtube.com.css`
- `https://raw.githubusercontent.com/sameerasw/my-internet/main/websites/studio.youtube.com.css`
- `https://raw.githubusercontent.com/sameerasw/zeninternet/master/content-script.js`

Use GitHub MCP (`get_file_contents` on `sameerasw/my-internet` or `sameerasw/zeninternet`) or fetch those raw URLs. Prefer `main` / `master` tip, not a cached SHA.

## Where YouTube CSS lives

In **my-internet**, each site is one stylesheet under `websites/`. Features are comment-delimited blocks:

```css
/* yt-Immersive search $ Smooth blur and zoom effect for searhbar */
```

The `yt-` prefix is the feature id; text after `$` is the human description (Zen Internet parses these into toggles). Same pattern with `ytm-` in `music.youtube.com.css`.

Related files worth checking on import:

- `websites/youtube.com.css` — watch page, feed, theater, player, chat
- `websites/music.youtube.com.css` — YouTube Music
- `websites/studio.youtube.com.css` — YouTube Studio
- `css-mapping.json` — domain aliases
- `styles.json` — generated feature index (do not edit; GitHub Actions rebuilds it)

In **zeninternet**, YouTube-specific JS (not CSS) lives in `content-script.js` — notably `MovableLiveChat`. This repo already has a Chromium port in `scripts/content-script.js`.

## How to import a mod

1. Fetch the current upstream CSS/JS for that feature.
2. Split it into a focused file under `styles/` (or JS in `scripts/` if behavior cannot be CSS).
3. **Chromium-adapt** — do not paste Firefox/Zen CSS verbatim:
   - Flatten nested `&` selectors (this repo forbids them; see `tests/css-compat.test.js`).
   - Drop `@-moz-document` and Firefox-only `scrollbar-width`.
   - Prefer `ytd-watch-flexy[theater]` / `[fullscreen]` over Zen's `[data-title-no-tooltip="…"]` button-title selectors.
   - Use `html[dark]` instead of `prefers-color-scheme` when YouTube already exposes a dark attribute.
   - Skip Zen **page/browser transparency** (`yt-Transparency`, transparent video/header backgrounds). Chromium cannot expose the browser chrome backdrop; this project already excludes that on purpose.
4. Wire the feature:
   - `styles/<id>.css`
   - `FEATURES` (or theater/feed parts) in `scripts/content-script.js`
   - matching defaults in `scripts/background.js` and `scripts/popup.js`
   - `FEATURE_META` entry (title, description, category, `defaultEnabled`, and `site` — defaults to `youtube`)
   - If it is a new website, add it to `SITE_META` in `scripts/sites.js` (id, title, hostnames, icon) and a matching icon in `scripts/icons.js`
   - Add a site icon at `docs/sites/<id>.svg` (plain brand mark, same as the popup)
   - `web_accessible_resources` already covers `styles/*.css`
5. Add/adjust a test in `tests/css-compat.test.js` for the new module.
6. Keep MIT attribution; CSS is derived from my-internet.
7. Regenerate the README from live metadata: `npm run readme` (`scripts/generate-readme.mjs` reads `FEATURE_META`, `SITE_META`, and `manifest.json`).

## Already ported (do not duplicate)

Theater, immersive search, feed layout, compact/clean/hide side guide, hide filter chips, player blur, thumbnail hover, hide distractions, disable ambient mode, better captions, overlay live chat, movable live chat, YouTube TV.

GitHub: immersive search, hover sidebars, no tab text, repo sidebar hover, hide footer, hide toolbar separator, glass effect, softer borders, remove button borders, timeline badges, chip spacing.

Google Search: immersive search zoom, glass search bar, solid overlays, softer chrome, hover filter chips. Skip `google-transparency`.

DuckDuckGo: immersive search, immersive popups, glass surfaces, animations, clean decorations, hide Learn more, hide homepage hero, hide feedback, hide footer. Skip `ddg-Transparency` and `ddg-Transparent Header`.

Upstream features **not** ported yet (candidates): `yt-early New To You chip`, `yt-Keep player shadow`, `yt-Addon : Viewstats`, `yt-Addon : timed comments`, YouTube Music (`music.youtube.com.css`), Studio (`studio.youtube.com.css`). Transparency variants stay excluded.
