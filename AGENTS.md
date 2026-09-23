# pnsjy-store-web — Agent Operating Contract

Repo-specific rules and overrides only. Architecture/tech-stack reference and the feature
registry live in `CORE.md`, gotchas in `Learnings.md`, current task state in `progress.txt` (when present).
Do not re-paste global rules from `~/.claude/CLAUDE.md` / `~/.claude/AGENTS.md` — reference them.

This repo IS the public app-store hub described in `~/.claude/CORE.md` → "App Release
Distribution". Read that section before changing anything about how releases flow.

## Repo-specific rules

- **`apps.json` is the ONE source of truth for what is listed.** Adding an entry there is the only
  way an app appears on the website AND in the PNSJY Store app. Never list an app anywhere else.
- **`releases.json` is generated, never hand-edited.** It is rebuilt by the `sync-releases`
  workflow (`scripts/build-manifest.mjs`). Editing it by hand is overwritten on the next run.
- **This is a public repo — no credentials, ever.** The signing keystore (`*.jks`/`*.keystore`)
  and `key.properties` are gitignored; never commit them. CI uses only the built-in `GITHUB_TOKEN`
  (writes this repo, reads source repos unauthenticated). The Turnstile SITE key and Worker URL in
  `feedback.js` are public by design; the secret half lives in the Cloudflare Worker only.
- **Design tokens are defined once in `style.css` `:root`.** The Flutter store app (in
  `pnsjy-store-app-private`) mirrors them in its `lib/theme/`. Keep the two in sync when either
  changes.
- **The BETA badge is driven by an explicit `"beta": true|false` field in `apps.json`**, decoupled
  from `category`. `index.html` and `app.html` read `app.beta`, not `category === "Beta"`.
- The native store app source lives in `pnsjy-store-app-private`; it is NOT in this repo. This
  repo is website + release hub only.

## Build & Deploy

There is nothing to compile — this is a static GitHub Pages site served at `store.pnsjy.in`
(see `CNAME`). Pushing to `main` deploys.

- **Regenerate the manifest locally** (needs network + `gh` auth):
  `bash scripts/sync-releases.sh && node scripts/build-manifest.mjs`, then inspect `releases.json`.
- **Trigger the hub rebuild remotely:** `gh workflow run sync-releases.yml --repo
  jitendrajangidcodes-cloud/pnsjy-store-web`. An app's `scripts/release.sh` kicks this at the end of
  every release so the site/store pick up the new version without waiting for the 30-min cron.
- **Publishing an app's release into the hub** is done from the app's own repo (its
  `scripts/release.sh`), not here — see
  `~/.claude/CORE.md` → "Canonical per-app release script".
