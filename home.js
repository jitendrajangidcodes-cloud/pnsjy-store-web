(function () {
  const $ = (id) => document.getElementById(id);
  let activeFilter = "all";
  let apps = [];

  function appCard(app) {
    const rel = app.release;
    const ribbon = app.beta ? h("span", { class: "beta-ribbon", text: "BETA" }) : null;
    const accountChip = app.requiresAccount === null ? null : h("div", { class: "badge-row" }, [
      h("span", {
        class: `chip-static ${app.requiresAccount ? "plain" : "accent"}`,
        text: app.requiresAccount ? "Requires Google sign-in" : "No account needed",
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
          text: rel ? `v${rel.version} · ${Catalog.formatSize(rel.sizeBytes)}` : "No download yet",
        }),
        h("span", { class: "meta", text: `${app.category} · Android` }),
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
    const stat = Catalog.accountStat(apps);
    const big = $("stat-accounts");
    const sub = $("stat-accounts-sub");
    if (!stat) {
      big.textContent = "Direct APK";
      sub.textContent = "download and install, done";
    } else if (stat.free === stat.total) {
      big.textContent = "0 accounts";
      sub.textContent = "download and install, done";
    } else {
      big.textContent = `${stat.free}/${stat.total} apps`;
      sub.textContent = "need zero account to use";
    }
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
