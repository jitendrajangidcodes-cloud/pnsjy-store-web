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
