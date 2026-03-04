/**
 * animations.js — Flash homepage sparkliness
 * - Scroll-reveal: CSS transitions triggered by IntersectionObserver
 * - Stat counters: hero numbers count up on load
 * Respects prefers-reduced-motion throughout.
 */

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. SCROLL-REVEAL ─────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.revealDelay || '0', 10);
        setTimeout(() => {
          el.classList.add('is-revealed');
        }, delay);
        revealObserver.unobserve(el); // fire once
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  function initScrollReveal() {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (reducedMotion) {
        el.classList.add('is-revealed'); // instant for reduced-motion users
      } else {
        revealObserver.observe(el);
      }
    });
  }

  /* ── 2. STAT COUNTERS ─────────────────────────────────────── */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function parseStatValue(text) {
    // e.g. "10k+" → { value: 10, suffix: 'k+' }
    //      "2,500+" → { value: 2500, suffix: '+' }
    //      "34+" → { value: 34, suffix: '+' }
    const clean = text.replace(/,/g, '');
    const match = clean.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (!match) return null;
    return { value: parseFloat(match[1]), suffix: match[2] };
  }

  function formatNumber(n, originalValue) {
    // Preserve comma formatting for numbers >= 1000
    if (originalValue >= 1000) {
      return Math.floor(n).toLocaleString('en-US');
    }
    return Math.floor(n).toString();
  }

  function animateCounter(el) {
    const parsed = parseStatValue(el.textContent.trim());
    if (!parsed) return;
    const { value: target, suffix } = parsed;
    const duration = 1200;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = easeOutQuart(progress) * target;
      el.textContent = formatNumber(current, target) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target, target) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    if (reducedMotion) return;
    document.querySelectorAll('.hero-stat-number').forEach((el) => {
      animateCounter(el);
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  // Counters run on load (hero is above fold)
  // Scroll-reveal waits for components to load
  function init() {
    initCounters();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also re-run scroll reveal after components load (header/footer)
  document.addEventListener('componentsLoaded', initScrollReveal);
})();
