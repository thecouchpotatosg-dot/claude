(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  var fine = window.matchMedia("(pointer: fine)").matches;

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- scroll progress bar ---------- */
  var progress = document.createElement("div");
  progress.className = "progress-bar";
  document.body.prepend(progress);
  var updateProgress = function () {
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + "%";
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  /* ---------- loader ---------- */
  var loader = document.querySelector(".loader");
  if (loader) {
    if (reduced) {
      loader.remove();
    } else {
      window.addEventListener("load", function () {
        if (hasGSAP) {
          gsap.timeline()
            .to(loader.querySelector(".loader-mark"), { opacity: 1, duration: 0.3 })
            .to(loader.querySelector(".loader-mark"), { opacity: 1, duration: 0.15 })
            .add(function () { loader.classList.add("is-hiding"); })
            .call(function () { loader.remove(); }, null, "+=0.5");
        } else {
          setTimeout(function () {
            loader.classList.add("is-hiding");
            setTimeout(function () { loader.remove(); }, 500);
          }, 250);
        }
      });
    }
  }

  /* ---------- custom cursor (fine pointers only) ---------- */
  var cursorLabel;
  if (fine && !reduced) {
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    cursorLabel = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    cursorLabel.className = "cursor-label";
    document.body.append(dot, ring, cursorLabel);

    var mx = 0, my = 0, rx = 0, ry = 0, started = false;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
      cursorLabel.style.transform = cursorLabel.classList.contains("is-visible")
        ? "translate(" + mx + "px," + my + "px) scale(1)"
        : "translate(" + mx + "px," + my + "px) scale(0)";
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

    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursorLabel.textContent = el.getAttribute("data-cursor");
        cursorLabel.classList.add("is-visible");
      });
      el.addEventListener("mouseleave", function () {
        cursorLabel.classList.remove("is-visible");
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (hasGSAP && fine && !reduced) {
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

  /* ---------- tilt cards ---------- */
  if (fine && !reduced) {
    document.querySelectorAll(".tilt").forEach(function (el) {
      el.style.perspective = "800px";
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "rotateY(" + (px * 10) + "deg) rotateX(" + (py * -10) + "deg) translateZ(0)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "rotateY(0) rotateX(0)";
      });
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

  /* ---------- scroll reveals (smooth, slight overshoot) ---------- */
  if (hasGSAP && window.ScrollTrigger && !reduced) {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      gsap.set(el, { y: 36, opacity: 0, scale: 0.97 });
      gsap.to(el, {
        y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.15)",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var items = group.children;
      gsap.set(items, { y: 36, opacity: 0, scale: 0.96 });
      gsap.to(items, {
        y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.2)", stagger: 0.08,
        scrollTrigger: { trigger: group, start: "top 88%" }
      });
    });

    // hero line reveal on load, not scroll
    document.querySelectorAll(".hero h1 .line").forEach(function (line, i) {
      gsap.set(line, { yPercent: 120 });
      gsap.to(line, { yPercent: 0, duration: 0.9, ease: "power4.out", delay: 0.1 + i * 0.08 });
    });
    gsap.set([".hero-lede", ".hero-actions", ".hero-chips"], { y: 24, opacity: 0 });
    gsap.to([".hero-lede", ".hero-actions", ".hero-chips"], {
      y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.45
    });

    var seal = document.querySelector(".hero-seal");
    if (seal) {
      gsap.set(seal, { scale: 0, opacity: 0 });
      gsap.to(seal, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.4)", delay: 0.5 });
    }

    /* ---------- continuous scroll-linked parallax ---------- */
    // background orbs drift as you scroll past each section (not just once)
    document.querySelectorAll(".aurora").forEach(function (el, i) {
      var dir = i % 2 === 0 ? 1 : -1;
      gsap.to(el, {
        y: 120 * dir,
        x: 40 * dir,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") || el.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    });

    // hero content settles back and fades slightly as the page scrolls away from it
    var heroCopy = document.querySelector(".hero-copy");
    if (heroCopy) {
      gsap.to(heroCopy, {
        y: -60, opacity: 0.4, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
      });
    }

    // the marquee bands drift slightly faster/slower than scroll for depth
    document.querySelectorAll(".marquee").forEach(function (el, i) {
      gsap.to(el, {
        xPercent: i % 2 === 0 ? -4 : 4, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 }
      });
    });

    // hero growth graph: draw the line, then pop the labels/dots in
    var graphLine = document.querySelector(".graph-line");
    if (graphLine) {
      gsap.set(graphLine, { strokeDashoffset: 100 });
      gsap.set(".graph-fill", { opacity: 0 });
      gsap.set(".graph-dot", { scale: 0, transformOrigin: "center" });
      gsap.set(".hero-graph-label", { y: 12, opacity: 0 });

      var graphTl = gsap.timeline({ delay: 0.9 });
      graphTl
        .to(graphLine, { strokeDashoffset: 0, duration: 1.3, ease: "power2.out" })
        .to(".graph-fill", { opacity: 1, duration: 0.5 }, "-=0.3")
        .to(".graph-dot", { scale: 1, duration: 0.5, ease: "back.out(3)", stagger: 0.12 }, "-=0.5")
        .to(".hero-graph-label", { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.12 }, "-=0.4");
    }

    // counters
    document.querySelectorAll("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var prefix = el.getAttribute("data-count-prefix") || "";
      var suffix = el.getAttribute("data-count-suffix") || "";
      var proxy = { val: 0 };
      gsap.to(proxy, {
        val: target,
        duration: 1.3,
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
