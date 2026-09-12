(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- loader ---------- */
  var loader = document.querySelector(".loader");
  if (loader) {
    if (reduced) {
      loader.remove();
    } else {
      window.addEventListener("load", function () {
        if (hasGSAP) {
          gsap.timeline()
            .to(loader.querySelector(".loader-mark"), { opacity: 1, duration: 0.35 })
            .to(loader.querySelector(".loader-mark"), { opacity: 1, duration: 0.25 })
            .add(function () { loader.classList.add("is-hiding"); })
            .call(function () { loader.remove(); }, null, "+=0.5");
        } else {
          setTimeout(function () {
            loader.classList.add("is-hiding");
            setTimeout(function () { loader.remove(); }, 500);
          }, 300);
        }
      });
    }
  }

  /* ---------- custom cursor (fine pointers only) ---------- */
  if (window.matchMedia("(pointer: fine)").matches && !reduced) {
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.append(dot, ring);

    var mx = 0, my = 0, rx = 0, ry = 0, started = false;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
      if (!started) {
        started = true;
        rx = mx; ry = my;
        ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      }
      dot.classList.add("is-visible");
      ring.classList.add("is-visible");
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll("a, button, input, textarea, .magnetic").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-active"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-active"); });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (hasGSAP && window.matchMedia("(pointer: fine)").matches && !reduced) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- header shrink on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- split hero headline into lines for reveal ---------- */
  document.querySelectorAll("[data-split-lines]").forEach(function (el) {
    var text = el.textContent.trim();
    // preserve any <em> emphasis by working on innerHTML lines already authored
  });

  /* ---------- scroll reveals ---------- */
  if (hasGSAP && window.ScrollTrigger && !reduced) {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      gsap.set(el, { y: 28, opacity: 0 });
      gsap.to(el, {
        y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var items = group.children;
      gsap.set(items, { y: 28, opacity: 0 });
      gsap.to(items, {
        y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1,
        scrollTrigger: { trigger: group, start: "top 85%" }
      });
    });

    // hero line reveal on load, not scroll
    document.querySelectorAll(".hero h1 .line").forEach(function (line, i) {
      gsap.set(line, { yPercent: 110 });
      gsap.to(line, { yPercent: 0, duration: 1, ease: "power4.out", delay: 0.15 + i * 0.09 });
    });
    gsap.set([".hero-lede", ".hero-actions", ".hero-chips"], { y: 20, opacity: 0 });
    gsap.to([".hero-lede", ".hero-actions", ".hero-chips"], {
      y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 0.55
    });

    // counters
    document.querySelectorAll("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var prefix = el.getAttribute("data-count-prefix") || "";
      var suffix = el.getAttribute("data-count-suffix") || "";
      var proxy = { val: 0 };
      gsap.to(proxy, {
        val: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: function () {
          el.textContent = prefix + Math.round(proxy.val) + suffix;
        }
      });
    });
  } else {
    // no-JS / reduced-motion fallback: make sure counters show final value
    document.querySelectorAll("[data-count-to]").forEach(function (el) {
      var target = el.getAttribute("data-count-to");
      var prefix = el.getAttribute("data-count-prefix") || "";
      var suffix = el.getAttribute("data-count-suffix") || "";
      el.textContent = prefix + target + suffix;
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- contact form ---------- */
  // NOTE: no backend wired up. Validates client-side and confirms locally;
  // connect to a form service (e.g. Formspree) or your own endpoint to
  // actually deliver messages.
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      status.textContent = "Thanks — your message is ready to send. Connect this form to an email service to deliver it.";
      form.reset();
    });
  }
})();
