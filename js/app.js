/* ═══════════════════════════════════════════════════════════
   LASCIVIOUS VIBRATIONS — MAIN APPLICATION
   Router · Realm System · Reactive Layer · Reveal System
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── REALM COLOR MAP ── */
  const REALM_COLORS = {
    home:    { r: 180, g: 140, b: 232, css: 'rgba(180, 140, 232,' },   // Violet/Pink
    drops:   { r: 0,   g: 200, b: 220, css: 'rgba(0, 200, 220,' },     // Cyan/Magenta
    drop001: { r: 220, g: 100, b: 140, css: 'rgba(220, 100, 140,' },   // Pink/Rose
    drop002: { r: 200, g: 160, b: 60,  css: 'rgba(200, 160, 60,' },    // Gold/Amber
    drop003: { r: 100, g: 180, b: 220, css: 'rgba(100, 180, 220,' },   // Celestial Blue
    drop004: { r: 200, g: 100, b: 200, css: 'rgba(200, 100, 200,' },   // Magenta/Lavender
    btc:     { r: 201, g: 168, b: 76,  css: 'rgba(201, 168, 76,' },    // Gold/White
    signals: { r: 100, g: 136, b: 255, css: 'rgba(100, 136, 255,' },   // Deep Blue
    darkcanvas: { r: 180, g: 30, b: 45, css: 'rgba(180, 30, 45,' },    // Crimson Blood
    about:   { r: 160, g: 130, b: 200, css: 'rgba(160, 130, 200,' },   // Soft Purple
    void:    { r: 80,  g: 60,  b: 120, css: 'rgba(80, 60, 120,' },     // Dark void
  };

  const TRANSITION_TEXTS = [
    'CROSSING OVER',
    'SHIFTING DIMENSIONS',
    'ENTERING REALM',
    'DESCENDING',
    'DISSOLVING',
    'RECONSTRUCTING',
    'AWAKENING',
  ];

  /* ── STATE ── */
  let currentRealm = 'home';
  let isTransitioning = false;
  let scrollRevealObserver = null;

  /* ── DOM REFERENCES ── */
  const nav = document.getElementById('main-nav');
  const overlay = document.getElementById('transition-overlay');
  const overlayText = overlay.querySelector('.transition-text');
  const mouseGlow = document.getElementById('mouse-glow');
  const realmGlow = document.getElementById('realm-glow');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  /* ═══════════════════════════════════════════════════════ */
  /* ── ROUTER ── */
  /* ═══════════════════════════════════════════════════════ */
  
  function navigateTo(realmId, pushState = true) {
    if (isTransitioning || realmId === currentRealm) return;
    isTransitioning = true;

    // Close mobile menu
    navLinks.classList.remove('open');

    // Random transition text
    overlayText.textContent = TRANSITION_TEXTS[Math.floor(Math.random() * TRANSITION_TEXTS.length)];

    // Fade in overlay
    overlay.classList.add('active');

    setTimeout(() => {
      // Hide current realm
      const current = document.getElementById('realm-' + currentRealm);
      if (current) {
        current.classList.remove('active');
        // Reset reveals for re-entry
        current.querySelectorAll('.revealed').forEach(el => el.classList.remove('revealed'));
      }

      // Show new realm
      const next = document.getElementById('realm-' + realmId);
      if (next) {
        next.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Update realm colors
        setRealmColors(realmId);
        currentRealm = realmId;

        // Show/hide nav
        if (realmId === 'home') {
          nav.classList.add('nav-hidden');
        } else {
          nav.classList.remove('nav-hidden');
        }

        // Update URL
        if (pushState) {
          const hash = realmId === 'home' ? '' : '#' + realmId;
          history.pushState({ realm: realmId }, '', hash || window.location.pathname);
        }

        // Re-observe reveals
        setTimeout(() => {
          setupRevealObserver();
          // Trigger reveals for elements already visible
          triggerVisibleReveals(next);
        }, 100);
      }

      // Fade out overlay
      setTimeout(() => {
        overlay.classList.remove('active');
        isTransitioning = false;
      }, 400);
    }, 600);
  }

  /* ── COLOR SYSTEM ── */
  function setRealmColors(realmId) {
    const color = REALM_COLORS[realmId] || REALM_COLORS.home;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--realm-primary', 
      `rgb(${color.r}, ${color.g}, ${color.b})`);
    document.documentElement.style.setProperty('--realm-glow', 
      `${color.css} 0.15)`);
    document.documentElement.style.setProperty('--realm-glow-strong', 
      `${color.css} 0.4)`);
    
    // Update realm glow gradient
    realmGlow.style.background = `radial-gradient(ellipse at 50% 0%, ${color.css} 0.12) 0%, transparent 70%)`;
    
    // Update particle system
    if (window.voidParticles) {
      window.voidParticles.setRealmColor(color.r, color.g, color.b);
    }
  }

  /* ═══════════════════════════════════════════════════════ */
  /* ── MOUSE REACTOR (Layer 4) ── */
  /* ═══════════════════════════════════════════════════════ */
  
  let mouseRAF = null;
  let targetMouseX = 0, targetMouseY = 0;
  let currentMouseX = 0, currentMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
    
    if (!mouseRAF) {
      mouseRAF = requestAnimationFrame(updateMouseGlow);
    }
  });

  function updateMouseGlow() {
    // Smooth follow
    currentMouseX += (targetMouseX - currentMouseX) * 0.08;
    currentMouseY += (targetMouseY - currentMouseY) * 0.08;
    
    mouseGlow.style.left = currentMouseX + 'px';
    mouseGlow.style.top = currentMouseY + 'px';
    
    mouseRAF = requestAnimationFrame(updateMouseGlow);
  }

  /* ═══════════════════════════════════════════════════════ */
  /* ── SCROLL REVEAL SYSTEM ── */
  /* ═══════════════════════════════════════════════════════ */
  
  function setupRevealObserver() {
    if (scrollRevealObserver) scrollRevealObserver.disconnect();
    
    scrollRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          scrollRevealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all reveal elements in active realm
    const activeRealm = document.querySelector('.realm.active');
    if (activeRealm) {
      activeRealm.querySelectorAll('.reveal-text, .reveal-up').forEach(el => {
        if (!el.classList.contains('revealed')) {
          scrollRevealObserver.observe(el);
        }
      });
    }
  }

  function triggerVisibleReveals(container) {
    // Immediately reveal elements that are already in viewport
    const viewportHeight = window.innerHeight;
    container.querySelectorAll('.reveal-text, .reveal-up').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.85) {
        setTimeout(() => el.classList.add('revealed'), 100);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════ */
  /* ── NAV SCROLL BEHAVIOR ── */
  /* ═══════════════════════════════════════════════════════ */

  let lastScrollY = 0;
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        // Show nav after scrolling down on home
        if (currentRealm === 'home' && scrollY > window.innerHeight * 0.7) {
          nav.classList.remove('nav-hidden');
        } else if (currentRealm === 'home' && scrollY < window.innerHeight * 0.5) {
          nav.classList.add('nav-hidden');
        }
        
        // Add scrolled class for background
        if (scrollY > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        
        lastScrollY = scrollY;
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  /* ═══════════════════════════════════════════════════════ */
  /* ── EVENT BINDING ── */
  /* ═══════════════════════════════════════════════════════ */

  // All [data-navigate] elements
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-navigate]');
    if (trigger) {
      e.preventDefault();
      const target = trigger.dataset.navigate;
      navigateTo(target);
    }
  });

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Browser back/forward
  window.addEventListener('popstate', (e) => {
    const realm = (e.state && e.state.realm) || getRealmFromHash();
    navigateTo(realm, false);
  });

  function getRealmFromHash() {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  }

  /* ═══════════════════════════════════════════════════════ */
  /* ── BUTTON HOVER EFFECTS ── */
  /* ═══════════════════════════════════════════════════════ */

  // Add ripple to portal buttons
  document.querySelectorAll('.btn-portal').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });

  // Portal hover sound-like pulse
  document.querySelectorAll('.portal').forEach(portal => {
    portal.addEventListener('mouseenter', () => {
      const frame = portal.querySelector('.portal-frame');
      if (frame) {
        frame.style.animation = 'none';
        void frame.offsetHeight; // Reflow
        frame.style.animation = 'breathe 3s ease-in-out infinite';
      }
    });
  });

  /* ═══════════════════════════════════════════════════════ */
  /* ── INITIALIZATION ── */
  /* ═══════════════════════════════════════════════════════ */

  function init() {
    // Check for hash route
    const initialRealm = getRealmFromHash();
    
    if (initialRealm !== 'home') {
      // Direct navigation to a specific realm
      document.getElementById('realm-home').classList.remove('active');
      const target = document.getElementById('realm-' + initialRealm);
      if (target) {
        target.classList.add('active');
        currentRealm = initialRealm;
        nav.classList.remove('nav-hidden');
      }
    }

    // Set initial colors
    setRealmColors(currentRealm);

    // Add entering class for hero animation
    document.body.classList.add('entering');

    // Setup reveal system
    setTimeout(() => {
      setupRevealObserver();
      const activeRealm = document.querySelector('.realm.active');
      if (activeRealm) triggerVisibleReveals(activeRealm);
    }, 500);

    // Start mouse glow
    mouseRAF = requestAnimationFrame(updateMouseGlow);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ═══════════════════════════════════════════════════════ */
  /* ── PARALLAX ON SCROLL (subtle) ── */
  /* ═══════════════════════════════════════════════════════ */

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        // Parallax hero
        const hero = document.querySelector('.realm.active .hero-void .hero-content');
        if (hero) {
          const opacity = Math.max(0, 1 - scrollY / (window.innerHeight * 0.8));
          const translateY = scrollY * 0.3;
          hero.style.transform = `translateY(${translateY}px)`;
          hero.style.opacity = opacity;
        }
        
        // Parallax realm headers
        const realmHeader = document.querySelector('.realm.active .realm-header');
        if (realmHeader && !realmHeader.closest('#realm-home')) {
          const opacity = Math.max(0, 1 - scrollY / (window.innerHeight * 0.6));
          realmHeader.style.opacity = opacity;
        }
      });
    }
  });

})();
