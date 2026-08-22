# Agent notes

This Chrome MV3 extension (**ChroMods**) ports [sameerasw](https://github.com/sameerasw)'s website theming to Chromium. It currently covers YouTube, YouTube Music, GitHub, Google Search, DuckDuckGo, Gmail, Gemini, X, Twitch, and ChatGPT, and can grow to other sites. When the user asks to import or refresh a theming mod, **fetch the latest files from the upstream repos** — do not rely on memory of their CSS.

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
2. Split it into a focused file under `styles/<site>/` (or JS in `scripts/` if behavior cannot be CSS).
3. **Chromium-adapt** — do not paste Firefox/Zen CSS verbatim:
   - Flatten nested `&` selectors (this repo forbids them; see `tests/css-compat.test.js`).
   - Drop `@-moz-document` and Firefox-only `scrollbar-width`.
   - Prefer `ytd-watch-flexy[theater]` / `[fullscreen]` over Zen's `[data-title-no-tooltip="…"]` button-title selectors.
   - Use `html[dark]` instead of `prefers-color-scheme` when YouTube already exposes a dark attribute.
   - Skip Zen **page/browser transparency** (`yt-Transparency`, transparent video/header backgrounds). Chromium cannot expose the browser chrome backdrop; this project already excludes that on purpose. Drop only transparent page-background *rules*. If a `/* …transparency */` block also has layout, radius, or hide-element CSS, keep those (flatten nested `&` selectors).
4. Wire the feature:
   - `styles/<site>/<id>.css`
   - `FEATURES` (or theater/feed parts) in `scripts/content-script.js`
   - matching defaults in `scripts/background.js` and `scripts/popup.js`
   - `FEATURE_META` entry (title, description, category, `defaultEnabled`, and `site` — defaults to `youtube`)
   - If it is a new website, add it to `SITE_META` in `scripts/sites.js` (id, title, hostnames, icon) and a matching icon in `scripts/icons.js`
   - Add a site icon at `docs/sites/<id>.svg` (plain brand mark, same as the popup)
   - Add the host to `manifest.json` theming `content_scripts` `matches` and `web_accessible_resources` matches
   - `web_accessible_resources` already covers `styles/*/*.css`
5. Add/adjust a test in `tests/css-compat.test.js` for the new module.
6. Keep MIT attribution; CSS is derived from my-internet.
7. Regenerate the README from live metadata: `npm run readme` (`scripts/generate-readme.mjs` reads `FEATURE_META`, `SITE_META`, and `manifest.json`). Do not hand-edit `README.md`. The generator builds the site tagline, table, sections, and install line from `SITE_META`.

## Already ported (do not duplicate)

Theater, immersive search, feed layout, compact/clean/hide side guide, hide filter chips, player blur, fullscreen transition, thumbnail hover, hide distractions, disable ambient mode, better captions, overlay live chat, movable live chat, YouTube TV.

YouTube Music: sticky queue — docks the player page's `#side-panel` as a right-hand rail while `ytmusic-app-layout` has `player-visible` but not `player-page-open`. The CSS is driven by the `StickyQueue` controller in `scripts/content-script.js`, not by the layout's own attributes: it puts `ytm-queue-docked` / `-collapsed` / `-resizing` / `-animated` on `<html>` and sets `--chromods-ytm-queue-width` inline on `documentElement`, so the rail never flashes at the default width before the stored one loads. The rail resizes by dragging `.ytm-queue-handle` (or arrow keys / Home on it), collapses via `.ytm-queue-toggle`, and auto-collapses when the window has no room for even the narrowest rail beside the guide and a readable browse column — the last of which the popup's `ytmusicQueue.autoCompact` subsetting turns off. Width and collapsed state live in `chrome.storage.local` under `chroModsYtmQueueWidth` / `chroModsYtmQueueCollapsed` and sync across tabs.

Two things there are easy to get wrong. The remembered width is the user's own request, clamped only to the mod's bounds; the window's ceilings (a share of the viewport, and the room the browse column needs) are applied at render time, so a stint in a narrow window does not forget how wide they like it. And the auto-collapse ignores the chosen width on purpose — deriving it from the rail's width made dragging the rail wider the thing that tucked it away.

`music.youtube.com` is its own site id (`ytmusic`), and `matchSiteFromHostname` resolves it by longest matching hostname — do not rely on `SITE_META` order.

GitHub: immersive search, hover sidebars, no tab text, repo sidebar hover, hide footer, hide toolbar separator, glass effect, softer borders, remove button borders, timeline badges, chip spacing.

Google Search: immersive search zoom, glass search bar, solid overlays, softer chrome, hover filter chips. Skip `google-transparency`.

Gmail: no borders, hide extras, preview restyle, glass inbox, rounded corners, soft loading. Skip `gmail-transparency` and Dark Reader.

Gemini: clean composer, cleaner chat, hover chrome, glass input/code. Skip `gemini-transparency`.

X: solid overlays, sticky header, hover sidebars, hide Premium. Applies to `x.com` and `twitter.com`. Skip `x-transparency` / `twtr-transparency`.

DuckDuckGo: immersive search, immersive popups, glass surfaces, animations, clean decorations, hide Learn more, hide homepage hero, hide feedback, hide footer. Skip `ddg-Transparency` and `ddg-Transparent Header`.

Twitch: hide footer, movable live chat. Skip `twitch-transparency`.

ChatGPT: sidebar glass, header actions, composer, message bubbles, code panels, flyouts, popovers, library surfaces, decorative splash, fallback, reduced motion, hide hint. Skip `cgpt-transparency`.

Upstream features **not** ported yet (candidates): `yt-early New To You chip`, `yt-Keep player shadow`, `yt-Addon : Viewstats`, `yt-Addon : timed comments`, the rest of `music.youtube.com.css` (hover sidebar, centered player, player bar styling, mini player), Studio (`studio.youtube.com.css`). Transparency variants stay excluded.

## Browser-only behaviour

Some mods cannot be verified by reading the CSS, because Chromium's own cascade decides the outcome:

- A UA `!important` declaration outranks inline styles, author `!important`, and Web Animations. This is why the fullscreen transition scales an inner box on the way in: `transform` on the fullscreen element itself is dropped (`tests/fullscreen.e2e.mjs` guards it).
- The YouTube Music queue rail has to beat an inline `visibility: hidden` (`tests/ytmusic.e2e.mjs` guards it).
- That rail is also parked a viewport below where it belongs, so a `transition` on the docked rule slides it up the screen on every page load. The transitions live behind `ytm-queue-animated`, which `StickyQueue` adds a paint after docking.
- Polymer builds `ytmusic-app-layout` with `player-visible` already set and then inserts it, so an attribute `MutationObserver` never sees the state arrive. `StickyQueue.scheduleSettle()` re-checks on a few timers and on `yt-navigate-finish`; do not replace it with a document-wide `childList` observer.

Both tests serve a local fixture for the real hostname through Playwright routing, so they run offline with no account. They need `npx playwright install chromium`, and extensions only load in headed Chromium (`xvfb-run` on a headless box). Chromium throttles transitions in a background tab, so bring a page to the front before measuring anything mid-animation.

## GitHub issue auto-port

`.github/workflows/issue-triage.yml` runs on new GitHub issues (and on `workflow_dispatch`). It classifies `[STYLE] host` requests:

- **Simple:** upstream CSS exists in my-internet and is not transparency-only, and the host is not already an exact `SITE_META` hostname. A Cursor Cloud Agent is launched with `autoCreatePR` — it must open a PR, never push to `main`. The agent must run `npm run readme` (no hand-edited README), skip transparent page-background *rules* (not entire mixed comment blocks), and fail the PR if `npm test` fails.
- **Complex:** anything else (bugs, no upstream CSS, JS/player work). Label `NeedsAttention`.

Requires repo secret `CURSOR_API_KEY` from the Cursor dashboard. Idempotency label: `auto-pr`.
