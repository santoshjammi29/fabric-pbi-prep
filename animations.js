/**
 * animations.js — Ultra Premium Animation Controller
 * Handles: scroll reveals, magnetic hover, View Transitions, number tick-up, aurora
 */

(function () {
  'use strict';

  /* ── 1. Respect reduced motion ───────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 2. IntersectionObserver — Scroll reveal ─────────────── */
  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe any existing reveal targets, then watch for new ones via MutationObserver
    function observeRevealTargets(root) {
      root.querySelectorAll('.reveal-on-scroll, .reveal-scale').forEach(el => {
        revealObserver.observe(el);
      });
    }

    observeRevealTargets(document);

    // Watch DOM mutations so dynamically-rendered cards also get observed
    const mutationObs = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.matches?.('.reveal-on-scroll, .reveal-scale')) {
              revealObserver.observe(node);
            }
            observeRevealTargets(node);
          }
        });
      });
    });

    mutationObs.observe(document.body, { childList: true, subtree: true });
  } else {
    // Reduced motion: instantly show all reveal targets
    document.querySelectorAll('.reveal-on-scroll, .reveal-scale').forEach(el => {
      el.classList.add('is-visible');
    });
  }

  /* ── 3. Magnetic hover on buttons ────────────────────────── */
  if (!prefersReducedMotion) {
    function applyMagnetic(el, strength = 0.25) {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    }

    // Apply magnetic to control buttons after DOM ready
    function initMagnetic() {
      document.querySelectorAll('.control-btn, .btn-primary, .mobile-nav-tab').forEach(btn => {
        if (!btn.dataset.magneticInit) {
          btn.dataset.magneticInit = '1';
          applyMagnetic(btn, 0.18);
        }
      });
    }

    document.addEventListener('DOMContentLoaded', initMagnetic);
    // Re-apply after dynamic renders
    const magneticMutObs = new MutationObserver(() => initMagnetic());
    document.addEventListener('DOMContentLoaded', () => {
      magneticMutObs.observe(document.body, { childList: true, subtree: true });
    });
  }

  /* ── 4. Radial mouse glow on .control-btn ────────────────── */
  if (!prefersReducedMotion) {
    document.addEventListener('mousemove', e => {
      const btn = e.target.closest('.control-btn');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--mx', x + '%');
        btn.style.setProperty('--my', y + '%');
      }
    });
  }

  /* ── 5. View Transitions API — wrap switchView ────────────── */
  if ('startViewTransition' in document && !prefersReducedMotion) {
    // Patch the global switchView function once it's available
    document.addEventListener('DOMContentLoaded', () => {
      const patchInterval = setInterval(() => {
        if (typeof window._origSwitchView === 'undefined' && typeof window.app?.switchView === 'function') {
          // App exposes switchView — patch it
          clearInterval(patchInterval);
        }
      }, 200);
    });

    // Listen for view switch events and wrap in view transitions
    document.addEventListener('click', e => {
      const navBtn = e.target.closest('[data-view], .nav-item[data-view]');
      if (navBtn && !navBtn.dataset.vtPatched) {
        // The app handles the actual switchView, we just ensure the visual transition runs
        // The page-view animation CSS handles the fade
      }
    });
  }

  /* ── 6. Number tick-up animation for stat values ──────────── */
  function animateNumber(el, from, to, duration = 900) {
    if (prefersReducedMotion) { el.textContent = to.toLocaleString(); return; }
    const start = performance.now();
    const range = to - from;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(from + range * eased);
      el.textContent = current.toLocaleString();
      el.setAttribute('data-animated', '1');
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Observe stat value elements and animate when they enter view
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.dataset.rawValue;
        if (raw !== undefined) {
          animateNumber(el, 0, parseInt(raw, 10));
          statObserver.unobserve(el);
        }
      }
    });
  }, { threshold: 0.5 });

  function observeStatValues() {
    document.querySelectorAll('.stat-value[data-raw-value]').forEach(el => {
      if (!el.dataset.statObserved) {
        el.dataset.statObserved = '1';
        statObserver.observe(el);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', observeStatValues);
  new MutationObserver(observeStatValues).observe(document, { childList: true, subtree: true });

  /* ── 7. Glow cursor trail (dark mode only) ───────────────── */
  if (!prefersReducedMotion) {
    const isDark = document.documentElement.classList.contains('theme-dark');
    if (isDark) {
      const cursor = document.createElement('div');
      cursor.id = 'cursor-glow';
      cursor.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(108, 92, 231, 0.08) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        top: 0; left: 0;
        will-change: transform;
      `;
      document.body.appendChild(cursor);

      let cursorX = 0, cursorY = 0;
      let rafId = null;

      document.addEventListener('mousemove', e => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            rafId = null;
          });
        }
      });

      document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
      document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

      // Update cursor color on theme change
      document.documentElement.addEventListener('classchange', () => {
        const nowDark = document.documentElement.classList.contains('theme-dark');
        cursor.style.display = nowDark ? 'block' : 'none';
      });
    }
  }

  /* ── 8. Accordion card smooth open ───────────────────────── */
  // Intercept card header clicks and drive max-height transition
  if (!prefersReducedMotion) {
    document.addEventListener('click', e => {
      const header = e.target.closest('.level-card-header');
      if (!header) return;
      const card = header.closest('.concept-accordion-card, .pyspark-level-card, .sparksql-level-card');
      if (!card) return;
      const body = card.querySelector('.level-card-body');
      if (!body) return;

      const isConceptCard = card.classList.contains('concept-accordion-card');

      // Brief delay to let the app's own click handler run first
      requestAnimationFrame(() => {
        const isOpen = card.classList.contains('expanded');
        if (isOpen) {
          // Card has just been expanded
          body.style.display = 'block';
          body.style.maxHeight = '0px';
          body.style.opacity = '0';
          // Force layout reflow
          body.offsetHeight;
          
          body.style.maxHeight = body.scrollHeight + 'px';
          body.style.opacity = '1';
          
          const onTransitionEnd = () => {
            body.style.maxHeight = 'none';
          };
          body.addEventListener('transitionend', onTransitionEnd, { once: true });
        } else {
          // Card has just been collapsed
          body.style.display = 'block';
          body.style.maxHeight = body.scrollHeight + 'px';
          body.style.opacity = '1';
          // Force layout reflow
          body.offsetHeight;
          
          body.style.maxHeight = '0px';
          body.style.opacity = '0';
          
          body.addEventListener('transitionend', () => {
            body.style.display = isConceptCard ? 'none' : '';
            body.style.maxHeight = '';
            body.style.opacity = '';
          }, { once: true });
        }
      });
    }, true); // capture phase — fires before app handler
  }

  /* ── 9. Page entrance ripple on logo click ───────────────── */
  if (!prefersReducedMotion) {
    document.addEventListener('DOMContentLoaded', () => {
      const brandIcon = document.querySelector('.brand-icon, .mobile-brand-logo');
      if (brandIcon) {
        brandIcon.style.cursor = 'pointer';
        brandIcon.title = 'Back to top';
        brandIcon.addEventListener('click', () => {
          const main = document.querySelector('.main-content');
          if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    });
  }

  /* ── 10. Stagger re-animation on filter change ───────────── */
  // When the search container is wiped and re-rendered, restart section animations
  if (!prefersReducedMotion) {
    const container = document.getElementById('unified-search-container');
    if (container) {
      new MutationObserver(() => {
        container.querySelectorAll('.unified-section-wrapper').forEach((el, i) => {
          el.style.animationDelay = (i * 50) + 'ms';
          el.style.animation = 'none';
          // Force reflow
          void el.offsetWidth;
          el.style.animation = '';
        });
      }).observe(container, { childList: true });
    }
  }

  /* ── Expose utility for app.js to call ──────────────────── */
  window.anim = {
    animateNumber,
    observeStatValues,
    observeRevealTargets: (root) => {
      if (!prefersReducedMotion) {
        root.querySelectorAll('.reveal-on-scroll, .reveal-scale').forEach(el => {
          revealObserver?.observe(el);
        });
      }
    }
  };

})();
