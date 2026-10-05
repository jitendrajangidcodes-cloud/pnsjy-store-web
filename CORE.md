# pnsjy-store-web — Core

## What this is

The public static website for the PNSJY app catalog (`store.pnsjy.in`, GitHub Pages). It is a
SITE ONLY: it no longer hosts APKs, a catalog file, or any release data. Everything shown comes
from the update service `https://updates.pnsjy.in` (repo `pnsjy-updates-private`, contract in its
`CLIENT.md`). The native PNSJY Store app also reads from that service; users get the Store APK here
once, then the app updates itself.

## Tech Stack

- Vanilla HTML/CSS/JS, no framework, no build step.
- `catalog.js` is a pure, DOM-free module (browser global `Catalog` + `module.exports`), covered by
  `node:test` in `test/`. Run: `node --test test/catalog.test.js`.
- PWA: `manifest.json` + `sw.js` (network passthrough, installability only).
- Hosting: GitHub Pages (`CNAME`, `.nojekyll`). Push to `main` deploys.
- Feedback: external Cloudflare Worker (`pnsjy-store-feedback-worker`), Turnstile + honeypot.

## Project Files

| File | Purpose |
|------|---------|
| `index.html`, `app.html` | Catalog page and per-app page. Each carries the CSP meta tag. |
| `catalog.js` | Pure mapping/validation of `GET /v1/catalog`, URL building, formatting, filters. |
| `script.js` | Shared UI: DOM helper `h()`, catalog fetch (12s timeout), icon/tiles, theme, PWA prompt. |
| `home.js`, `detail.js` | Page logic for index and app pages. Server strings go in via `textContent` only. |
| `theme-init.js` | Sets the theme before paint (external file because the CSP forbids inline script). |
| `feedback.js` | Feedback modal to the Worker. Static template only. |
| `style.css` | Styling + design tokens in `:root` (mirrored by the Flutter store app). |
| `test/catalog.test.js` | Unit tests for `catalog.js`. |
| `assets/brand`, `assets/icons/icon-*.png`, `apple-touch-icon.png` | Brand mark + PWA icons. Per-app icons and screenshots now come from the service; the old per-app files under `assets/icons/` and `assets/screenshots/` are unused leftovers. |
| `mailkeep-privacy.html` | Mailkeep privacy policy (own strict CSP). |

## Data contract used

`GET https://updates.pnsjy.in/v1/catalog` (anonymous = public apps only). Per app: `appId`, `name`,
`icon` (service path or null), `platforms{android:{version,build,notes,sizeBytes,sha256,...}}` plus
the metadata fields `tagline, category, color, beta, requiresAccount, packageId, about,
requirements, screenshots[]`. Every metadata field is optional; missing ones are skipped in the UI.
Download button: `https://updates.pnsjy.in/v1/apps/<id>/download?platform=android`. The Store app
is the catalog entry with `appId = store`.

## Architecture - Critical Rules

- Never render a server string with `innerHTML`; use `textContent` / `h()`. URLs from the server
  must pass `Catalog.serviceUrl` (service-only), colors and hashes are regex-validated.
- CSP allows only self, `updates.pnsjy.in`, the feedback Worker, Turnstile and Google Fonts. Any new
  external host needs a CSP edit in BOTH HTML files.
- No inline scripts or event handlers; no calls to api.github.com or GitHub Releases.
- Never show or hint at admin-only or code-gated apps: the site only uses the anonymous catalog.
- Public repo: zero credentials. Turnstile site key and Worker URL are public by design.
- Design tokens live once in `style.css` `:root`.

## Features

Authoritative registry. Add an entry BEFORE building. Never remove entries — mark final status.
Status: `BUILT-AWAITING-VERIFY` / `VERIFIED` / `PENDING USER DECISION` / `NOT BUILDING`.
Migrated from the former `features.md` + `progress.txt`; historical per-phase build notes live in
git history.

### F1 - App catalog from the update service
Site lists every public app from `GET /v1/catalog`, per-app pages, offline/error state with retry.
*Status: BUILT-AWAITING-VERIFY (needs the service CORS change deployed for a real browser check)*

### F2 - Live version / size / sha256 / notes per app
Taken from the catalog `platforms.android` release; no GitHub calls.
*Status: BUILT-AWAITING-VERIFY*

### F3 - Light/dark theme, glass + glow design
*Status: VERIFIED*

### F4 - PWA install support
*Status: BUILT-AWAITING-VERIFY*

### F5 - BETA badge and Beta filter
Driven by the catalog `beta` flag.
*Status: BUILT-AWAITING-VERIFY*

### F6 - Single-repo GitHub hub (APKs in Releases, apps.json, releases.json, sync workflow)
*Status: RETIRED - replaced by updates.pnsjy.in; files deleted from the tree. Old GitHub releases and tags are left in place, untouched.*

### F7 - Direct-to-hub publishing pattern
*Status: RETIRED - apps publish to the update service.*

### F8 - Direct in-site feedback to auto-filed GitHub issue
Modal posts to the Cloudflare Worker; falls back to a prefilled issue link.
*Status: BUILT-AWAITING-VERIFY*

### F9 - Download logging via Apps Script + info gate
*Status: RETIRED - the gate and Apps Script logger were removed (incompatible with the strict CSP; downloads are now direct links).*

### F10 - Get the PNSJY Store app CTA
Primary download button on the home page, from the `store` catalog entry, with sha256.
*Status: BUILT-AWAITING-VERIFY*

### F11 - Star ratings
*Status: NOT BUILDING - needs a database; deferred by decision.*

### F12 - Strict security posture
CSP meta tag, textContent-only rendering, no inline handlers, rel=noopener on external links.
*Status: BUILT-AWAITING-VERIFY*
