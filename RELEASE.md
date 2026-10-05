# Releases (site only)

No release publishing happens in this repo any more. APKs and release data live in the update
service (`pnsjy-updates-private`, `https://updates.pnsjy.in`); an app release goes there via the
service's admin API, not here. This file only logs changes to the website itself.

## 2026-10-05 -- Site switched to updates.pnsjy.in

Catalog, versions, sizes, sha256, notes, icons and downloads now come from the update service.
Removed `apps.json`, `releases.json`, the sync scripts, the GitHub Actions workflow, the download
info gate and its Apps Script logger. Added a Content-Security-Policy and textContent-only rendering.
Old GitHub releases and tags were left in place.
