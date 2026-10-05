(function () {
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  var theme = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.setAttribute("data-theme", theme);
})();
