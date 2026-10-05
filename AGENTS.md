# pnsjy-store-web - Agent Operating Contract

Repo-specific rules only. Architecture and feature registry: `CORE.md`; gotchas: `Learnings.md`;
in-flight work: `progress.txt` (when present). Global rules live in `~/.claude/` - do not copy them here.

This repo is the public website only (`store.pnsjy.in`). It is NOT a release hub: APKs and release
data live in the update service `https://updates.pnsjy.in` (`pnsjy-updates-private`, `CLIENT.md`).

## Repo-specific rules

- The catalog is whatever `GET /v1/catalog` returns anonymously. Never list an app in this repo,
  and never show or hint at admin-only or code-gated apps.
- Server-provided strings render via `textContent` / `h()` only. No `innerHTML` with data, no inline
  scripts or handlers, external links carry `rel="noopener noreferrer"`.
- Keep the CSP meta tag (both `index.html` and `app.html`) in step with any new external host.
- No calls to api.github.com or GitHub Releases; no `apps.json` / `releases.json`.
- Public repo: no credentials. The Turnstile site key and Worker URL in `feedback.js` are public by design.
- Design tokens live once in `style.css` `:root`; the Flutter store app mirrors them.
- The native store app source is in `pnsjy-store-app-private`, not here.

## Build, test, deploy

Nothing to compile. Test: `node --test test/catalog.test.js`. Local preview:
`python3 -m http.server 8765`. Pushing to `main` deploys via GitHub Pages.
