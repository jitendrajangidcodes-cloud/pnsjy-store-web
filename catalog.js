(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Catalog = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const SERVICE = "https://updates.pnsjy.in";
  const ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
  const COLOR_RE = /^#[0-9a-f]{6}$/i;
  const SHA_RE = /^[0-9a-f]{64}$/i;

  function serviceUrl(path) {
    if (typeof path !== "string") return null;
    if (path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")) return SERVICE + path;
    if (path.startsWith(SERVICE + "/")) return path;
    return null;
  }

  function downloadUrl(appId, platform) {
    return `${SERVICE}/v1/apps/${encodeURIComponent(appId)}/download?platform=${encodeURIComponent(platform || "android")}`;
  }

  function str(v) {
    return typeof v === "string" ? v : "";
  }

  function mapRelease(r) {
    if (!r || typeof r !== "object") return null;
    const version = str(r.version);
    if (!version) return null;
    return {
      version,
      build: Number.isFinite(r.build) ? r.build : null,
      notes: str(r.notes),
      sizeBytes: Number.isFinite(r.sizeBytes) && r.sizeBytes > 0 ? r.sizeBytes : null,
      sha256: SHA_RE.test(str(r.sha256)) ? r.sha256.toLowerCase() : null,
      createdAt: Number.isFinite(r.createdAt) ? r.createdAt : null,
    };
  }

  function pickRelease(platforms) {
    if (!platforms || typeof platforms !== "object") return null;
    return mapRelease(platforms.android) || mapRelease(platforms["android-mobile"]);
  }

  function otherPlatforms(platforms) {
    if (!platforms || typeof platforms !== "object") return [];
    return Object.keys(platforms).filter(
      (k) => !k.startsWith("android") && /^[a-z-]{2,20}$/.test(k) && mapRelease(platforms[k]),
    );
  }

  function mapScreenshots(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const s of list) {
      const src = serviceUrl(typeof s === "string" ? s : s && s.src);
      if (src) out.push({ src, alt: (s && str(s.alt)) || "" });
    }
    return out;
  }

  function mapApp(raw) {
    if (!raw || typeof raw !== "object" || !ID_RE.test(str(raw.appId))) return null;
    const name = str(raw.name).trim() || raw.appId;
    return {
      id: raw.appId,
      name,
      iconUrl: serviceUrl(raw.icon),
      tagline: str(raw.tagline),
      category: str(raw.category) || "App",
      color: COLOR_RE.test(str(raw.color)) ? raw.color : null,
      beta: raw.beta === true,
      requiresAccount: typeof raw.requiresAccount === "boolean" ? raw.requiresAccount : null,
      packageId: str(raw.packageId),
      about: str(raw.about),
      requirements: str(raw.requirements),
      screenshots: mapScreenshots(raw.screenshots),
      release: pickRelease(raw.platforms),
      otherPlatforms: otherPlatforms(raw.platforms),
    };
  }

  function mapCatalog(json) {
    if (!json || !Array.isArray(json.apps)) throw new Error("bad_catalog");
    return json.apps.map(mapApp).filter(Boolean);
  }

  function kindOf(app) {
    return app.category.toLowerCase() === "games" ? "game" : "app";
  }

  function matchesFilter(app, filter) {
    if (filter === "all") return true;
    if (filter === "beta") return app.beta;
    return kindOf(app) === filter;
  }

  function formatSize(bytes) {
    if (!bytes) return "--";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatVersion(release) {
    return release.build !== null ? `${release.version}+${release.build}` : release.version;
  }

  function accountStat(apps) {
    const known = apps.filter((a) => a.requiresAccount !== null);
    if (known.length === 0) return null;
    const free = known.filter((a) => !a.requiresAccount).length;
    return { free, total: known.length };
  }

  return {
    SERVICE, serviceUrl, downloadUrl, mapRelease, pickRelease, mapApp, mapCatalog,
    kindOf, matchesFilter, formatSize, formatVersion, accountStat,
  };
});
