# pnsjy-store-web - Agent Operating Contract

Repo-specific rules only. Architecture and feature registry: `CORE.md`; gotchas: `Learnings.md`.
Global rules live in `all-in-one-private/AGENTS.md` - do not copy them here.

This repo is the **headless catalog, icon, and APK release hub** (`store.pnsjy.in`) for the native
PNSJY Store Android app, plus a minimal direct Store APK download page at `index.html`.
There is NO public web app-store catalog UI here.

## Repo-specific rules

- **Keep `catalog.json` and `v1/catalog` identical**: Both files serve the Android Store app. Never edit one without syncing the other.
- **Always run `node scripts/sync-icons.mjs` after any icon change**: Never hardcode `?v=2` or leave unhashed icon URLs. Every icon URL must carry its 8-char SHA-256 content hash (`?v=<sha8>`) so CDN and Flutter `Image.network` caches bust automatically.
- **Minimal landing page only**: `index.html` must only offer the direct PNSJY Store APK download (reading the `store` entry from `/catalog.json`). Do not expose a public catalog grid or per-app web pages.
- **Strict CSP**: `index.html` has no inline scripts or inline styles. Keep `store-download.js` and `style.css` external.
- **Public repo**: Zero credentials or secrets.
- The native store app source is in `pnsjy-store-app-private`, not here.

## Verify & Deploy

```bash
node scripts/sync-icons.mjs
```
Pushing to `main` deploys via GitHub Pages (`store.pnsjy.in`).
