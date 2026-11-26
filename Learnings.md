# pnsjy-store-web - Learnings

Repo-specific gotchas. Fleet-wide ones live in `~/.claude/Learnings.md`.

## The browser needs CORS on the update service
The site fetches `https://updates.pnsjy.in/v1/catalog` cross-origin. Without
`Access-Control-Allow-Origin: https://store.pnsjy.in` on public GET routes the page shows the
"Could not reach the update server" state. Icons and screenshots are plain `<img>` loads: the
service's `Cross-Origin-Resource-Policy` must allow cross-origin (it sent `same-origin` on error
responses) or they will not render.

## CSP blocks inline everything
The CSP has no `unsafe-inline` for scripts. Theme init lives in `theme-init.js`; page logic in
`home.js` / `detail.js`. Styles are set through the DOM (`el.style.x`), never `style="..."` markup
or `setAttribute("style", ...)`. A new external host needs a CSP update in both HTML files.

## Tolerate missing catalog fields
The service adds metadata (tagline, category, color, beta, about, screenshots...) over time. All of
it is optional in `catalog.js`; a minimal entry (`appId`, `name`, `icon: null`, `platforms: {}`)
must still render. An app with no android build shows "No download yet", never a dead button.

## Retired GitHub-hub gotchas
The old `releases/latest` ambiguity, `releases.json` lag and release-name versioning gotchas no
longer apply; nothing here reads GitHub Releases any more.

## App icon changes did not reflect on PNSJY Store (2026-11-26)
- **Symptom / Trigger**: Updating an app's icon/logo in its own repo and releasing a new APK did not update the icon shown in the PNSJY Store.
- **Root Cause**:
  1. Store icons are static copies in `pnsjy-store-web/assets/icons/<appId>.png` (never auto-extracted from APKs).
  2. `catalog.json` and `v1/catalog` hardcoded static `?v=2` query strings, so CDN/browser HTTP caches and Flutter's `Image.network` URL-keyed cache kept serving the old icon even after overwriting the PNG.
  3. The retired web storefront prioritized `updates.pnsjy.in/v1/catalog` over `/catalog.json`.
  4. `pnsjy-store-app-private` flashed its locally bundled `assets/icons/<appId>.png` while loading the network image.
- **Fix / Resolution**:
  1. Added `scripts/sync-icons.mjs` to copy icons, compute 8-char SHA-256 hashes (`?v=<sha8>`), update both `catalog.json` and `v1/catalog`, and mirror PNGs to `pnsjy-store-app-private/assets/icons/`.
  2. Stripped the retired public web storefront UI down to a headless hub + minimal Store APK download page reading `/catalog.json`.
  3. Updated `AppIcon` in `pnsjy-store-app-private` to show the colored letter tile while loading instead of flashing a stale bundled asset.
- **What NOT to Do / Invariant**: Never hardcode `?v=2` or manually edit only one of `catalog.json` / `v1/catalog`. Always run `node scripts/sync-icons.mjs` when updating any icon.
