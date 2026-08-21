# Shipping ChroMods

Two distribution paths, and it is worth being blunt about the difference.

## What Chromium actually allows

| Path | Install | Updates | Cost |
|------|---------|---------|------|
| Chrome Web Store | One click, "Add to Chrome" | Silent and automatic | One-time $5 developer registration, plus review on each submission |
| Unpacked folder | Run the installer, then Developer mode → Load unpacked | Re-run the installer, then **Reload ChroMods** in the popup | Free, no review |

There is no third option. Directly installing a `.crx` from outside the store has
been blocked on Windows since Chrome 33 and on macOS since Chrome 44, and a
self-hosted `update_url` only works through the `ExtensionSettings` enterprise
policy, which needs administrator access on every machine. Linux can still side-load
a local CRX through a preferences file, but that helps a fraction of users and does
nothing for the other two platforms.

So the store is the only genuinely one-click, self-updating option, and everything
else in this repo exists to make the unpacked path as short as it can be.

## Cutting a release

```bash
npm run release -- patch        # or minor / major / an explicit 1.6.0
npm test
git commit -am "chore: release v1.6.0"
git tag v1.6.0
git push --follow-tags
```

`npm run release -- patch --tag` does the commit and tag for you.

Pushing the tag runs `.github/workflows/release.yml`, which tests, checks the README
is regenerated, refuses a tag that disagrees with `manifest.json`, packages
`dist/chromods-<version>.zip`, and publishes it as a GitHub release. The popup's
update checker reads that release: `tag_name` is the version it compares against and
the ZIP asset is what its **download** link points at. Until the first release exists,
the checker falls back to `manifest.json` on `main`, so `main` is always a valid
install source.

## Turning on the Chrome Web Store path

The release workflow already has the upload step; it skips itself while the secrets
are missing. To enable it:

1. Register as a Chrome Web Store developer and create the item once by uploading
   `dist/chromods-<version>.zip` by hand. Note the extension ID.
2. Create a Google Cloud project, enable the **Chrome Web Store API**, and make an
   OAuth client of type *Desktop app*.
3. Get a refresh token for that client with the
   `https://www.googleapis.com/auth/chromewebstore` scope.
4. Add repository secrets `CWS_EXTENSION_ID`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`,
   and `CWS_REFRESH_TOKEN`.

After that, every `v*` tag uploads and publishes automatically. Set `CWS_TARGET` to
`trustedTesters` in the workflow env to stage a submission instead of publishing it.

Two things reviewers will ask about, worth having answers ready for: the
`<all_urls>` host permission (the forced dark mode applies to any site the user
turns it on for) and the bundled Dark Reader engine (vendored at
`scripts/vendor/darkreader.js`, not fetched at runtime).

## The install page

`docs/` is a GitHub Pages site: `docs/index.html` detects the visitor's OS, shows the
matching one-liner with a copy button, and spells out the three clicks that follow.
Turn it on under **Settings → Pages → Deploy from a branch → `main` / `/docs`**, then
link it from the repository description.
