(function () {
  const btn = document.getElementById("download-btn");
  const meta = document.getElementById("release-meta");
  const sha = document.getElementById("release-sha");
  const icon = document.getElementById("store-icon");

  function formatSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function init() {
    try {
      const res = await fetch("/catalog.json", { cache: "no-store", credentials: "omit" });
      if (!res.ok) throw new Error(`http_${res.status}`);
      const data = await res.json();
      const apps = Array.isArray(data && data.apps) ? data.apps : [];
      const store = apps.find((a) => a && a.appId === "store");
      const rel = store && store.platforms && store.platforms.android;
      if (!store || !rel) throw new Error("missing_store_release");

      if (typeof store.icon === "string" && store.icon.startsWith("/assets/icons/")) {
        icon.src = store.icon;
      }
      if (typeof rel.downloadPath === "string" && rel.downloadPath.startsWith("https://")) {
        btn.href = rel.downloadPath;
      }

      const ver = rel.build ? `v${rel.version}+${rel.build}` : `v${rel.version}`;
      btn.textContent = `Download PNSJY Store APK (${ver})`;

      const size = formatSize(rel.sizeBytes);
      meta.textContent = [ver, size, "Android 8.0+"].filter(Boolean).join(" · ");

      if (typeof rel.sha256 === "string" && /^[0-9a-f]{64}$/i.test(rel.sha256)) {
        sha.textContent = `SHA-256: ${rel.sha256.toLowerCase()}`;
        sha.hidden = false;
      }
    } catch (_) {
      meta.textContent = "Android 8.0+ · Direct APK";
    }
  }

  init();
})();
