(function () {
  var cfg = Object.assign({
    title: "NAME", subtitle: "SUBTITLE", logo: "LOGO", ticker: "ticker • ",
    accent: "#22d3ee", panel: "#0f172a", ink: "#f8fafc", holdSeconds: 6, gapSeconds: 0.8
  }, window.OVERLAY_CONFIG || {});
  var root = document.documentElement;
  root.style.setProperty("--accent", cfg.accent);
  root.style.setProperty("--panel", cfg.panel);
  root.style.setProperty("--ink", cfg.ink);
  var set = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };
  set("lt-title", cfg.title); set("lt-sub", cfg.subtitle); set("logo-text", cfg.logo);
  set("ticker-text", String(cfg.ticker || "").repeat(4));
  var stage = document.getElementById("stage");
  if (stage) stage.style.opacity = "1";
  if (typeof gsap === "undefined") return;
  var hold = Math.max(1, Number(cfg.holdSeconds) || 6);
  var gap = Math.max(0, Number(cfg.gapSeconds) || 0);
  var tl = gsap.timeline({ repeat: -1, repeatDelay: gap, defaults: { ease: "power3.out" } });
  tl.from("#accent-line", { scaleX: 0, transformOrigin: "left center", duration: 0.6 })
    .from("#lt-panel", { xPercent: -135, duration: 0.7 }, "-=0.25")
    .from("#lt-bar", { scaleY: 0, transformOrigin: "bottom", duration: 0.45 }, "<")
    .from("#lt-title", { x: -44, autoAlpha: 0, duration: 0.5 }, "-=0.35")
    .from("#lt-sub", { x: -44, autoAlpha: 0, duration: 0.5 }, "-=0.38")
    .from("#logo", { scale: 0, autoAlpha: 0, transformOrigin: "center", ease: "back.out(1.7)", duration: 0.6 }, "-=0.45")
    .from("#ticker-bar", { yPercent: 135, duration: 0.6 }, "-=0.4");
  var mid = tl.duration();
  var dist = 1500;
  try { var w = document.getElementById("ticker-text").getBBox().width; if (w) dist = w * 0.6; } catch (e) {}
  tl.to("#ticker-text", { x: "-=" + dist, duration: hold, ease: "none" }, mid)
    .to("#logo-ring", { rotation: 360, transformOrigin: "center", duration: hold, ease: "none" }, mid)
    .fromTo("#sweep", { x: 0 }, { x: 1180, duration: 1.4, ease: "power1.inOut", repeat: Math.max(0, Math.floor(hold / 2.2)), repeatDelay: 1.3 }, mid)
    .to({}, { duration: hold }, mid);
  tl.to("#ticker-bar", { yPercent: 135, duration: 0.5, ease: "power3.in" })
    .to("#logo", { scale: 0, autoAlpha: 0, transformOrigin: "center", ease: "back.in(1.7)", duration: 0.45 }, "<")
    .to("#lt-sub", { x: -32, autoAlpha: 0, duration: 0.4 }, "<")
    .to("#lt-title", { x: -32, autoAlpha: 0, duration: 0.4 }, "-=0.25")
    .to("#lt-bar", { scaleY: 0, transformOrigin: "top", duration: 0.35 }, "<")
    .to("#lt-panel", { xPercent: -135, duration: 0.6, ease: "power3.in" }, "-=0.2")
    .to("#accent-line", { scaleX: 0, transformOrigin: "right center", duration: 0.5 }, "-=0.3");
})();
