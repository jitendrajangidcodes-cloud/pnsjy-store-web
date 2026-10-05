(function () {
  const root = document.getElementById("detail-root");

  function chip(text, accent) {
    return h("span", { class: `chip-static ${accent ? "accent" : "plain"}`, text });
  }

  function backLink() {
    return h("a", { class: "back-link", href: "index.html", text: "← All apps" });
  }

  function message(text, retry) {
    root.replaceChildren(backLink(), retry ? errorBlock(retry) : h("div", { class: "empty-state", text }));
  }

  function downloadArea(app) {
    const rel = app.release;
    if (!rel) return h("button", { class: "download-btn", type: "button", "aria-disabled": "true", text: "No download yet" });
    return h("div", { class: "download-area" }, [
      downloadLink(app.id, rel, `Download APK · v${rel.version}`),
      shaLine(rel),
    ]);
  }

  function head(app) {
    const rel = app.release;
    const title = h("h1", { text: app.name }, app.beta ? [document.createTextNode(" "), h("span", { class: "beta-badge", text: "BETA" })] : []);
    const chips = [
      rel ? chip(`v${Catalog.formatVersion(rel)}`, true) : chip("unreleased", false),
      rel ? chip(Catalog.formatSize(rel.sizeBytes)) : null,
      chip("Android"),
      chip(app.category),
      app.requiresAccount === null ? null : chip(app.requiresAccount ? "Requires Google sign-in" : "No account needed", !app.requiresAccount),
      ...app.otherPlatforms.map((p) => chip(`${p} build`)),
    ];
    return h("section", { class: "detail-head" }, [
      appIcon(app, 96),
      h("div", { class: "titles" }, [
        title,
        app.tagline ? h("p", { class: "tagline", text: app.tagline }) : null,
        h("div", { class: "detail-chips" }, chips),
      ]),
      downloadArea(app),
    ]);
  }

  function screenshots(app) {
    if (!app.screenshots.length) return null;
    const imgs = app.screenshots.map((s) => h("img", { src: s.src, alt: s.alt || `${app.name} screenshot`, loading: "lazy" }));
    return h("section", { class: "screenshot-section" }, [h("h2", { text: "Screenshots" }), h("div", { class: "screenshot-row" }, imgs)]);
  }

  function about(app) {
    if (!app.about && !app.requirements) return null;
    return h("section", { class: "about-card" }, [
      h("h2", { text: "About" }),
      app.about ? h("p", { text: app.about }) : null,
      app.requirements ? h("p", { class: "requirements", text: app.requirements }) : null,
    ]);
  }

  function notes(app) {
    const rel = app.release;
    const entry = rel
      ? h("div", { class: "release-entry" }, [
          h("div", { class: "row" }, [chip(`v${Catalog.formatVersion(rel)}`, true), chip("latest")]),
          h("p", { text: rel.notes || "No release notes for this version." }),
        ])
      : h("div", { class: "release-entry" }, [h("p", { text: "No release published yet." })]);
    return h("div", { class: "notes-card" }, [h("h2", { text: "Release notes" }), entry]);
  }

  function installSteps() {
    const step = (n, strong, rest) =>
      h("div", { class: "install-step" }, [
        h("span", { class: "num", text: String(n) }),
        h("span", { class: "txt" }, [document.createTextNode(rest[0]), h("strong", { text: strong }), document.createTextNode(rest[1])]),
      ]);
    return h("div", { class: "install-card" }, [
      h("h2", { text: "Install in 3 steps" }),
      h("div", { class: "install-steps" }, [
        step(1, "Download APK", ["Tap ", " above"]),
        step(2, "install from unknown sources", ["Allow ", " if prompted"]),
        step(3, "Install", ["Open the file and tap ", ""]),
      ]),
    ]);
  }

  function feedback(app) {
    return h("section", { class: "about-card feedback-card" }, [
      h("h2", { text: `Feedback on ${app.name}` }),
      h("p", { text: "Have an idea, hit a bug, or just want to say something? It goes straight to the developer — no GitHub account needed." }),
      h("button", {
        class: "feedback-open-btn", type: "button", "data-feedback-open": true,
        "data-app-id": app.id, "data-app-name": app.name, text: "Send feedback",
      }),
    ]);
  }

  function render(app) {
    document.title = `${app.name} — PNSJY`;
    root.replaceChildren(
      backLink(),
      head(app),
      screenshots(app),
      about(app),
      h("section", { class: "two-col" }, [notes(app), installSteps()]),
      feedback(app),
      h("footer", { class: "site-footer" }, [
        h("span", { text: "PNSJY — built and maintained by Jitendra." }),
        h("span", { class: "mono", text: "updates.pnsjy.in" }),
      ]),
    );
  }

  async function init() {
    const id = new URLSearchParams(location.search).get("id");
    root.replaceChildren(h("div", { class: "empty-state", text: "Loading..." }));
    let apps;
    try {
      apps = await loadCatalog();
    } catch (e) {
      message("", init);
      return;
    }
    const app = apps.find((a) => a.id === id);
    if (!app) message("App not found.");
    else render(app);
  }

  document.getElementById("nav-mark").replaceChildren(pnsjyLogo(30));
  init();
})();
