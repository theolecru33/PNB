/* ============================================================
   PIN BOUTEILLE — Interactions
   GSAP + ScrollTrigger + Lenis
   ============================================================ */

(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -- Lenis smooth scroll ---------------------------------- */
  let lenis = null;
  if (window.Lenis && !prefersReduced) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
  }

  /* -- GSAP setup -------------------------------------------- */
  if (window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    if (lenis && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else if (lenis) {
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }

    /* Hero image parallax */
    const heroImg = $('[data-hero-img]');
    if (heroImg && !prefersReduced) {
      gsap.fromTo(heroImg,
        { scale: 1.12, y: 0 },
        { scale: 1.04, duration: 2.4, ease: 'power3.out', delay: 0.05 }
      );
      gsap.to(heroImg, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      });
    }

    /* Hero card entrance */
    if (!prefersReduced) {
      const heroCard = $('.hero__card');
      if (heroCard) {
        gsap.from(heroCard, {
          y: 30,
          opacity: 0,
          scale: 0.96,
          duration: 1.4,
          ease: 'power3.out',
          delay: 0.3,
        });
      }
      const heroScroll = $('.hero__scroll');
      if (heroScroll) {
        gsap.from(heroScroll, { opacity: 0, duration: 0.6, delay: 1.2 });
      }
    }

    /* Section titles + reveals */
    if (!prefersReduced && window.ScrollTrigger) {
      $$('[data-split]').forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
      });

      $$('[data-reveal]').forEach((el) => {
        if (el.closest('.hero')) return;
        gsap.from(el, {
          y: 22,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
      });

      /* Manifesto staggered lines */
      const quote = $('.manifesto__quote');
      if (quote) {
        gsap.from(quote.querySelectorAll('span'), {
          y: 30,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: quote, start: 'top 80%' }
        });
      }

      /* Card images subtle parallax */
      $$('.card__media img').forEach((img) => {
        gsap.to(img, {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      });

      /* Visit photo zoom on scroll */
      const visitPhoto = $('.visit__photo img');
      if (visitPhoto) {
        gsap.fromTo(visitPhoto,
          { scale: 1.1 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.visit__photo',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );
      }
    }
  }

  if (window.ScrollTrigger) {
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* -- Nav scrolled state ------------------------------------ */
  const nav = $('[data-nav]');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 50) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -- Carte hover image follower ---------------------------- */
  const carteList  = $('[data-carte-list]');
  const carteHover = $('[data-carte-hover]');
  const carteImg   = $('[data-carte-img]');

  if (carteList && carteHover && carteImg && !window.matchMedia('(max-width: 768px)').matches) {
    let mouseX = 0, mouseY = 0;
    let imgX   = 0, imgY = 0;
    let rafId  = null;
    let active = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      imgX = lerp(imgX, mouseX, 0.16);
      imgY = lerp(imgY, mouseY, 0.16);
      carteHover.style.transform = `translate(calc(${imgX}px - 50%), calc(${imgY}px - 50%)) scale(${active ? 1 : 0.85})`;
      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafId) animate();
    }, { passive: true });

    $$('.carte__item', carteList).forEach((item) => {
      const src = item.dataset.img;
      if (!src) return;

      item.addEventListener('mouseenter', () => {
        carteImg.src = src;
        active = true;
        carteHover.classList.add('is-visible');
      });
      item.addEventListener('mouseleave', () => {
        active = false;
        carteHover.classList.remove('is-visible');
      });
    });
  }

  /* -- Overlays (menu + reservation) ------------------------- */
  const overlays = {
    menu: $('[data-overlay="menu"]'),
    reservation: $('[data-overlay="reservation"]')
  };

  const lockBody = () => document.body.classList.add('is-locked');
  const unlockBody = () => document.body.classList.remove('is-locked');

  const openOverlay = (key) => {
    const ov = overlays[key];
    if (!ov) return;
    ov.classList.add('is-open');
    ov.setAttribute('aria-hidden', 'false');
    lockBody();
    if (lenis) lenis.stop();
  };

  const closeOverlay = (key) => {
    const ov = key ? overlays[key] : null;
    Object.values(overlays).forEach((o) => {
      if (!o) return;
      if (!key || o === ov) {
        o.classList.remove('is-open');
        o.setAttribute('aria-hidden', 'true');
      }
    });
    unlockBody();
    if (lenis) lenis.start();
  };

  $$('[data-open]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.dataset.open;
      openOverlay(key);
    });
  });

  $$('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeOverlay());
  });

  $$('[data-close-nav]').forEach((a) => {
    a.addEventListener('click', () => {
      closeOverlay();
      const href = a.getAttribute('href');
      if (href && href.startsWith('#') && lenis) {
        const target = document.querySelector(href);
        if (target) {
          setTimeout(() => lenis.scrollTo(target, { duration: 1.2 }), 350);
        }
      }
    });
  });

  Object.values(overlays).forEach((ov) => {
    if (!ov) return;
    ov.addEventListener('click', (e) => {
      if (e.target === ov) closeOverlay();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay();
  });

  /* -- Smooth anchor scroll ---------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    if (a.matches('[data-close-nav]')) return;
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.2, offset: -10 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* -- Booking form ------------------------------------------ */
  const bookingForm = $('[data-booking]');
  const toast       = $('[data-toast]');

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 4200);
  };

  if (bookingForm) {
    const dateInput = $('#bk-date');
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.min = `${yyyy}-${mm}-${dd}`;
      dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#bk-name')?.value?.trim();
      const date = $('#bk-date')?.value;
      const time = $('#bk-time')?.value;
      if (!name || !date || !time) {
        showToast('Merci de remplir la date, le service et votre nom.');
        return;
      }
      closeOverlay();
      showToast(`Demande envoyée. ${name}, on vous rappelle pour confirmer.`);
      bookingForm.reset();
      if (dateInput) dateInput.value = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
    });
  }

  /* -- Year (footer) ----------------------------------------- */
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
