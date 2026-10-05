# Jitendra - App Store

**Live site: https://store.pnsjy.in**

A personal catalog of apps built by Jitendra, browsable and installable directly - no store
review, no accounts. Download the **PNSJY Store** Android app here once; it then installs and
updates every listed app and keeps itself up to date.

## How it works

This repo is a static website only. The catalog, versions, sizes, SHA-256 checksums, release notes,
icons and APK downloads are all served by our own update service, `https://updates.pnsjy.in`
(`GET /v1/catalog`, `GET /v1/apps/<id>/download?platform=android`). Only public apps appear. There
is no release publishing, catalog file or CI sync in this repo.

Security: the page has a strict Content-Security-Policy, renders server data as plain text only,
and holds no credentials. Each download shows its SHA-256 so it can be checked after downloading.

## Development

- Preview: `python3 -m http.server 8765`
- Test: `node --test test/catalog.test.js`
- See `AGENTS.md`, `CORE.md`, `Learnings.md`.
