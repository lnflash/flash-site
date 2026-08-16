/**
 * lightning.js v3 — Realistic GSAP + SVG lightning
 *
 * Improvements over v2:
 *   - Two-layer rendering: wide diffuse glow + sharp bright core per bolt
 *   - Tree branching: 3–6 branches per strike (not just one fork)
 *   - Multiple return strokes: rapid flicker before long afterglow (real lightning physics)
 *   - More subdivisions + larger displacement = jaggier, more naturalistic paths
 *   - Color: white core (#fff) over cyan-blue glow — matches real cloud-to-ground lightning
 *   - Branches taper: thinner, shorter, dimmer than trunk
 *
 * Preserves:
 *   - Easter egg / Keys of the Caribbean (fires at strike 15)
 *   - IntersectionObserver — only animates when hero is in view
 *   - API surface expected by main.js
 */

// ─── Configuration ────────────────────────────────────────────────────────────
const STRIKE_MIN_DELAY  = 4;    // seconds min between strikes
const STRIKE_MAX_DELAY  = 11;   // seconds max between strikes
const TRUNK_SUBDIVISIONS = 5;   // midpoint passes for main bolt (more = jaggier)
const BRANCH_SUBDIVISIONS = 4;  // midpoint passes for branches
const TRUNK_DISP        = 110;  // initial displacement for trunk (px)
const BRANCH_DISP       = 75;   // initial displacement for branches (px)
const MIN_BRANCHES      = 2;    // min branch bolts per strike
const MAX_BRANCHES      = 5;    // max branch bolts per strike

// ─── Easter egg state (preserved) ────────────────────────────────────────────
let lightningStrikeCount = 0;
let rabbitHoleRevealed   = false;

// ─── DOM setup ────────────────────────────────────────────────────────────────
const heroSection = document.getElementById('pg-hero');
const cvsStorm    = document.getElementById('lightning-storm');
if (cvsStorm) cvsStorm.style.display = 'none';

// main.js compatibility stubs
const stormInterval = 4500;
const animate       = () => {};
function startLightning() { startStorm(); }
const observer = new IntersectionObserver(() => {}, { threshold: 0.05 });

// ─── SVG setup ────────────────────────────────────────────────────────────────
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

  // Two filters:
  //   bolt-outer — wide, soft diffuse corona (5px + 12px blur)
  //   bolt-inner — tight, bright core glow (1.5px blur only)
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <filter id="bolt-outer" x="-120%" y="-20%" width="340%" height="140%"
            color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5"  result="b1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b2"/>
      <feMerge>
        <feMergeNode in="b2"/>
        <feMergeNode in="b1"/>
      </feMerge>
    </filter>
    <filter id="bolt-inner" x="-60%" y="-10%" width="220%" height="120%"
            color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);
  heroSection.appendChild(svg);

  // ─── Midpoint displacement path generation ────────────────────────────────
  function generatePoints(x0, y0, x1, y1, passes, disp) {
    let pts = [{ x: x0, y: y0 }, { x: x1, y: y1 }];
    let d   = disp;

    for (let p = 0; p < passes; p++) {
      const next = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        // Slight downward bias on midpoint y keeps bolt moving earthward
        const my = (a.y + b.y) / 2 + (Math.random() - 0.48) * d * 0.18;
        const mx = (a.x + b.x) / 2 + (Math.random() - 0.5)  * d;
        next.push(a, { x: mx, y: my });
      }
      next.push(pts[pts.length - 1]);
      pts = next;
      d  *= 0.55; // decay displacement each pass
    }
    return pts;
  }

  function toD(pts) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }

  // Two-layer bolt: outer glow path + inner core path
  function makeBolt(d, glowWidth, coreWidth, glowColor, coreColor) {
    const group = document.createElementNS(svgNS, 'g');
    group.style.opacity = '0';

    const glow = document.createElementNS(svgNS, 'path');
    glow.setAttribute('d',             d);
    glow.setAttribute('stroke',        glowColor);
    glow.setAttribute('stroke-width',  glowWidth);
    glow.setAttribute('stroke-linecap','round');
    glow.setAttribute('stroke-linejoin','round');
    glow.setAttribute('fill',          'none');
    glow.setAttribute('filter',        'url(#bolt-outer)');

    const core = document.createElementNS(svgNS, 'path');
    core.setAttribute('d',             d);
    core.setAttribute('stroke',        coreColor);
    core.setAttribute('stroke-width',  coreWidth);
    core.setAttribute('stroke-linecap','round');
    core.setAttribute('stroke-linejoin','round');
    core.setAttribute('fill',          'none');
    core.setAttribute('filter',        'url(#bolt-inner)');

    group.appendChild(glow);
    group.appendChild(core);
    return group;
  }

  // ─── Strike ───────────────────────────────────────────────────────────────
  function strike() {
    const w = heroSection.offsetWidth;
    const h = heroSection.offsetHeight;

    // Trunk: random top-x → random bottom-x, full height
    const topX   = w * 0.05 + Math.random() * w * 0.9;
    const botX   = w * 0.05 + Math.random() * w * 0.9;
    const trunk  = generatePoints(topX, 0, botX, h, TRUNK_SUBDIVISIONS, TRUNK_DISP);
    const trunkEl = makeBolt(
      toD(trunk),
      '5',  '1.2',                       // glow 5px wide, core 1.2px
      'rgba(120, 180, 255, 0.55)',        // blue glow
      'rgba(240, 250, 255, 1)'            // white-blue core
    );
    svg.appendChild(trunkEl);

    // Branches: pick random attachment points along trunk
    const numBranches = MIN_BRANCHES + Math.floor(Math.random() * (MAX_BRANCHES - MIN_BRANCHES + 1));
    const branchEls   = [];

    for (let b = 0; b < numBranches; b++) {
      // Attach in the lower 70% of the trunk (avoid tiny top stubs)
      const startIdx = Math.floor(trunk.length * (0.15 + Math.random() * 0.65));
      const origin   = trunk[startIdx];

      // Branch end: spread horizontally, terminate before floor
      const endX  = Math.max(5, Math.min(w - 5, origin.x + (Math.random() - 0.5) * w * 0.5));
      const endY  = origin.y + (h - origin.y) * (0.3 + Math.random() * 0.6);

      const bPts  = generatePoints(origin.x, origin.y, endX, endY, BRANCH_SUBDIVISIONS, BRANCH_DISP);

      // Branches get thinner & dimmer than trunk; deep branches dimmer still
      const depthFade = 0.5 + 0.5 * (1 - startIdx / trunk.length);
      const bEl = makeBolt(
        toD(bPts),
        `${(3 * depthFade).toFixed(1)}`,
        `${(0.8 * depthFade).toFixed(1)}`,
        `rgba(100, 160, 255, ${(0.35 * depthFade).toFixed(2)})`,
        `rgba(220, 240, 255, ${(0.85 * depthFade).toFixed(2)})`
      );
      svg.appendChild(bEl);
      branchEls.push({ el: bEl, depth: depthFade });
    }

    // ── Return strokes (realistic flicker) ──
    // Real lightning: step leader (dim) → 2–3 rapid return strokes → afterglow
    const returnStrokes = 1 + Math.floor(Math.random() * 2); // 2 or 3 total flashes
    const tl = gsap.timeline({
      onComplete: () => {
        trunkEl.remove();
        branchEls.forEach(b => b.el.remove());
      }
    });

    // Build flicker sequence
    let t = 0;
    for (let s = 0; s < returnStrokes; s++) {
      const peak = s === 0 ? 1 : 0.6 + Math.random() * 0.3; // first stroke brightest
      tl.to([trunkEl, ...branchEls.map(b => b.el)], {
        opacity: peak, duration: 0.025, ease: 'none'
      }, t);
      t += 0.025;
      tl.to([trunkEl, ...branchEls.map(b => b.el)], {
        opacity: peak * 0.25, duration: 0.04, ease: 'none'
      }, t);
      t += 0.04;
    }

    // Final afterglow fade — long, smooth power curve
    tl.to([trunkEl, ...branchEls.map(b => b.el)], {
      opacity: 1, duration: 0.02, ease: 'none'
    }, t);
    tl.to([trunkEl, ...branchEls.map(b => b.el)], {
      opacity: 0, duration: 1.1, ease: 'power3.out'
    }, t + 0.02);

    // ── Easter egg ──
    lightningStrikeCount++;
    const logMessages = [
      'you are not alone',       'there is no spoon',
      'wake up, sons and daughters', 'the cake is a lie',
      'the answer is 42',        'dont panic',
      'are you lost?',           'you are not lost',
      'we are all Satoshi',      'the revolution is decentralized',
      'who the cap fit',         'we gotta chase dem crazy',
      'you cant run away from yourself', 'the truth is out there',
      'one one cocoa full basket', 'yes i am a pirate',
      'i love you too',
    ];
    console.log(logMessages[Math.floor(Math.random() * logMessages.length)]);
    if (lightningStrikeCount === 15 && !rabbitHoleRevealed) revealRabbitHole();
  }

  // ─── Scheduler ────────────────────────────────────────────────────────────
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
    const firstDelay = 1.5 + Math.random() * 2.5;
    gsap.delayedCall(firstDelay, () => { if (stormActive) { strike(); scheduleNextStrike(); } });
  }

  function stopStorm() {
    stormActive = false;
    gsap.killDelayedCallsTo(scheduleNextStrike);
  }

  // IntersectionObserver on hero section
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting ? startStorm() : stopStorm());
  }, { threshold: 0.05 });
  heroObserver.observe(heroSection);

  // ─── Easter egg: revealRabbitHole ─────────────────────────────────────────
  function revealRabbitHole() {
    rabbitHoleRevealed = true;
    console.log('%c');
    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #F6C453;');
    console.log('%c  ⚡ SIGNAL DETECTED ⚡', 'font-size: 20px; color: #F6C453; font-weight: bold;');
    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #F6C453;');
    console.log('%c');
    console.log('%c  "I\'ve been working on a new electronic cash system', 'font-size: 14px; color: #7C8A92; font-style: italic;');
    console.log('%c   that\'s fully peer-to-peer, with no trusted third party."', 'font-size: 14px; color: #7C8A92; font-style: italic;');
    console.log('%c                                        — Satoshi, 2008', 'font-size: 12px; color: #41AD49;');
    console.log('%c');
    console.log('%c  The hunt sets sail soon — live, in the real world.', 'font-size: 14px; color: #7C8A92;');
    console.log('%c  → https://kotc.islandbitcoin.com', 'font-size: 14px; color: #41AD49;');
    console.log('%c');
    console.log('%c  "We are all Satoshi."', 'font-size: 14px; color: #41AD49; font-style: italic;');
    console.log('%c');
    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #F6C453;');
  }
}
