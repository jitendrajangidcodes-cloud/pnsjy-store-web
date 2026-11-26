#!/usr/bin/env node
/**
 * Syncs app icons and updates cache-busting content hashes (?v=<sha8>)
 * across both catalog.json and v1/catalog, plus mirrors updated icons into
 * ../pnsjy-store-app-private/assets/icons/ when that repo is present.
 *
 * Usage:
 *   node scripts/sync-icons.mjs
 *   node scripts/sync-icons.mjs --app reminder --from ../reminder-app-private/assets/icon.png
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const iconsDir = path.join(repoRoot, "assets", "icons");
const storeAppIconsDir = path.resolve(repoRoot, "..", "pnsjy-store-app-private", "assets", "icons");
const catalogPaths = [
  path.join(repoRoot, "catalog.json"),
  path.join(repoRoot, "v1", "catalog"),
];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--app" && argv[i + 1]) out.app = argv[++i];
    else if (argv[i] === "--from" && argv[i + 1]) out.from = argv[++i];
  }
  return out;
}

function sha8(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
}

const args = parseArgs(process.argv.slice(2));

if (args.app || args.from) {
  if (!args.app || !args.from) {
    console.error("Both --app <appId> and --from <sourcePngPath> are required.");
    process.exit(1);
  }
  const src = path.resolve(args.from);
  if (!fs.existsSync(src)) {
    console.error(`Source icon not found: ${src}`);
    process.exit(1);
  }
  const dest = path.join(iconsDir, `${args.app}.png`);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}

const primaryPath = catalogPaths[0];
const catalog = JSON.parse(fs.readFileSync(primaryPath, "utf8"));
if (!catalog || !Array.isArray(catalog.apps)) {
  console.error("Invalid catalog.json format.");
  process.exit(1);
}

let updatedCount = 0;
let mirroredCount = 0;
const canMirror = fs.existsSync(storeAppIconsDir);

for (const app of catalog.apps) {
  if (!app || typeof app.appId !== "string") continue;
  const iconFile = path.join(iconsDir, `${app.appId}.png`);
  if (!fs.existsSync(iconFile)) {
    console.warn(`Warning: missing icon file for ${app.appId} (${iconFile})`);
    continue;
  }

  const hash = sha8(iconFile);
  const nextUrl = `/assets/icons/${app.appId}.png?v=${hash}`;
  if (app.icon !== nextUrl) {
    console.log(`${app.appId}: ${app.icon || "(none)"} -> ${nextUrl}`);
    app.icon = nextUrl;
    updatedCount++;
  }

  if (canMirror) {
    const mirrorPath = path.join(storeAppIconsDir, `${app.appId}.png`);
    const srcBuf = fs.readFileSync(iconFile);
    const same = fs.existsSync(mirrorPath) && Buffer.compare(srcBuf, fs.readFileSync(mirrorPath)) === 0;
    if (!same) {
      fs.writeFileSync(mirrorPath, srcBuf);
      mirroredCount++;
    }
  }
}

const serialized = JSON.stringify(catalog, null, 2) + "\n";
for (const p of catalogPaths) {
  fs.writeFileSync(p, serialized, "utf8");
}

console.log(`Done. Updated ${updatedCount} icon URL(s) in catalog.json & v1/catalog; mirrored ${mirroredCount} icon(s) to pnsjy-store-app-private.`);
