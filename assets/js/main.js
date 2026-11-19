/* EGroupware static site – progressive enhancement only.
   Everything below is optional: the site works fully without JS. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---- Theme toggle (light / dark / system) ---- */
  var root = document.documentElement;

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }
  function unstore(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  /* Ohne eigene Wahl folgt die Seite dem Betriebssystem (CSS prefers-color-scheme,
     auch live beim Umschalten). Die letzte Aktion gewinnt: Eine Wahl per Knopf gilt,
     bis das Betriebssystem umgestellt wird. Dafuer merken wir uns das Systemschema
     zum Zeitpunkt des Klicks ("vidoteach-theme-sys"); das Skript im <head> verwirft die
     Wahl, sobald das System nicht mehr dazu passt. */
  var schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function systemScheme() { return schemeQuery.matches ? "dark" : "light"; }
  function followSystem() {
    root.removeAttribute("data-theme");
    unstore("vidoteach-theme");
    unstore("vidoteach-theme-sys");
  }

  var themeButtons = document.querySelectorAll(".theme-toggle, .theme-toggle-inline");
  themeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var system = systemScheme();
      var current = root.getAttribute("data-theme") || system;
      var next = current === "dark" ? "light" : "dark";
      if (next === system) {
        followSystem();
      } else {
        root.setAttribute("data-theme", next);
        store("vidoteach-theme", next);
        store("vidoteach-theme-sys", system);
      }
    });
  });

  /* Systemumstellung bei geoeffneter Seite: eigene Wahl verwerfen */
  if (schemeQuery.addEventListener) {
    schemeQuery.addEventListener("change", followSystem);
  } else if (schemeQuery.addListener) {
    schemeQuery.addListener(followSystem);
  }

  /* ---- Mobile navigation ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("primary-nav");
  if (navToggle && navLinks) {
    var setMenu = function (open) {
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      // stop the page behind the menu from scrolling on touch devices
      document.body.classList.toggle("nav-open", open);
    };

    navToggle.addEventListener("click", function () {
      setMenu(!navLinks.classList.contains("is-open"));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) { setMenu(false); }
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
        setMenu(false);
        navToggle.focus();
      }
    });
    // a rotated phone can widen past the mobile breakpoint while the menu is open
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && navLinks.classList.contains("is-open")) {
        setMenu(false);
      }
    });
  }

  /* ---- Untermenues ---- */
  /* Ohne JS oeffnet CSS sie beim Darueberfahren. Hier kommt der Klick dazu,
     damit sie auch auf Touch-Geraeten und im mobilen Menue funktionieren. */
  var subItems = document.querySelectorAll(".nav-has-sub");
  subItems.forEach(function (item) {
    var toggle = item.querySelector(".nav-sub__toggle");
    if (!toggle) { return; }
    var setOpen = function (open) {
      item.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      var open = item.getAttribute("data-open") === "true";
      subItems.forEach(function (other) {
        if (other !== item) {
          other.setAttribute("data-open", "false");
          var t = other.querySelector(".nav-sub__toggle");
          if (t) { t.setAttribute("aria-expanded", "false"); }
        }
      });
      setOpen(!open);
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && item.getAttribute("data-open") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest(".nav-has-sub")) { return; }
    subItems.forEach(function (item) {
      item.setAttribute("data-open", "false");
      var t = item.querySelector(".nav-sub__toggle");
      if (t) { t.setAttribute("aria-expanded", "false"); }
    });
  });

  /* ---- Sticky header shadow ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Reveal on scroll ---- */
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length) {
    if (!("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Remember language choice for the root redirect ---- */
  var langLinks = document.querySelectorAll("[data-set-lang]");
  langLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      store("vidoteach-lang", link.getAttribute("data-set-lang"));
    });
  });

  /* ---- Footer year ---- */
  var year = document.querySelector("[data-year]");
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
