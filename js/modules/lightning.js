/**
 * lightning.js v2 — GSAP + SVG lightning animation
 *
 * Replaces the canvas-based v1 with SVG paths animated via GSAP.
 * Benefits over canvas:
 *   - No DPR/buffer-size mismatch on mobile
 *   - No globalCompositeOperation state leakage
 *   - GSAP opacity tweens are bulletproof cross-device
 *   - SVG scales perfectly at any resolution
 *
 * Preserves:
 *   - Easter egg / Keys of the Caribbean strike counter
 *   - IntersectionObserver (only animates when hero is in view)
 *   - API surface expected by main.js (cvsStorm, observer, animate, startLightning, stormInterval)
 */

// ─── Configuration ────────────────────────────────────────────────────────────
const STRIKE_MIN_DELAY  = 3;    // seconds minimum between strikes
const STRIKE_MAX_DELAY  = 9;    // seconds maximum between strikes
const SUBDIVISIONS      = 4;    // midpoint displacement passes (more = jaggier bolt)
const DISPLACEMENT      = 70;   // max horizontal offset per subdivision (px)
const FORK_CHANCE       = 0.45; // probability a strike spawns a branch bolt
const FLASH_DURATION    = 0.03; // seconds for initial flash-in
const FADE_DURATION     = 0.85; // seconds for the fade-out
const BOLT_COLOR        = 'rgba(200, 240, 255, 1)';
const FORK_COLOR        = 'rgba(160, 220, 255, 0.75)';

// ─── Easter egg state (preserved from v1) ────────────────────────────────────
let lightningStrikeCount = 0;
let rabbitHoleRevealed   = false;
let hunterToken          = null;

// ─── DOM setup ────────────────────────────────────────────────────────────────
const heroSection = document.getElementById('pg-hero');

// Legacy canvas: kept in DOM (main.js checks for it), hidden visually.
const cvsStorm = document.getElementById('lightning-storm');
if (cvsStorm) cvsStorm.style.display = 'none';

// main.js compatibility stubs — called from window.onload
const stormInterval  = 4500;
const animate        = () => {};  // no-op; GSAP handles everything
function startLightning() { startStorm(); }

// Stub observer for main.js's `observer.observe(cvsStorm)` call
const observer = new IntersectionObserver(() => {}, { threshold: 0.05 });

// ─── SVG injection ────────────────────────────────────────────────────────────
if (!heroSection) {
  console.warn('[lightning] #pg-hero not found — aborting.');
} else {
  const svgNS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('id', 'lightning-svg');
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, {
    position:      'absolute',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '1',
    overflow:      'visible',
  });

  // SVG filter: layered gaussian blur for electric glow
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <filter id="bolt-glow" x="-80%" y="-20%" width="260%" height="140%"
            color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="7"   result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);
  heroSection.appendChild(svg);

  // ─── Path generation (midpoint displacement) ────────────────────────────────
  function generatePoints(x0, y0, x1, y1, passes, disp) {
    let pts = [{ x: x0, y: y0 }, { x: x1, y: y1 }];

    for (let pass = 0; pass < passes; pass++) {
      const next = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a  = pts[i];
        const b  = pts[i + 1];
        const mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * disp;
        const my = (a.y + b.y) / 2;
        next.push(a, { x: mx, y: my });
      }
      next.push(pts[pts.length - 1]);
      pts  = next;
      disp *= 0.6; // tighten displacement each pass
    }

    return pts;
  }

  function toPathD(pts) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }

  function makePath(d, strokeColor, strokeWidth) {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d',                  d);
    path.setAttribute('stroke',             strokeColor);
    path.setAttribute('stroke-width',       strokeWidth);
    path.setAttribute('stroke-linecap',     'round');
    path.setAttribute('stroke-linejoin',    'round');
    path.setAttribute('fill',               'none');
    path.setAttribute('filter',             'url(#bolt-glow)');
    path.style.opacity = '0';
    return path;
  }

  // ─── Strike ─────────────────────────────────────────────────────────────────
  function strike() {
    const w = heroSection.offsetWidth;
    const h = heroSection.offsetHeight;

    // Main bolt — random x at top, random x at bottom
    const topX  = w * 0.1 + Math.random() * w * 0.8;
    const botX  = w * 0.1 + Math.random() * w * 0.8;
    const pts   = generatePoints(topX, 0, botX, h, SUBDIVISIONS, DISPLACEMENT);
    const main  = makePath(toPathD(pts), BOLT_COLOR, '1.5');
    svg.appendChild(main);

    // Flash → flicker → fade
    gsap.timeline({ onComplete: () => main.remove() })
      .to(main, { opacity: 1,   duration: FLASH_DURATION,   ease: 'none' })
      .to(main, { opacity: 0.4, duration: 0.05,             ease: 'none' })
      .to(main, { opacity: 0.9, duration: 0.04,             ease: 'none' })
      .to(main, { opacity: 0,   duration: FADE_DURATION,    ease: 'power3.out' });

    // Fork bolt — branches from a random mid-segment
    if (Math.random() < FORK_CHANCE) {
      const fi     = Math.floor(pts.length * (0.25 + Math.random() * 0.35));
      const fStart = pts[fi];
      const fEndX  = Math.max(10, Math.min(w - 10, fStart.x + (Math.random() - 0.5) * 160));
      const fEndY  = h * (0.6 + Math.random() * 0.4);
      const fPts   = generatePoints(fStart.x, fStart.y, fEndX, fEndY, SUBDIVISIONS - 1, DISPLACEMENT * 0.7);
      const fork   = makePath(toPathD(fPts), FORK_COLOR, '1');
      svg.appendChild(fork);

      gsap.timeline({ onComplete: () => fork.remove() })
        .to(fork, { opacity: 0.8, duration: FLASH_DURATION, ease: 'none' })
        .to(fork, { opacity: 0,   duration: FADE_DURATION * 0.8, ease: 'power2.out', delay: 0.06 });
    }

    // ── Easter egg: Keys of the Caribbean (preserved from v1) ──
    lightningStrikeCount++;

    const logMessages = [
      'you are not alone',
      'there is no spoon',
      'wake up, sons and daughters',
      'the cake is a lie',
      'the answer is 42',
      'dont panic',
      'are you lost?',
      'you are not lost',
      'we are all Satoshi',
      'the revolution is decentralized',
      'who the cap fit',
      'we gotta chase dem crazy',
      'you cant run away from yourself',
      'the truth is out there',
      'one one cocoa full basket',
      'yes i am a pirate',
      'i love you too',
    ];
    console.log(logMessages[Math.floor(Math.random() * logMessages.length)]);

    if (lightningStrikeCount === 15 && !rabbitHoleRevealed) {
      revealRabbitHole();
    }
  }

  // ─── Scheduler ──────────────────────────────────────────────────────────────
  let stormActive = false;

  function scheduleNextStrike() {
    if (!stormActive) return;
    const delay = STRIKE_MIN_DELAY + Math.random() * (STRIKE_MAX_DELAY - STRIKE_MIN_DELAY);
    gsap.delayedCall(delay, () => {
      if (stormActive) { strike(); scheduleNextStrike(); }
    });
  }

  function startStorm() {
    if (stormActive) return;
    stormActive = true;
    // Fire first strike after a short random delay so it doesn't hit on load
    const firstDelay = 1.5 + Math.random() * 3;
    gsap.delayedCall(firstDelay, () => { if (stormActive) { strike(); scheduleNextStrike(); } });
  }

  function stopStorm() {
    stormActive = false;
    gsap.killDelayedCallsTo(scheduleNextStrike);
  }

  // IntersectionObserver — only animate when hero is visible
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.isIntersecting ? startStorm() : stopStorm();
    });
  }, { threshold: 0.05 });

  heroObserver.observe(heroSection);

  // ─── Easter egg: revealRabbitHole (preserved verbatim from v1) ──────────────
  async function revealRabbitHole() {
    rabbitHoleRevealed = true;

    const token = localStorage.getItem('hunt_token');

    if (!token) {
      console.log('%c');
      console.log('%c═══════════════════════════════════════════════════════════════', 'color: #F6C453;');
      console.log('%c  ⚡ SIGNAL DETECTED ⚡', 'font-size: 20px; color: #F6C453; font-weight: bold;');
      console.log('%c═══════════════════════════════════════════════════════════════', 'color: #F6C453;');
      console.log('%c');
      console.log('%c  "I\'ve been working on a new electronic cash system', 'font-size: 14px; color: #7C8A92; font-style: italic;');
      console.log('%c   that\'s fully peer-to-peer, with no trusted third party."', 'font-size: 14px; color: #7C8A92; font-style: italic;');
      console.log('%c                                        — Satoshi, 2008', 'font-size: 12px; color: #41AD49;');
      console.log('%c');
      console.log('%c  The hunt awaits, but first you must register...', 'font-size: 14px; color: #7C8A92;');
      console.log('%c  → /treasure-hunt-for-real-this-time-2140/register.html', 'font-size: 14px; color: #41AD49;');
      console.log('%c');
      console.log('%c═══════════════════════════════════════════════════════════════', 'color: #F6C453;');
      return;
    }

    try {
      const response = await fetch('https://kotc.islandbitcoin.com/api/get-stage1-token.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success && data.stage1_token) {
        hunterToken = data.stage1_token;
        console.log('%c');
        console.log('%c╔═══════════════════════════════════════════════════════════════╗', 'color: #F6C453;');
        console.log('%c║  ⚡ KEYS OF THE CARIBBEAN - SIGNAL ACQUIRED ⚡                 ║', 'font-size: 16px; color: #F6C453; font-weight: bold;');
        console.log('%c╚═══════════════════════════════════════════════════════════════╝', 'color: #F6C453;');
        console.log('%c');
        console.log('%c  He posted one final message. Then silence.', 'font-size: 14px; color: #7C8A92;');
        console.log('%c  But not forever...', 'font-size: 14px; color: #7C8A92;');
        console.log('%c');
        console.log('%c  ┌─────────────────────────────────────────────────────────┐', 'color: #41AD49;');
        console.log('%c  │  YOUR ACCESS TOKEN:                                     │', 'color: #41AD49;');
        console.log(`%c  │  ${hunterToken.padEnd(50)}│`, 'font-size: 16px; color: #00FFFF; font-weight: bold;');
        console.log('%c  └─────────────────────────────────────────────────────────┘', 'color: #41AD49;');
        console.log('%c');
        console.log('%c  STEP 1: Save this token in your Hunter Dashboard', 'font-size: 14px; color: #F6C453; font-weight: bold;');
        console.log('%c           → /treasure-hunt-for-real-this-time-2140/hunter-dashboard.html', 'font-size: 12px; color: #41AD49;');
        console.log('%c');
        console.log('%c  STEP 2: Find the Key Terminal...', 'font-size: 14px; color: #F6C453; font-weight: bold;');
        console.log('%c           His email was satoshin@gmx.com', 'font-size: 12px; color: #7C8A92; font-style: italic;');
        console.log('%c           What if he had a flash identity?', 'font-size: 12px; color: #7C8A92; font-style: italic;');
        console.log('%c');
        console.log('%c  "We are all Satoshi."', 'font-size: 14px; color: #41AD49; font-style: italic;');
        console.log('%c');
        console.log('%c╔═══════════════════════════════════════════════════════════════╗', 'color: #F6C453;');
        console.log('%c║  The vault awaits those who prove themselves worthy...        ║', 'color: #7C8A92;');
        console.log('%c╚═══════════════════════════════════════════════════════════════╝', 'color: #F6C453;');
      } else {
        console.log('%c⚠️ Signal interference detected...', 'font-size: 16px; color: #FCA5A5;');
        console.log('%cPlease refresh and try again.', 'font-size: 14px; color: #7C8A92;');
      }
    } catch (error) {
      console.error('Signal acquisition failed:', error);
    }
  }
}
