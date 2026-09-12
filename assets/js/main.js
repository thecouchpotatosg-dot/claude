(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    document.body.classList.add("is-ready");
    setActiveNavLink();
    initHeaderHeight();
    initNavToggle();
    initScrollEffects();
    initReveal();
    initCounters();
    initTestimonialSlider();
    initFaq();
    initFilterTabs();
    initContactForm();
    initButtonGlow();
    initYear();
  }

  function initHeaderHeight() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function setHeight() {
      document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    }
    setHeight();
    window.addEventListener("resize", setHeight);
    if ("ResizeObserver" in window) {
      new ResizeObserver(setHeight).observe(header);
    }
  }

  function setActiveNavLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a[data-page]").forEach(function (link) {
      if (link.getAttribute("data-page") === path) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      links.classList.toggle("is-open");
      document.body.style.overflow = expanded ? "" : "hidden";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  function initScrollEffects() {
    var navbar = document.querySelector(".navbar");
    var backToTop = document.querySelector(".back-to-top");
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (navbar) navbar.classList.toggle("is-scrolled", y > 40);
      if (backToTop) backToTop.classList.toggle("is-visible", y > 480);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (backToTop) {
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      });
    }
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    document.querySelectorAll(".stagger").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty("--i", i);
      });
    });
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      if (prefersReducedMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      var duration = 1600;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  function initTestimonialSlider() {
    var track = document.querySelector(".testimonial-slides");
    var nav = document.querySelector(".testimonial-nav");
    if (!track || !nav) return;
    var slides = track.children;
    var dots = nav.querySelectorAll("button");
    var index = 0;
    var timer;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === index); });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
    });
    function restart() {
      clearInterval(timer);
      if (!prefersReducedMotion) {
        timer = setInterval(function () { goTo(index + 1); }, 5500);
      }
    }
    var wrapper = track.closest(".testimonial-track");
    if (wrapper) {
      wrapper.addEventListener("mouseenter", function () { clearInterval(timer); });
      wrapper.addEventListener("mouseleave", restart);
    }
    goTo(0);
    restart();
  }

  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if (!q || !a) return;
      q.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        document.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove("is-open");
            openItem.querySelector(".faq-a").style.maxHeight = null;
          }
        });
        item.classList.toggle("is-open", !isOpen);
        a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
      });
    });
  }

  function initFilterTabs() {
    var tabs = document.querySelectorAll(".filter-tabs button");
    var cards = document.querySelectorAll("[data-category]");
    if (!tabs.length || !cards.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var filter = tab.getAttribute("data-filter");
        cards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-category") === filter;
          card.style.display = match ? "" : "none";
        });
      });
    });
  }

  function initContactForm() {
    var form = document.querySelector("#contact-form");
    if (!form) return;
    var status = form.querySelector(".form-status");
    var button = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (button) button.classList.add("is-loading");
      setTimeout(function () {
        if (button) button.classList.remove("is-loading");
        if (status) status.classList.add("is-visible");
        form.reset();
        if (status) {
          setTimeout(function () { status.classList.remove("is-visible"); }, 6000);
        }
      }, 900);
    });
  }

  function initButtonGlow() {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var rect = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        btn.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

  function initYear() {
    var el = document.querySelector("#year");
    if (el) el.textContent = new Date().getFullYear();
  }
})();
