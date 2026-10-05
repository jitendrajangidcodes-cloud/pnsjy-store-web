const THEME_KEY = "theme";
const THEME_EXPLICIT_KEY = "theme-explicit";
const CATALOG_URL = `${Catalog.SERVICE}/v1/catalog`;
const FETCH_TIMEOUT_MS = 12000;
const UNREACHABLE_TEXT = "Could not reach the update server, try again";

function h(tag, props, children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "text") node.textContent = value;
    else if (key === "class") node.className = value;
    else if (key === "style") Object.assign(node.style, value);
    else if (key === "data") Object.assign(node.dataset, value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children || []) if (child) node.append(child);
  return node;
}

async function loadCatalog() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(CATALOG_URL, { cache: "no-store", signal: ctrl.signal, credentials: "omit" });
    if (!res.ok) throw new Error(`catalog_${res.status}`);
    return Catalog.mapCatalog(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

function errorBlock(onRetry) {
  const retry = h("button", { class: "download-btn", type: "button", text: "Try again" });
  retry.addEventListener("click", onRetry);
  return h("div", { class: "empty-state", role: "alert" }, [h("p", { text: UNREACHABLE_TEXT }), retry]);
}

function externalLink(href, text, className) {
  return h("a", { href, class: className, rel: "noopener noreferrer", text });
}

function downloadLink(appId, release, label) {
  return externalLink(Catalog.downloadUrl(appId, "android"), label, "download-btn");
}

function shaLine(release) {
  if (!release || !release.sha256) return null;
  return h("span", { class: "sha-line mono", title: "SHA-256 of the APK" }, [
    h("span", { text: "SHA-256 " }),
    h("code", { text: release.sha256 }),
  ]);
}

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") || "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, next);
    localStorage.setItem(THEME_EXPLICIT_KEY, "1");
  } catch (e) {}
  applyTheme(next);
}

window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
  try {
    if (localStorage.getItem(THEME_EXPLICIT_KEY) === "1") return;
  } catch (err) {}
  applyTheme(e.matches ? "light" : "dark");
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".theme-toggle");
  if (btn) btn.addEventListener("click", toggleTheme);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  const btn = document.querySelector(".install-btn");
  if (btn) btn.hidden = false;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  const btn = document.querySelector(".install-btn");
  if (btn) btn.hidden = true;
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".install-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    btn.hidden = true;
  });
});

const PNSJY_LETTERS = [
  { ch: "P", bg: "#e8632c", fg: "#ffffff" },
  { ch: "N", bg: "#f0a92c", fg: "#6b4400" },
  { ch: "S", bg: "#3fae6a", fg: "#ffffff" },
  { ch: "J", bg: "#2f7ee3", fg: "#ffffff" },
  { ch: "Y", bg: "#8a56d6", fg: "#ffffff" },
];

function buddyTile(ch, bg, fg, size) {
  const eye = Math.max(3, Math.round(size * 0.13));
  const eyeStyle = { width: `${eye}px`, height: `${eye}px`, background: fg };
  return h("div", {
    class: "buddy-tile",
    style: { width: `${size}px`, height: `${size}px`, borderRadius: `${Math.round(size * 0.28)}px`, background: bg },
  }, [
    h("div", { class: "eyes", style: { top: `${Math.round(size * 0.19)}px`, gap: `${Math.round(size * 0.19)}px` } }, [
      h("span", { style: eyeStyle }),
      h("span", { style: eyeStyle }),
    ]),
    h("span", {
      class: "letter",
      text: ch,
      style: { fontSize: `${Math.round(size * 0.55)}px`, color: fg, paddingBottom: `${Math.round(size * 0.1)}px` },
    }),
  ]);
}

function pnsjyLogo(size) {
  return h("div", { class: "buddy-row" }, PNSJY_LETTERS.map((b) => buddyTile(b.ch, b.bg, b.fg, size)));
}

function appTile(app, size) {
  return buddyTile(app.name.charAt(0).toUpperCase(), app.color || "#2f7ee3", "#ffffff", size);
}

function appIcon(app, size) {
  if (!app.iconUrl) return appTile(app, size);
  const radius = `${Math.round(size * 0.24)}px`;
  const img = h("img", { src: app.iconUrl, alt: `${app.name} icon`, loading: "lazy", style: { borderRadius: radius } });
  img.addEventListener("error", () => img.remove());
  return h("div", {
    class: "app-icon",
    style: { width: `${size}px`, height: `${size}px`, borderRadius: radius, background: app.color || "#2f7ee3" },
  }, [
    h("span", { class: "fallback", text: app.name.charAt(0).toUpperCase(), style: { fontSize: `${Math.round(size * 0.5)}px` } }),
    img,
  ]);
}

const FEEDBACK_REPO = "jitendrajangidcodes-cloud/pnsjy-store-web";

function feedbackUrl(type, app) {
  const titles = { feedback: "Feedback", suggestion: "Suggestion", bug: "Bug report" };
  const scope = app ? ` for ${app.name}` : "";
  const target = app ? `**App:** ${app.name}\n\n` : "";
  const bodies = {
    bug: `${target}**What happened:**\n\n**Steps to reproduce:**\n\n**Device / Android version:**\n`,
    suggestion: `${target}**What would you like to see:**\n`,
    feedback: `${target}**Your feedback:**\n`,
  };
  const params = new URLSearchParams({
    title: `${titles[type]}${scope}: `,
    labels: [type, app ? app.id : null].filter(Boolean).join(","),
    body: bodies[type],
  });
  return `https://github.com/${FEEDBACK_REPO}/issues/new?${params.toString()}`;
}

function attachTilt(el) {
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
}
