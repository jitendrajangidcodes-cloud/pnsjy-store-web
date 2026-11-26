# pnsjy-store-web — Core

## What this is

The headless static catalog, icon CDN, and GitHub Releases APK hub for the PNSJY Store ecosystem (`https://store.pnsjy.in`, GitHub Pages).

The public web storefront UI (`app.html`, `home.js`, `detail.js`, `feedback.js`) has been **retired**.
`index.html` now serves only a minimal, direct **Download PNSJY Store APK** landing page used when users share `https://store.pnsjy.in` from inside the Android Store app.

## Project Files

| File | Purpose |
|------|---------|
| `catalog.json` & `v1/catalog` | Identical JSON catalog consumed by the native PNSJY Store Android app (`https://store.pnsjy.in/v1/catalog` and `/catalog.json`). |
| `assets/icons/<appId>.png` | Static app icons served over HTTPS with content-hash cache busting (`?v=<sha8>`). |
| `scripts/sync-icons.mjs` | Computes 8-char SHA-256 hashes for all icons, updates `catalog.json` and `v1/catalog`, and mirrors icons into `../pnsjy-store-app-private/assets/icons/`. |
| `index.html`, `store-download.js`, `style.css` | Minimal direct Store APK download page for shared links (`https://store.pnsjy.in`). |
| `privacy/` | Privacy policy pages linked from the Store app. |
| `CNAME`, `.nojekyll` | GitHub Pages custom domain config (`store.pnsjy.in`). |

## Architecture - Critical Rules

- **Icon cache busting (Hard Invariant)**: Whenever any app's icon changes, run:
  `node scripts/sync-icons.mjs --app <appId> --from <path-to-png>`
  (or `node scripts/sync-icons.mjs` after overwriting `assets/icons/<appId>.png`).
  This updates `?v=<sha8>` in both `catalog.json` and `v1/catalog` and mirrors the PNG into `pnsjy-store-app-private/assets/icons/`.
- **Headless hub**: No public app catalog UI, no `updates.pnsjy.in` dependency, no inline scripts/styles.
- **Public repo**: Zero credentials or secrets.

## Features

### F1 - Headless Store Catalog & Icon Hub
Serves `catalog.json`, `v1/catalog`, and content-hashed `assets/icons/*.png?v=<sha8>` over GitHub Pages (`store.pnsjy.in`), with APK binaries hosted on GitHub Releases tags.
*Status: VERIFIED*

### F2 - Minimal Shareable Store APK Download Page
`index.html` + `store-download.js` reads only the `store` entry from `/catalog.json` and renders a 1-tap Store APK download card for recipients of shared links (`https://store.pnsjy.in`).
*Status: BUILT-AWAITING-VERIFY*

### F3 - Automated Icon Sync & Content-Hash Cache Busting
`scripts/sync-icons.mjs` stamps `?v=<sha8>` onto every icon URL in `catalog.json` and `v1/catalog` and mirrors icons to `pnsjy-store-app-private`.
*Status: VERIFIED*

### F4 - Public Web Storefront Catalog UI
*Status: RETIRED - replaced by native PNSJY Store Android app + shareable direct APK download link.*
