/* ═══════════════════════════════════════════════════
   PISTASIEN — main.js
   GSAP + ScrollTrigger + Lenis + SplitType
═══════════════════════════════════════════════════ */

(() => {
  "use strict";

  const hasGsap = () => typeof window.gsap !== "undefined";
  const hasScrollTrigger = () => typeof window.ScrollTrigger !== "undefined";
  const hasLenis = () => typeof window.Lenis !== "undefined";
  const hasSplitType = () => typeof window.SplitType !== "undefined";

  /* ── 0. REGISTER GSAP PLUGINS ─────────────────── */
  if (hasGsap() && hasScrollTrigger()) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* ─────────────────────────────────────────────────
     1. LOADER ANIMATION
  ───────────────────────────────────────────────── */
  function initLoader() {
    const loader = document.getElementById("loader");
    const brand = document.getElementById("loader-brand");
    const bar = document.getElementById("loader-bar");
    const loaderTx = document.getElementById("loader-text");

    if (!loader || !brand) return;
    if (!hasGsap()) {
      loader.style.display = "none";
      document.body.style.overflow = "";
      return;
    }

    // Manually split brand text
    const text = brand.textContent.trim();
    brand.innerHTML = "";
    text.split("").forEach(char => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      brand.appendChild(span);
    });
    const chars = brand.querySelectorAll("span");

    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        loader.style.display = "none";
        document.body.style.overflow = "";
        initHeroAnimation();
      }
    });

    // Subtly scale background elements for cinematic depth
    tl.fromTo(loader,
      { scale: 1 },
      { scale: 1.05, duration: 2.5, ease: "sine.inOut" },
      0
    );

    // 1. Text Animation with stagger
    tl.fromTo(chars,
      { y: 40, opacity: 0, filter: "blur(10px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.4, stagger: 0.08, ease: "power3.out" },
      0.2
    );

    // 2. Progress Line (Trailing Effect + Pulse)
    tl.fromTo(bar,
      { x: "-100%" },
      { x: "0%", duration: 2, ease: "power4.inOut" },
      0.4
    );
    tl.to(bar, {
      opacity: 0.4,
      duration: 0.5,
      yoyo: true,
      repeat: 3,
      ease: "power1.inOut"
    }, 0.4);

    // 4. Secondary Text Fade with letter spacing expansion
    tl.fromTo(loaderTx,
      { opacity: 0, letterSpacing: "0.1em" },
      { opacity: 1, letterSpacing: "0.3em", duration: 1.5, ease: "power3.out" },
      0.7
    );

    // Exit Animation (Scale to 1.1, slide up)
    tl.to(loader, {
      scale: 1.1,
      duration: 1.1,
      ease: "power3.inOut"
    }, "+=0.3")
      .to(loader, {
        yPercent: -100,
        duration: 1.5,
        ease: "power4.inOut"
      }, "-=0.4");
  }

  /* ─────────────────────────────────────────────────
     2. LENIS SMOOTH SCROLL
  ───────────────────────────────────────────────── */
  let globalLenis = null;

  function initLenis() {
    if (!hasGsap() || !hasLenis()) return null;

    const lenis = new window.Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    if (hasScrollTrigger()) lenis.on("scroll", window.ScrollTrigger.update);

    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    globalLenis = lenis;
    window.lenis = lenis;
    return lenis;
  }

  /* ─────────────────────────────────────────────────
     3. NAVBAR SCROLL BEHAVIOR
  ───────────────────────────────────────────────── */
  function initNavbar() {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    if (!hasScrollTrigger()) {
      const updateNav = () => nav.classList.toggle("scrolled", window.scrollY > 80);
      window.addEventListener("scroll", updateNav, { passive: true });
      updateNav();
      return;
    }

    window.ScrollTrigger.create({
      start: "80px top",
      onEnter: () => nav.classList.add("scrolled"),
      onLeaveBack: () => nav.classList.remove("scrolled"),
    });
  }

  /* ─────────────────────────────────────────────────
     4. HERO CINEMATIC ENTRANCE
  ───────────────────────────────────────────────── */
  function initHeroAnimation() {
    if (!document.getElementById("hero")) return;
    if (!hasGsap()) return;

    /* Scale bg image 1.2→1 */
    gsap.to(".hero-bg-img", {
      scale: 1,
      duration: 2.2,
      ease: "expo.out",
    });

    /* Split title lines into chars */
    const titleLines = document.querySelectorAll(".hero-title .split-line");
    const split = hasSplitType() ? new window.SplitType(titleLines, { types: "chars" }) : null;

    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    tl.from(split ? split.chars : titleLines, {
      yPercent: 110,
      opacity: 0,
      stagger: { amount: 0.8, from: "start" },
      duration: 1.5,
    }, 0.2)
      .to("#hero-eyebrow", { opacity: 1, y: 0, duration: 1.2 }, 0.5)
      .to("#hero-sub", { opacity: 1, y: 0, duration: 1.2 }, 0.75)
      .to("#hero-cta-wrap", { opacity: 1, y: 0, duration: 1.2 }, 0.95)
      .to("#hero-scroll-hint", { opacity: 1, duration: 1.1 }, 1.3);
  }

  /* ─────────────────────────────────────────────────
     5. SCROLL REVEAL — all .reveal-section elements
  ───────────────────────────────────────────────── */
  function initScrollReveals() {
    const reveals = document.querySelectorAll(".reveal-section");
    if (!hasGsap() || !hasScrollTrigger()) {
      reveals.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    reveals.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });
  }

  /* ─────────────────────────────────────────────────
     6. MARQUEE — infinite loop
  ───────────────────────────────────────────────── */
  function initMarquee() {
    const track = document.getElementById("marquee-track");
    if (!track) return;
    if (!hasGsap()) return;

    gsap.fromTo(track,
      { xPercent: 0 },
      {
        xPercent: -50,
        duration: 30,
        ease: "none",
        repeat: -1
      }
    );
  }

  /* ─────────────────────────────────────────────────
     7. CATEGORY CARDS — GSAP hover timelines
  ───────────────────────────────────────────────── */
  function initCategoryCards() {
    if (!hasGsap()) return;

    document.querySelectorAll(".cat-card").forEach((card) => {
      const img = card.querySelector(".cat-card-img");
      const overlay = card.querySelector(".cat-card-overlay");
      const title = card.querySelector(".cat-card-title");
      const link = card.querySelector(".cat-card-link");

      const tl = gsap.timeline({ paused: true });
      tl.to(img, { scale: 1.08, duration: 1.4, ease: "expo.out" }, 0)
        .to(overlay, { opacity: 1, duration: 1.1, ease: "power2.out" }, 0)
        .to(title, { y: -6, duration: 1.1, ease: "expo.out" }, 0.05)
        .to(link, { color: "#7a9e4e", duration: 0.8 }, 0);

      card.addEventListener("mouseenter", () => tl.play());
      card.addEventListener("mouseleave", () => tl.reverse());
    });
  }

  /* ─────────────────────────────────────────────────
     8. PRODUCT CARDS — 3D tilt + secondary image
  ───────────────────────────────────────────────── */
  async function initProductCards() {
    const grid = document.querySelector("#products .products-grid");
    
    const bindCards = () => {
      document.querySelectorAll(".prod-card").forEach((card) => {
        if (card.dataset.gsapBound) return;
        card.dataset.gsapBound = "true";
        const wrap = card.querySelector(".prod-img-wrap");
        const img2 = card.querySelector(".prod-img-2");
        const actions = card.querySelector(".prod-actions");
        if (!wrap || !img2 || !actions) return;

        card.addEventListener("mouseenter", () => {
          gsap.to(img2, { opacity: 1, duration: 0.8 });
          gsap.to(actions, { y: 0, duration: 0.8, ease: "expo.out" });
          gsap.to(wrap, { boxShadow: "0 24px 48px rgba(26,26,20,0.22)", duration: 0.8 });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(img2, { opacity: 0, duration: 0.4 });
          gsap.to(actions, { y: "100%", duration: 0.35, ease: "power3.in" });
          gsap.to(wrap, { boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.4 });
          gsap.to(wrap, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out" });
        });

        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rx = ((y / rect.height) - 0.5) * -10;
          const ry = ((x / rect.width) - 0.5) * 10;
          gsap.to(wrap, {
            rotateX: rx, rotateY: ry,
            transformPerspective: 800,
            duration: 0.5, ease: "power2.out",
          });
        });
      });

      document.querySelectorAll(".prod-card .prod-btn-cart").forEach((btn) => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = "true";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const card = btn.closest(".prod-card");
          if (!card) return;

          const id = card.dataset.pid;
          const name = card.querySelector(".prod-name")?.textContent?.trim() || "Product";
          const variant = card.querySelector(".prod-sub")?.textContent?.trim() || "Standard";
          const priceText = card.querySelector(".prod-price")?.textContent || "$0";
          const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;
          const image = card.querySelector(".prod-img-1")?.getAttribute("src") || "../assets/images/logo.png";

          if (window.CartStore) {
            window.CartStore.add({ id, name, variant, image, qty: 1, price });
            window.CartStore.open();
          }
        });
      });
    };

    if (grid) {
      try {
        if (window.apiFetchProducts) {
          const resData = await window.apiFetchProducts();
          const products = resData.data || resData;
          if (Array.isArray(products) && products.length > 0) {
            grid.innerHTML = products.slice(0, 4).map((p) => {
              const img1 = p.images[0] || "../assets/images/logo.png";
              const img2 = p.images[1] || img1;
              return `
                <div class="prod-card" data-pid="${p.id}">
                  <div class="prod-img-wrap">
                    <img src="${img1}" alt="${p.name}" class="prod-img prod-img-1" />
                    <img src="${img2}" alt="${p.name} back" class="prod-img prod-img-2" />
                    <div class="prod-actions">
                      <button class="prod-btn-wish" aria-label="Wishlist">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </button>
                      <button class="prod-btn-cart">Add to Cart</button>
                    </div>
                  </div>
                  <div class="prod-info">
                    <h4 class="prod-name">${p.name}</h4>
                    <p class="prod-sub">${p.description || 'Standard'}</p>
                    <p class="prod-price">$${p.price}</p>
                  </div>
                </div>
              `;
            }).join("");
            
            // Bind immediately after loading cards
            bindCards();
          }
        }
      } catch (err) {
        console.error("Failed to dynamically load products:", err);
      }
    }

    // Fallback binding for any pre-existing cards
    bindCards();
  }

  /* ─────────────────────────────────────────────────
     9. HORIZONTAL SCROLL — TRENDING (GSAP pin)
  ───────────────────────────────────────────────── */
  function initHorizontalScroll() {
    const wrapper = document.getElementById("h-scroll-wrapper");
    const track = document.getElementById("h-scroll-track");
    if (!wrapper || !track) return;
    if (!hasGsap() || !hasScrollTrigger()) return;

    const cards = track.querySelectorAll(".trend-card");

    const totalScroll = track.scrollWidth - wrapper.offsetWidth;

    gsap.to(track, {
      x: () => -totalScroll,
      ease: "none",
      scrollTrigger: {
        trigger: "#trending",
        pin: true,
        scrub: 1.5,
        end: () => `+=${totalScroll}`,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / (cards.length - 1),
          duration: { min: 0.8, max: 1.5 },
          ease: "expo.out",
        },
      },
    });
  }

  /* ─────────────────────────────────────────────────
     10. PARALLAX SECTION
  ───────────────────────────────────────────────── */
  function initParallax() {
    if (!document.getElementById("parallax-bg")) return;
    if (!hasGsap() || !hasScrollTrigger()) return;

    gsap.to("#parallax-bg", {
      yPercent: 25,
      ease: "none",
      scrollTrigger: {
        trigger: ".parallax-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  }

  /* ─────────────────────────────────────────────────
     11. PAGE TRANSITIONS — anchor clicks
  ───────────────────────────────────────────────── */
  function initPageTransitions() {
    const overlay = document.getElementById("page-overlay");
    if (!overlay || !hasGsap()) return;

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#") || href.startsWith("javascript") || link.getAttribute("target") === "_blank") return;

      link.addEventListener("click", (e) => {
        e.preventDefault();
        gsap.to(overlay, {
           scaleY: 1,
           transformOrigin: "bottom",
           duration: 1.1,
           ease: "expo.inOut",
           onComplete: () => { window.location.href = href; },
        });
      });
    });

    /* Fade-in on page load (after loader) */
    gsap.fromTo(overlay,
      { scaleY: 1, transformOrigin: "top" },
      { scaleY: 0, duration: 0.6, ease: "power3.inOut", delay: 0.1 }
    );
  }

  /* ─────────────────────────────────────────────────
     LOGO IMAGE FALLBACK — if no logo file, use SVG
  ───────────────────────────────────────────────── */
  function setLogoFallback() {
    document.querySelectorAll('img[src="../assets/images/logo.png"]').forEach((img) => {
      img.onerror = () => {
        img.style.display = "none";
        const sibling = img.parentElement;
        if (!sibling.querySelector(".logo-text-fallback")) {
          const span = document.createElement("span");
          span.className = "logo-text-fallback";
          span.textContent = "PISTASIEN";
          span.style.cssText =
            "font-family:'Cormorant',serif;font-size:1.2rem;letter-spacing:0.2em;color:inherit;";
          sibling.appendChild(span);
        }
      };
    });
  }

  /* ─────────────────────────────────────────────────
     12. CUSTOM CURSOR & MAGNETIC ZONES
  ───────────────────────────────────────────────── */
  function initCustomCursor() {
    const cur = document.getElementById('cur');
    const ring = document.getElementById('cur-ring');
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!cur || !ring || !hasGsap()) {
      if (cur) cur.style.display = 'none';
      if (ring) ring.style.display = 'none';
      const style = document.createElement('style');
      style.innerHTML = `* { cursor: auto !important; } a, button, .auth-tab, .cat-card, .prod-card, .trend-card, [data-antigravity] { cursor: pointer !important; }`;
      document.head.appendChild(style);
      return;
    }

    /* ── Cursor follow (Manual Lerp for Performance & No Reset Warnings) ── */
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let curP = { x: mouse.x, y: mouse.y };
    let ringP = { x: mouse.x, y: mouse.y };

    gsap.set([cur, ring], { xPercent: -50, yPercent: -50 });

    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Uniform ticker for all smooth updates
    let tickCount = 0;
    gsap.ticker.add(() => {
      // 1. Cursor & Ring Smooth Follow
      curP.x += (mouse.x - curP.x) * 0.8;
      curP.y += (mouse.y - curP.y) * 0.8;
      ringP.x += (mouse.x - ringP.x) * 0.15;
      ringP.y += (mouse.y - ringP.y) * 0.15;

      gsap.set(cur, { x: curP.x, y: curP.y });
      gsap.set(ring, { x: ringP.x, y: ringP.y });
      
      tickCount++;
      if (tickCount === 60) {
        console.log("Cursor ticker healthy, coords:", curP.x, curP.y, "Display:", window.getComputedStyle(cur).display, "Touch:", isTouch);
      }
    });

    /* ── Hover state & Push/Pull button scale ── */
    const hoverTargets = 'a, button, .cat-card, .prod-card, .trend-card, [data-antigravity]';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cur-hover');
        gsap.to(el, { scale: 1.03, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cur-hover');
        gsap.to(el, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      });
    });

    /* ── ANTIGRAVITY ARROWS ── */
    const REPEL_RADIUS = 90;   // px
    const FORCE = 2.2;  // repulsion strength
    const DAMPING = 0.70; // velocity decay
    const SPRING = 0.09; // snap back to origin
    const MAX_DIST = 30;   // SUBTLE: reduced max displacement

    const agArrows = [...document.querySelectorAll('[data-antigravity]')].map(el => {
      gsap.set(el, { display: "inline-block" });
      return {
        el, x: 0, y: 0, vx: 0, vy: 0, rotation: 0, scale: 1,
        docLeft: 0, docTop: 0, w: 0, h: 0,
        isGlowing: false // state guard for thresholds
      };
    });

    const updateBounds = () => {
      agArrows.forEach(a => {
        gsap.set(a.el, { x: 0, y: 0, rotation: 0, scale: 1 });
        const b = a.el.getBoundingClientRect();
        a.w = b.width;
        a.h = b.height;
        a.docLeft = b.left + window.scrollX;
        a.docTop = b.top + window.scrollY;
        gsap.set(a.el, { x: a.x, y: a.y });
      });
    };
    window.addEventListener("resize", updateBounds);
    setTimeout(updateBounds, 250);

    function tickArrows() {
      const sx = window.scrollX;
      const sy = window.scrollY;

      agArrows.forEach(a => {
        const cx = (a.docLeft - sx) + a.w / 2;
        const cy = (a.docTop - sy) + a.h / 2;

        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetGlow = 0;

        if (dist < REPEL_RADIUS && dist > 0) {
          let norm = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          let power = gsap.parseEase("sine.inOut")(norm) * FORCE;

          a.vx -= (dx / dist) * power;
          a.vy -= (dy / dist) * power;
          targetGlow = power;
        }

        a.vx += -a.x * SPRING;
        a.vy += -a.y * SPRING;
        a.vx *= DAMPING;
        a.vy *= DAMPING;

        a.x = Math.max(-MAX_DIST, Math.min(MAX_DIST, a.x + a.vx));
        a.y = Math.max(-MAX_DIST, Math.min(MAX_DIST, a.y + a.vy));

        const mag = Math.sqrt(a.x * a.x + a.y * a.y);
        a.rotation = (mag > 1) ? (Math.atan2(a.y, a.x) * (180 / Math.PI) * 0.08) : 0;
        a.scale = 1 + mag * 0.005;

        /* Rendering with collective gsap.set */
        gsap.set(a.el, {
          x: a.x,
          y: a.y,
          rotation: a.rotation,
          scale: a.scale
        });

        /* Glow Feedback - state guarded to prevent constant gsap.to calls */
        const shouldGlow = targetGlow > (FORCE * 0.5);
        if (shouldGlow && !a.isGlowing) {
          a.isGlowing = true;
          gsap.to(a.el, {
            color: "#a4d36b",
            filter: "drop-shadow(0 0 8px rgba(164,211,107,0.6))",
            duration: 0.3,
            overwrite: "auto"
          });
        } else if (!shouldGlow && a.isGlowing) {
          a.isGlowing = false;
          gsap.to(a.el, {
            clearProps: "color,filter",
            duration: 0.5,
            overwrite: "auto"
          });
        }
      });
      requestAnimationFrame(tickArrows);
    }

    if (agArrows.length) tickArrows();
  }

  /* ─────────────────────────────────────────────────
     14. FLOWING MENU INJECTION
  ───────────────────────────────────────────────── */
  function initFlowingMenu() {
    const wrap = document.getElementById("flowing-menu-overlay");
    const openBtn = document.getElementById("nav-flowing-btn");
    const closeBtn = document.getElementById("close-flowing-menu");
    if (!wrap || !openBtn || !closeBtn) return;

    openBtn.addEventListener("click", () => {
      wrap.style.opacity = "1";
      wrap.style.pointerEvents = "auto";
    });
    closeBtn.addEventListener("click", () => {
      wrap.style.opacity = "0";
      wrap.style.pointerEvents = "none";
    });

    const items = document.querySelectorAll(".flowing-menu__item");
    const speed = 15;
    const animationDefaults = { duration: 1.1, ease: "expo.out" };

    const distMetric = (x, y, x2, y2) => {
      const xDiff = x - x2;
      const yDiff = y - y2;
      return xDiff * xDiff + yDiff * yDiff;
    };
    const findClosestEdge = (mouseX, mouseY, width, height) => {
      const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
      const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
      return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
    };

    items.forEach(item => {
      const link = item.querySelector(".flowing-menu__item-link");
      const text = item.getAttribute("data-text");
      const image = item.getAttribute("data-image");

      const marquee = document.createElement("div");
      marquee.className = "flowing-marquee";
      const innerWrap = document.createElement("div");
      innerWrap.className = "flowing-marquee__inner-wrap";
      const inner = document.createElement("div");
      inner.className = "flowing-marquee__inner";
      inner.setAttribute("aria-hidden", "true");

      innerWrap.appendChild(inner);
      marquee.appendChild(innerWrap);
      item.appendChild(marquee);

      let repetitions = 4;
      const generateParts = () => {
        inner.innerHTML = "";
        for (let i = 0; i < repetitions; i++) {
          const part = document.createElement("div");
          part.className = "flowing-marquee__part";
          part.innerHTML = `<span>${text}</span><div class="flowing-marquee__img" style="background-image: url(${image})"></div>`;
          inner.appendChild(part);
        }
      };

      const calculateRepetitions = () => {
        generateParts(); // Initially dump 4 parts
        const part = inner.querySelector('.flowing-marquee__part');
        if (!part) return;
        const contentWidth = part.offsetWidth;
        const viewportWidth = window.innerWidth;
        if (contentWidth === 0) return;

        const needed = Math.ceil(viewportWidth / contentWidth) + 2;
        const finalRepetitions = Math.max(4, needed);
        if (finalRepetitions !== repetitions) {
          repetitions = finalRepetitions;
          generateParts();
        }
      };

      let animation = null;
      const setupMarquee = () => {
        if (!hasGsap()) return;
        calculateRepetitions();
        const part = inner.querySelector('.flowing-marquee__part');
        if (!part) return;
        const contentWidth = part.offsetWidth;
        if (contentWidth === 0) return;
        if (animation) animation.kill();

        animation = gsap.to(inner, {
          x: -contentWidth,
          duration: speed,
          ease: "none",
          repeat: -1
        });
      };

      setTimeout(setupMarquee, 100);
      window.addEventListener("resize", () => setTimeout(setupMarquee, 100));

      link.addEventListener("mouseenter", (ev) => {
        if (!hasGsap()) return;
        const rect = item.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const edge = findClosestEdge(x, y, rect.width, rect.height);

        gsap.timeline({ defaults: animationDefaults })
          .set(marquee, { y: edge === 'top' ? '-101%' : '101%' }, 0)
          .set(inner, { y: edge === 'top' ? '101%' : '-101%' }, 0)
          .to([marquee, inner], { y: '0%' }, 0);
      });

      link.addEventListener("mouseleave", (ev) => {
        if (!hasGsap()) return;
        const rect = item.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const edge = findClosestEdge(x, y, rect.width, rect.height);

        gsap.timeline({ defaults: animationDefaults })
          .to(marquee, { y: edge === 'top' ? '-101%' : '101%' }, 0)
          .to(inner, { y: edge === 'top' ? '101%' : '-101%' }, 0);
      });

      // Update cursor hover logic explicitly for FlowingMenu items so cursor expands over them
      link.addEventListener("mouseenter", () => document.body.classList.add('cur-hover'));
      link.addEventListener("mouseleave", () => document.body.classList.remove('cur-hover'));
    });
  }

  /* ─────────────────────────────────────────────────
     15. CART DRAWER
  ───────────────────────────────────────────────── */
  function initCartDrawer() {
    const root = document.getElementById("cart-root");
    const trigger = document.getElementById("btn-cart");
    if (!root || !trigger) return;

    const overlay = root.querySelector(".cart-overlay");
    const panel = root.querySelector(".cart-panel");
    const itemsList = root.querySelector("#cart-items");
    const emptyState = root.querySelector(".cart-empty");
    const subtotalEl = root.querySelector("[data-cart-subtotal]");

    const state = { items: [] };
    const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    let isOpen = false;
    let openTl = null;
    let closeTl = null;

    const esc = (text) =>
      String(text).replace(/[&<>"']/g, (c) => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
      ));

    const getBadge = () => {
      let badge = trigger.querySelector(".cart-badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "cart-badge";
        trigger.appendChild(badge);
      }
      return badge;
    };

    const totalQty = () =>
      state.items.reduce((sum, item) => sum + item.qty, 0);

    const subtotal = () =>
      state.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const updateBadge = () => {
      const badge = getBadge();
      const qty = totalQty();
      badge.textContent = String(qty);
      badge.style.display = qty > 0 ? "inline-flex" : "none";
    };

    const cloneItems = () =>
      state.items.map((item) => ({ ...item }));

    const animateItemsIn = () => {
      if (!hasGsap()) return;
      const nodes = itemsList.querySelectorAll(".cart-item");
      if (!nodes.length) return;
      gsap.fromTo(
        nodes,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.45, ease: "power3.out" }
      );
    };

    const animateQtyUpdate = (itemId) => {
      if (!hasGsap()) return;
      const row = itemsList.querySelector(`[data-id="${encodeURIComponent(itemId)}"]`);
      if (!row) return;
      gsap.fromTo(
        row,
        { backgroundColor: "rgba(202, 138, 4, 0.14)" },
        { backgroundColor: "rgba(202, 138, 4, 0)", duration: 0.55, ease: "power3.out" }
      );
    };

    const render = () => {
      if (!state.items.length) {
        itemsList.innerHTML = "";
        emptyState.hidden = false;
      } else {
        emptyState.hidden = true;
        itemsList.innerHTML = state.items.map((item) => (
          `<li class="cart-item" data-id="${encodeURIComponent(item.id)}">
            <div class="cart-item-media">
              <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" />
            </div>
            <div class="cart-item-main">
              <div class="cart-item-top">
                <p class="cart-item-name">${esc(item.name)}</p>
                <button type="button" class="cart-remove-btn" data-action="remove" aria-label="Remove item">X</button>
              </div>
              <p class="cart-item-variant">${esc(item.variant)}</p>
              <div class="cart-item-bottom">
                <div class="cart-qty">
                  <button type="button" class="cart-qty-btn" data-action="dec" aria-label="Decrease quantity">-</button>
                  <span class="cart-qty-val">${item.qty}</span>
                  <button type="button" class="cart-qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-price">${money.format(item.price * item.qty)}</div>
              </div>
            </div>
          </li>`
        )).join("");
      }

      subtotalEl.textContent = money.format(subtotal());
      updateBadge();
      document.dispatchEvent(new CustomEvent("cart-updated", { detail: cloneItems() }));
    };

    const closeCart = () => {
      if (!isOpen) return;
      isOpen = false;

      if (openTl) openTl.kill();
      if (closeTl) closeTl.kill();

      document.removeEventListener("keydown", onEsc);
      if (globalLenis) globalLenis.start();

      if (!hasGsap()) {
        root.classList.remove("is-open");
        root.setAttribute("aria-hidden", "true");
        document.body.classList.remove("cart-open");
        return;
      }

      closeTl = gsap.timeline({
        defaults: { duration: 0.46, ease: "power3.out" },
        onComplete: () => {
          root.classList.remove("is-open");
          root.setAttribute("aria-hidden", "true");
          document.body.classList.remove("cart-open");
        },
      });

      closeTl
        .to(panel, { xPercent: 100 }, 0)
        .to(overlay, { autoAlpha: 0, duration: 0.38 }, 0);
    };

    const openCart = () => {
      if (isOpen) return;
      isOpen = true;
      root.classList.add("is-open");
      root.setAttribute("aria-hidden", "false");
      document.body.classList.add("cart-open");

      if (openTl) openTl.kill();
      if (closeTl) closeTl.kill();

      if (globalLenis) globalLenis.stop();
      document.addEventListener("keydown", onEsc);

      if (!hasGsap()) {
        return;
      }

      openTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      openTl
        .to(overlay, { autoAlpha: 1, duration: 0.4 }, 0)
        .to(panel, { xPercent: 0, duration: 0.58 }, 0)
        .add(animateItemsIn, 0.22);
    };

    const normalizeItem = (item) => ({
      id: String(item.id),
      name: String(item.name || "Untitled Product"),
      variant: String(item.variant || "Default"),
      image: String(item.image || "../assets/images/logo.png"),
      qty: Math.max(1, Number(item.qty) || 1),
      price: Math.max(0, Number(item.price) || 0),
    });

    const CartStore = {
      add(item) {
        if (!item || item.id == null) return cloneItems();
        const incoming = normalizeItem(item);
        const existing = state.items.find((entry) => entry.id === incoming.id);
        if (existing) {
          existing.qty += incoming.qty;
          existing.name = incoming.name;
          existing.variant = incoming.variant;
          existing.price = incoming.price;
          existing.image = incoming.image;
        } else {
          state.items.push(incoming);
        }
        render();
        animateQtyUpdate(incoming.id);
        if (window.apiSyncCart) window.apiSyncCart(state.items);
        return cloneItems();
      },
      remove(id) {
        const key = String(id);
        state.items = state.items.filter((item) => item.id !== key);
        render();
        if (window.apiSyncCart) window.apiSyncCart(state.items);
        return cloneItems();
      },
      update(id, qty) {
        const key = String(id);
        const nextQty = Math.floor(Number(qty));
        const existing = state.items.find((item) => item.id === key);
        if (!existing) return cloneItems();
        if (!Number.isFinite(nextQty) || nextQty <= 0) {
          return CartStore.remove(key);
        }
        existing.qty = nextQty;
        render();
        animateQtyUpdate(key);
        if (window.apiSyncCart) window.apiSyncCart(state.items);
        return cloneItems();
      },
      clear() {
        state.items = [];
        render();
        if (window.apiSyncCart) window.apiSyncCart(state.items);
        return cloneItems();
      },
      open: openCart,
      close: closeCart,
      get items() {
        return cloneItems();
      },
    };

    const onEsc = (e) => {
      if (e.key === "Escape") closeCart();
    };

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-cart-close]")) {
        e.preventDefault();
        closeCart();
        return;
      }

      const actionBtn = e.target.closest("[data-action]");
      if (!actionBtn) return;

      const row = actionBtn.closest(".cart-item");
      if (!row) return;

      const itemId = decodeURIComponent(row.getAttribute("data-id") || "");
      const item = state.items.find((entry) => entry.id === itemId);
      if (!item) return;

      const action = actionBtn.getAttribute("data-action");
      if (action === "inc") CartStore.update(itemId, item.qty + 1);
      if (action === "dec") CartStore.update(itemId, item.qty - 1);
      if (action === "remove") CartStore.remove(itemId);
    });

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
    });

    document.querySelectorAll(".prod-card .prod-btn-cart").forEach((btn, idx) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const card = btn.closest(".prod-card");
        if (!card) return;

        const id = card.dataset.pid || `product-${idx + 1}`;
        const name = card.querySelector(".prod-name")?.textContent?.trim() || "Product";
        const variant = card.querySelector(".prod-sub")?.textContent?.trim() || "Standard";
        const priceText = card.querySelector(".prod-price")?.textContent || "$0";
        const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;
        const image = card.querySelector(".prod-img-1")?.getAttribute("src") || "../assets/images/logo.png";

        CartStore.add({ id, name, variant, image, qty: 1, price });
        openCart();
      });
    });

    if (hasGsap()) {
      gsap.set(panel, { xPercent: 100 });
      gsap.set(overlay, { autoAlpha: 0 });
    }

    window.CartStore = CartStore;

    // Asynchronously load cart from backend if available
    if (window.apiFetchCart) {
      window.apiFetchCart()
        .then((res) => {
          if (res && res.success && res.data && res.data.items) {
            state.items = res.data.items.map((item) => ({
              id: String(item.product.id),
              name: String(item.product.name),
              variant: String(item.size || "Standard"),
              image: String(item.product.images[0] || "../assets/images/logo.png"),
              qty: Number(item.quantity) || 1,
              price: Number(item.product.price) || 0,
            }));
            render();
            console.log(`[Cart] Loaded ${state.items.length} items from backend.`);
          } else {
            render();
          }
        })
        .catch((err) => {
          console.log("[Cart] Unauthenticated or failed to restore cart, starting empty.", err.message);
          render();
        });
    } else {
      render();
    }
  }


  /* ─────────────────────────────────────────────────
     16. FOOTER ANIMATIONS — fade-up columns & wordmark
  ───────────────────────────────────────────────── */
  function initFooterAnimation() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    const cols = footer.querySelectorAll('[data-footer-col]');
    const wordmarkWrap = footer.querySelector('[data-footer-wordmark]');

    if (!hasGsap() || !hasScrollTrigger()) {
      cols.forEach((col) => {
        col.style.opacity = "1";
        col.style.transform = "none";
      });
      if (wordmarkWrap) {
        wordmarkWrap.style.opacity = "1";
        wordmarkWrap.style.transform = "none";
      }
      return;
    }

    // Stagger fade-up for the 3 columns
    if (cols.length) {
      gsap.to(cols, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: footer.querySelector('.footer-grid-wrap'),
          start: 'top 88%',
          once: true,
        },
      });
    }

    // Wordmark reveal: clips up from below
    if (wordmarkWrap) {
      gsap.to(wordmarkWrap, {
        opacity: 1,
        y: 0,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: wordmarkWrap,
          start: 'top 92%',
          once: true,
        },
      });
    }
  }

  /* ─────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────── */
  function init() {
    setLogoFallback();
    initCustomCursor();
    initFlowingMenu();
    initCartDrawer();
    initLoader();
    initLenis();
    initNavbar();
    initScrollReveals();
    initMarquee();
    initCategoryCards();
    initProductCards();
    initHorizontalScroll();
    initParallax();
    initPageTransitions();
    initFooterAnimation();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();


// Setup Back to top logic independently
document.addEventListener('DOMContentLoaded', () => {
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    });

    backToTop.addEventListener('click', () => {
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    backToTop.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    backToTop.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  }
});
