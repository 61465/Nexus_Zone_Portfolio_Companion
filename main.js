
/* ═══════════════════════════════════════════════════
   سوار الأندلس — main.js
   Virtual intro + site interactions
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Config ── */
  const STAGE_IDS = ['gate', 'stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5', 'stage-door'];
  const STAGE_DURATIONS = [0, 2600, 3200, 3000, 3000, 3000, 0]; // ms auto-advance (0 = manual)

  /* ── State ── */
  let currentStage = 0;
  let autoTimer = null;
  let introComplete = false;
  let transitioning = false;

  /* ── Elements (declared as let, resolved in init() for safety) ── */
  let intro, mainContent, skipBtn, enterBtn, illuminateOverlay, gateContent;
  let dots, doorScene, doorPanelL, doorPanelR, doorLight, doorBurst, doorCta;
  let navbar, menuToggle, navLinks, lightbox, lbImg, lbClose;

  /* ════════════════════════════════
     HELPER: show stage by index
  ════════════════════════════════ */
  function showStage(index, direction) {
    if (transitioning) return;
    transitioning = true;

    const stages = document.querySelectorAll('.stage');
    const prev = stages[currentStage];
    const next = stages[index];

    // deactivate prev
    if (prev && prev !== next) {
      prev.classList.remove('active');
      prev.classList.add(direction === 'forward' ? 'exit-left' : 'exit-right');
      setTimeout(() => prev.classList.remove('exit-left', 'exit-right'), 1000);
    }

    // activate next
    next.classList.add('active');
    updateDots(index);

    // per-stage init
    if (index === 1) animateLogo();
    if (index >= 2 && index <= 5) animateCaption(next);
    if (index === 6) initDoor();

    currentStage = index;

    // show skip after gate
    if (index >= 1) {
      skipBtn.classList.add('show');
    }

    // schedule auto-advance
    clearTimeout(autoTimer);
    const dur = STAGE_DURATIONS[index];
    if (dur > 0) {
      autoTimer = setTimeout(() => {
        transitioning = false;
        if (currentStage === index && !introComplete) {
          goNext();
        }
      }, dur);
    } else {
      setTimeout(() => { transitioning = false; }, 600);
    }
  }

  function goNext() {
    if (currentStage < STAGE_IDS.length - 1) {
      showStage(currentStage + 1, 'forward');
    }
  }

  /* ════════════════════════════════
     STAGE ANIMATIONS
  ════════════════════════════════ */

  // Stage 1: SVG stroke draw + fill + subtitle
  function animateLogo() {
    const stroke = document.querySelector('.logo-stroke');
    const fill   = document.querySelector('.logo-fill');
    const sub    = document.querySelector('.logo-sub');
    if (!stroke) return;

    // reset
    stroke.style.strokeDashoffset = '1000';
    stroke.style.opacity = '0.85';
    fill.style.opacity = '0';
    sub.style.opacity = '0';
    sub.style.transform = 'translateY(20px)';

    // draw
    setTimeout(() => {
      stroke.style.transition = 'stroke-dashoffset 2s cubic-bezier(.65,.05,.36,1)';
      stroke.style.strokeDashoffset = '0';
    }, 300);

    // fill
    setTimeout(() => {
      fill.style.transition = 'opacity 1s ease';
      fill.style.opacity = '1';
      stroke.style.transition = 'opacity 0.8s ease';
      stroke.style.opacity = '0';
    }, 2200);

    // subtitle
    setTimeout(() => {
      sub.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      sub.style.opacity = '1';
      sub.style.transform = 'translateY(0)';
    }, 2600);
  }

  // Image stages: caption slide up
  function animateCaption(stageEl) {
    const caption = stageEl.querySelector('.caption');
    if (!caption) return;
    caption.style.opacity = '0';
    caption.style.transform = 'translateY(40px)';
    setTimeout(() => {
      caption.style.transition = 'opacity 1s ease, transform 1s ease';
      caption.style.opacity = '1';
      caption.style.transform = 'translateY(0)';
    }, 600);
  }

  /* ════════════════════════════════
     STAGE 6: DOOR
  ════════════════════════════════ */
  function initDoor() {
    if (!doorScene) return;
    doorScene.addEventListener('click', openDoor, { once: true });
    doorScene.addEventListener('touchstart', openDoor, { once: true });

    // ambient shimmer on door
    let shimmerTick = 0;
    const shimmerInterval = setInterval(() => {
      if (introComplete) { clearInterval(shimmerInterval); return; }
      shimmerTick++;
      if (doorLight) {
        doorLight.style.transition = 'opacity 1.5s ease';
        doorLight.style.opacity = shimmerTick % 2 === 0 ? '0.06' : '0.12';
      }
    }, 1500);
  }

  function openDoor() {
    if (!doorPanelL || !doorPanelR) return;

    // swing doors open
    doorPanelL.style.transform = 'perspective(1200px) rotateY(80deg)';
    doorPanelR.style.transform = 'perspective(1200px) rotateY(-80deg)';

    // light burst
    if (doorLight) {
      doorLight.style.transition = 'opacity 0.8s ease';
      doorLight.style.opacity = '1';
    }

    // burst orb
    if (doorBurst) {
      doorBurst.style.transition = 'opacity 0.4s ease, transform 1.2s cubic-bezier(.17,.67,.83,.67)';
      doorBurst.style.opacity = '0.95';
      doorBurst.style.transform = 'scale(8)';
    }

    if (doorCta) {
      doorCta.style.transition = 'opacity 0.3s ease';
      doorCta.style.opacity = '0';
    }

    // white-out flash then reveal main site
    setTimeout(revealSite, 900);
  }

  /* ════════════════════════════════
     REVEAL MAIN SITE
  ════════════════════════════════ */
  function revealSite() {
    introComplete = true;
    skipBtn.classList.remove('show');

    // flash overlay
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99999;pointer-events:none;opacity:0;transition:opacity 0.4s ease';
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '1'; });

    setTimeout(() => {
      // hide intro
      intro.style.transition = 'opacity 0.6s ease';
      intro.style.opacity = '0';
      setTimeout(() => { intro.style.display = 'none'; }, 650);

      // show main
      mainContent.classList.add('visible');

      // fade out flash
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 600);

      // animate hero elements in
      animateHeroIn();

      // scroll to top
      window.scrollTo(0, 0);
    }, 350);
  }

  function animateHeroIn() {
    const eyebrow    = document.querySelector('.eyebrow');
    const heroTitle  = document.querySelector('.hero-title');
    const heroSub    = document.querySelector('.hero-sub');
    const heroCta    = document.querySelector('.hero-cta');
    const heroScroll = document.querySelector('.hero-scroll');

    const els = [eyebrow, heroTitle, heroSub, heroCta, heroScroll];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 150);
    });
  }

  /* ════════════════════════════════
     DOT PROGRESS
  ════════════════════════════════ */
  function updateDots(index) {
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  /* ════════════════════════════════
     SKIP INTRO
  ════════════════════════════════ */
  function skipIntro() {
    clearTimeout(autoTimer);
    transitioning = false;
    revealSite();
  }

  /* ════════════════════════════════
     NAVBAR SCROLL
  ════════════════════════════════ */
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    // scroll-reveal elements
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        el.classList.add('revealed');
      }
    });

    // active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });

    // parallax hero
    const heroBg = document.querySelector('.hero-bg img');
    if (heroBg) {
      heroBg.style.transform = `scale(1.08) translateY(${window.scrollY * 0.25}px)`;
    }
  }

  /* ════════════════════════════════
     MOBILE MENU
  ════════════════════════════════ */
  function toggleMenu() {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open);
    menuToggle.classList.toggle('active', open);
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('active');
  }

  /* ════════════════════════════════
     GALLERY LIGHTBOX
  ════════════════════════════════ */
  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lightbox.hidden = false;
    lightbox.style.opacity = '0';
    requestAnimationFrame(() => {
      lightbox.style.transition = 'opacity 0.35s ease';
      lightbox.style.opacity = '1';
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }, 350);
  }

  /* ════════════════════════════════
     STAT COUNTER ANIMATION
  ════════════════════════════════ */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (!target) return;
    let start = 0;
    const dur = 2000;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('ar-SA');
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('ar-SA');
    };
    requestAnimationFrame(step);
  }

  /* ════════════════════════════════
     SCROLL-REVEAL SETUP
  ════════════════════════════════ */
  function setupReveal() {
    const targets = document.querySelectorAll(
      '.about-text p, .stat, .amen-card, .gal-item, .loc-text, .loc-map, .con-info, .con-form, .section-head'
    );
    targets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
    });
  }

  /* ════════════════════════════════
     PARTICLES ON GATE
  ════════════════════════════════ */
  function initParticles() {
    const gate = document.getElementById('gate');
    if (!gate) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('span');
      p.className = 'gate-particle';
      p.style.cssText = `
        position:absolute;
        width:${1 + Math.random() * 2}px;
        height:${1 + Math.random() * 2}px;
        border-radius:50%;
        background:var(--gold);
        opacity:${0.1 + Math.random() * 0.4};
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation: floatDust ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 4}s infinite alternate;
        pointer-events:none;
      `;
      gate.appendChild(p);
    }

    // Add keyframes if not present
    if (!document.getElementById('particle-kf')) {
      const style = document.createElement('style');
      style.id = 'particle-kf';
      style.textContent = `
        @keyframes floatDust {
          0%   { transform: translate(0, 0) scale(1); opacity: inherit; }
          33%  { transform: translate(15px, -30px) scale(1.2); }
          66%  { transform: translate(-10px, -55px) scale(0.8); }
          100% { transform: translate(20px, -80px) scale(0.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ════════════════════════════════
     CURSOR GLOW (desktop)
  ════════════════════════════════ */
  function initCursorGlow() {
    if (window.matchMedia('(hover: none)').matches) return;
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.cssText = `
      position:fixed;pointer-events:none;z-index:99998;
      width:400px;height:400px;border-radius:50%;
      background:radial-gradient(circle, rgba(201,165,91,.08) 0%, transparent 70%);
      transform:translate(-50%,-50%);
      transition:opacity 0.3s;
      will-change:left,top;
    `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

  /* ════════════════════════════════
     ILLUMINATE OVERLAY
  ════════════════════════════════ */
  function handleIlluminate() {
    if (!illuminateOverlay) return;

    // Phase 1: trigger light burst (rays + glow expand)
    illuminateOverlay.classList.add('lit');

    // Play a brief screen flash for dramatic effect
    const flash = document.createElement('div');
    flash.style.cssText = [
      'position:fixed', 'inset:0', 'pointer-events:none', 'z-index:9000',
      'background:radial-gradient(ellipse at center,',
        'rgba(255,230,150,.25) 0%,', 'rgba(201,165,91,.1) 40%,', 'transparent 70%)',
      'opacity:0', 'transition:opacity .25s ease'
    ].join(';');
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '1'; });
    setTimeout(() => {
      flash.style.transition = 'opacity .8s ease';
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 900);
    }, 250);

    // Phase 2: after overlay fades, reveal gate-content
    setTimeout(() => {
      if (gateContent) gateContent.classList.add('illuminated');
    }, 500);

    // Remove overlay from DOM after full fade
    setTimeout(() => {
      if (illuminateOverlay) illuminateOverlay.remove();
    }, 1600);
  }

  function init() {
    // Resolve elements when DOM is fully ready
    intro             = document.getElementById('intro');
    mainContent       = document.getElementById('main-content');
    skipBtn           = document.getElementById('skip-intro');
    enterBtn          = document.getElementById('enter-btn');
    illuminateOverlay = document.getElementById('illuminate-overlay');
    gateContent       = document.getElementById('gate-content');
    dots              = document.querySelectorAll('.intro-progress .dot');
    doorScene         = document.querySelector('.door-scene');
    doorPanelL        = document.querySelector('.door-panel.left');
    doorPanelR        = document.querySelector('.door-panel.right');
    doorLight         = document.querySelector('.door-light');
    doorBurst         = document.querySelector('.door-burst');
    doorCta           = document.querySelector('.door-cta');
    navbar            = document.getElementById('navbar');
    menuToggle        = document.getElementById('menu-toggle');
    navLinks          = document.getElementById('nav-links');
    lightbox          = document.getElementById('lightbox');
    lbImg             = document.getElementById('lb-img');
    lbClose           = document.querySelector('.lb-close');

    // Start at gate
    showStage(0, 'forward');
    initParticles();
    initCursorGlow();
    setupReveal();

    /* ── Illuminate click ── */
    if (illuminateOverlay) {
      illuminateOverlay.addEventListener('click', handleIlluminate);
      illuminateOverlay.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleIlluminate(); }
      });
    }

    /* ── Enter button ── */
    if (enterBtn) {
      enterBtn.addEventListener('click', e => {
        e.stopPropagation();
        transitioning = false;   // always clear before stage jump
        showStage(1, 'forward');
      });
    }

    // Skip
    if (skipBtn) {
      skipBtn.addEventListener('click', skipIntro);
    }

    // Mouse click navigation for stages 1 to 5
    if (intro) {
      intro.addEventListener('click', e => {
        if (introComplete) return;

        // Ignore if user clicked on skip button, enter button, illuminate overlay or door-scene
        if (
          e.target.closest('#skip-intro') ||
          e.target.closest('#enter-btn') ||
          e.target.closest('#illuminate-overlay') ||
          e.target.closest('#door-scene')
        ) {
          return;
        }

        // Only allow clicking to advance on stages 1 to 5
        if (currentStage >= 1 && currentStage <= 5) {
          transitioning = false;
          goNext();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (introComplete) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        
        // Stage-specific keyboard navigation
        if (currentStage === 0) {
          // If gate is not illuminated, illuminate it first
          const overlay = document.getElementById('illuminate-overlay');
          if (overlay && !overlay.classList.contains('lit')) {
            handleIlluminate();
          } else {
            // If already illuminated, go to stage 1
            transitioning = false;
            showStage(1, 'forward');
          }
        } else if (currentStage === 6) {
          openDoor();
        } else {
          transitioning = false;
          goNext();
        }
      }
      if (e.key === 'Escape') skipIntro();
    });


    // Scroll events
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    menuToggle.addEventListener('click', toggleMenu);
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) closeMenu();
    });

    // Gallery lightbox
    document.querySelectorAll('.gal-item').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        openLightbox(item.dataset.src || img.src, img.alt);
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (!lightbox.hidden && e.key === 'Escape') closeLightbox();
    });

    // Stat counters with IntersectionObserver
    const statObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-num[data-count]').forEach(el => statObs.observe(el));

    // Reveal observer
    const revObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

    // Active nav link highlighting on click
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', function () {
        document.querySelectorAll('.nav-links a').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Smooth section offset for fixed header — only after intro completes
    document.querySelectorAll('.nav-links a, .foot-links a, .cta-btn, .btn-primary, .btn-ghost').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        if (!introComplete) return;  // don't interfere during intro
        const href = this.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = navbar.offsetHeight + 20;
          window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        }
      });
    });

    // Form submission
    const form = document.querySelector('.con-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const ok = this.querySelector('.form-ok');
        const btn = this.querySelector('button[type=submit]');
        btn.disabled = true;
        btn.textContent = '...جارٍ الإرسال';
        setTimeout(() => {
          ok.hidden = false;
          this.reset();
          btn.disabled = false;
          btn.textContent = 'إرسال الطلب';
          setTimeout(() => { ok.hidden = true; }, 6000);
        }, 1200);
      });
    }

    // Preload images
    const imgs = document.querySelectorAll('.stage img, .hero-bg img');
    imgs.forEach(img => {
      if (img.src) {
        const preload = new Image();
        preload.src = img.src;
      }
    });
  }

  /* ── Run on DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
