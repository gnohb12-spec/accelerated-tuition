/* Accelerated Tuition — interactions */
(function () {
  "use strict";

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  /* ---------- Dark mode ---------- */
  var root = document.documentElement;
  var saved = localStorage.getItem("at-theme");
  if (saved === "dark" || (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    root.setAttribute("data-theme", "dark");
  }
  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      if (dark) { root.removeAttribute("data-theme"); localStorage.setItem("at-theme", "light"); }
      else { root.setAttribute("data-theme", "dark"); localStorage.setItem("at-theme", "dark"); }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- Count-up stats ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1200, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { countIO.observe(el); });

  /* ---------- Scroll spy ---------- */
  var sections = ["home", "about", "services", "contact"].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var spyIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var id = e.target.id;
        document.querySelectorAll(".nav-link").forEach(function (l) {
          l.classList.toggle("active", l.getAttribute("href") === "#" + id);
        });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(function (s) { spyIO.observe(s); });

  /* ---------- Form validation ---------- */
  function wireForm(form) {
    if (!form) return;
    var success = form.querySelector(".form-success");
    var body = form.querySelector(".form-body");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var ok = input.value.trim() !== "";
        if (input.type === "email") ok = ok && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value);
        if (input.type === "tel") ok = ok && input.value.replace(/\D/g, "").length >= 8;
        field.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;
      if (body && success) {
        body.style.display = "none";
        success.classList.add("show");
      }
    });
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("invalid");
      });
    });
  }
  document.querySelectorAll("form[data-validate]").forEach(wireForm);

  /* ---------- Year in footer ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Testimonial carousel (auto-scroll) ---------- */
  (function () {
    var carousel = document.getElementById("tmCarousel");
    if (!carousel) return;
    var track = document.getElementById("tmTrack");
    var dotsWrap = document.getElementById("tmDots");
    var slides = Array.prototype.slice.call(track.children);
    var count = slides.length;
    if (count <= 1) { if (dotsWrap) dotsWrap.style.display = "none"; return; }

    var current = 0;
    var interval = parseInt(carousel.getAttribute("data-interval"), 10) || 6000;
    var timer = null;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // build dots
    var dots = [];
    for (var i = 0; i < count; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show testimonial " + (i + 1));
      (function (idx) { b.addEventListener("click", function () { goTo(idx); restart(); }); })(i);
      dotsWrap.appendChild(b);
      dots.push(b);
    }

    function goTo(idx) {
      current = (idx + count) % count;
      track.style.transform = "translateX(-" + (current * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
    }
    function next() { goTo(current + 1); }
    function start() { if (!reduce) timer = setInterval(next, interval); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);

    goTo(0);
    start();
  })();
})();
