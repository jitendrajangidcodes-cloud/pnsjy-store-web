const test = require("node:test");
const assert = require("node:assert");
const C = require("../catalog.js");

const SHA = "a".repeat(64);
const rel = { version: "1.2.0", build: 3, notes: "n", sizeBytes: 2097152, sha256: SHA, createdAt: 1700000000000 };

test("maps a full catalog entry", () => {
  const [a] = C.mapCatalog({ apps: [{
    appId: "reminder", name: "Reminder", icon: "/v1/apps/reminder/icon", tagline: "t", category: "Tools",
    color: "#2f7ee3", beta: true, requiresAccount: false, packageId: "p.q", about: "a", requirements: "r",
    screenshots: ["/v1/apps/reminder/screenshots/1", { src: "/s/2", alt: "two" }],
    platforms: { android: rel, linux: rel },
  }] });
  assert.strictEqual(a.iconUrl, "https://updates.pnsjy.in/v1/apps/reminder/icon");
  assert.strictEqual(a.beta, true);
  assert.strictEqual(a.screenshots.length, 2);
  assert.strictEqual(a.screenshots[1].alt, "two");
  assert.strictEqual(a.release.sha256, SHA);
  assert.deepStrictEqual(a.otherPlatforms, ["linux"]);
});

test("tolerates a minimal entry with no metadata and no release", () => {
  const [a] = C.mapCatalog({ apps: [{ appId: "cards", name: "Cards", icon: null, platforms: {} }] });
  assert.strictEqual(a.iconUrl, null);
  assert.strictEqual(a.release, null);
  assert.strictEqual(a.tagline, "");
  assert.strictEqual(a.category, "App");
  assert.strictEqual(a.requiresAccount, null);
  assert.deepStrictEqual(a.screenshots, []);
});

test("rejects foreign or unsafe URLs, colors, ids and hashes", () => {
  assert.strictEqual(C.serviceUrl("https://evil.example/x.png"), null);
  assert.strictEqual(C.serviceUrl("//evil.example/x.png"), null);
  assert.strictEqual(C.serviceUrl("javascript:alert(1)"), null);
  assert.strictEqual(C.serviceUrl("/\\evil.example"), null);
  const [a] = C.mapCatalog({ apps: [
    { appId: "ok", color: "red;background:url(x)", platforms: { android: { ...rel, sha256: "zz" } } },
    { appId: "../bad" }, null, { name: "no id" },
  ] });
  assert.strictEqual(a.color, null);
  assert.strictEqual(a.release.sha256, null);
});

test("android-mobile is used when android is missing", () => {
  assert.strictEqual(C.pickRelease({ "android-mobile": rel }).version, "1.2.0");
  assert.strictEqual(C.pickRelease({ linux: rel }), null);
});

test("bad catalog shape throws", () => {
  assert.throws(() => C.mapCatalog({}));
  assert.throws(() => C.mapCatalog(null));
});

test("download url is fixed to the service and encoded", () => {
  assert.strictEqual(C.downloadUrl("store", "android"), "https://updates.pnsjy.in/v1/apps/store/download?platform=android");
  assert.ok(!C.downloadUrl("a/b").includes("a/b"));
});

test("filters, sizes, versions", () => {
  const g = C.mapApp({ appId: "g", category: "Games", beta: true });
  const t = C.mapApp({ appId: "t" });
  assert.ok(C.matchesFilter(g, "game") && !C.matchesFilter(t, "game"));
  assert.ok(C.matchesFilter(g, "beta") && !C.matchesFilter(t, "beta"));
  assert.ok(C.matchesFilter(t, "all"));
  assert.strictEqual(C.formatSize(2097152), "2.0 MB");
  assert.strictEqual(C.formatSize(null), "--");
  assert.strictEqual(C.formatVersion({ version: "1.0.0", build: 4 }), "1.0.0+4");
  assert.deepStrictEqual(C.accountStat([t, C.mapApp({ appId: "x", requiresAccount: false })]), { free: 1, total: 1 });
  assert.strictEqual(C.accountStat([t]), null);
});
