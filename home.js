(function () {
  const $ = (id) => document.getElementById(id);
  let activeFilter = "all";
  let apps = [];

  function appCard(app) {
    const rel = app.release;
    const ribbon = app.beta ? h("span", { class: "beta-ribbon", text: "BETA" }) : null;
    const isStore = app.id === "store";
    const accountChip = h("div", { class: "badge-row" }, [
      h("span", {
        class: "chip-static plain",
        text: isStore ? "Fleet Installer" : "Requires Google sign-in",
      }),
    ]);
    const card = h("a", {
      class: "app-card",
      href: `app.html?id=${encodeURIComponent(app.id)}`,
      data: { kind: Catalog.kindOf(app), beta: String(app.beta) },
    }, [
      ribbon,
      h("div", { class: "row1" }, [appIcon(app, 58), h("div", { class: "titles" }, [h("h3", { text: app.name })])]),
      app.tagline ? h("p", { class: "tagline", text: app.tagline }) : null,
      h("div", { class: "badge-row" }, [
        h("span", {
          class: "pill-download",
          text: isStore
            ? (rel ? `Download Store · v${rel.version}` : "Store APK")
            : (rel ? `v${rel.version} · PNSJY Store` : "In PNSJY Store"),
        }),
        h("span", { class: "meta", text: isStore ? "Installer · Android" : `${app.category} · Store only` }),
      ]),
      accountChip,
    ]);
    attachTilt(card);
    return card;
  }

  function renderGrid() {
    const grid = $("app-grid");
    const shown = apps.filter((a) => Catalog.matchesFilter(a, activeFilter));
    grid.replaceChildren(...shown.map(appCard));
    $("app-count").textContent = activeFilter === "beta" ? `${shown.length} in testing` : `${shown.length} published`;
    if (shown.length === 0) grid.append(h("div", { class: "empty-state", text: "Nothing here yet." }));
  }

  function renderStats() {
    const big = $("stat-accounts");
    const sub = $("stat-accounts-sub");
    big.textContent = `${apps.length} apps`;
    sub.textContent = "available via PNSJY Store";
  }

  function renderStoreCta() {
    const slot = $("store-download");
    const meta = $("store-meta");
    const store = apps.find((a) => a.id === "store");
    if (!store || !store.release) {
      slot.textContent = "Store APK not published yet";
      meta.textContent = "Check back soon";
      return;
    }
    const link = downloadLink("store", store.release, `Download Store APK · v${store.release.version}`);
    link.id = "store-download";
    slot.replaceWith(link);
    meta.replaceChildren(
      document.createTextNode(`${Catalog.formatSize(store.release.sizeBytes)} · Android 8+ · direct APK`),
      ...(store.release.sha256 ? [h("br"), shaLine(store.release)] : []),
    );
  }

  function wireFilters() {
    const pills = document.querySelectorAll(".cat-pill");
    pills.forEach((pill) =>
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        activeFilter = pill.dataset.cat;
        renderGrid();
      }),
    );
  }

  async function init() {
    const grid = $("app-grid");
    grid.replaceChildren(h("div", { class: "empty-state", text: "Loading apps..." }));
    try {
      apps = await loadCatalog();
    } catch (e) {
      $("app-count").textContent = "";
      $("stat-accounts").textContent = "--";
      $("stat-accounts-sub").textContent = "update server unreachable";
      $("store-download").textContent = "Store APK unavailable";
      $("store-meta").textContent = UNREACHABLE_TEXT;
      grid.replaceChildren(errorBlock(init));
      return;
    }
    renderStats();
    renderStoreCta();
    renderGrid();
  }

  $("nav-mark").replaceChildren(pnsjyLogo(30));
  $("hero-logo").replaceChildren(pnsjyLogo(62));
  wireFilters();
  init();
})();
