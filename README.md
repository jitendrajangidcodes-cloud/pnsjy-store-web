# PNSJY Store Hub (`store.pnsjy.in`)

Headless static catalog, icon CDN, and APK release hub for the native **PNSJY Store** Android app.

- **Direct Store APK download**: `https://store.pnsjy.in`
- **Catalog endpoints**: `https://store.pnsjy.in/v1/catalog` and `https://store.pnsjy.in/catalog.json`
- **Icon sync & cache-busting**:
  ```bash
  node scripts/sync-icons.mjs --app <appId> --from <path-to-icon.png>
  ```
