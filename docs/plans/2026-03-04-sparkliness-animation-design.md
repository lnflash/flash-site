# Sparkliness Animation Pass — Design Doc
**Date:** 2026-03-04  
**Branch:** staging-revamp  
**Approved by:** Dread

---

## Goal
Add purposeful motion to the Flash homepage to make it feel alive and premium — not gratuitous, never distracting. Respect `prefers-reduced-motion`.

## Approach: Hybrid CSS scroll-reveal + vanilla JS counter + CSS keyframe float

### 1. Scroll-reveal (CSS + IntersectionObserver)
- Elements marked with `data-reveal` start at `opacity:0; transform:translateY(30px)`
- IntersectionObserver adds `.is-revealed` class when element enters viewport (threshold 0.15)
- CSS transition: `opacity 0.55s ease, transform 0.55s ease`
- Cards use `data-reveal-delay="1|2|3"` for stagger (80ms × n)
- Observer disconnects after element is revealed (fire-once)

### 2. Stat counters (vanilla JS)
- Targets: `hero-stat-number` spans (10k+, 2,500+, 34+)
- Count up from 0 to final value over 1.2s on page load
- Easing: `easeOutQuart`
- Suffix preserved ("+", "k+") and appended after numeric value
- Triggered immediately on load (stats are in the hero, above the fold)

### 3. Hero phone float (CSS keyframes)
- `@keyframes float`: `translateY(0) → translateY(-10px) → translateY(0)`
- Duration: 3.5s, `ease-in-out`, `infinite`
- Applied to `.hero-phone-wrap`

### 4. How-it-works step pop-in (CSS stagger)
- `.hiw-step` elements get `data-reveal` with stagger delays (0, 1, 2)
- Uses same scroll-reveal system

### 5. prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }
  .hero-phone-wrap { animation: none !important; }
  .hero-stat-number[data-count] { /* counter fires instantly */ }
}
```

## Files
- `js/modules/animations.js` — new module (scroll-reveal observer + counter)
- `css/pages/home.css` — reveal classes, float keyframe, stagger delays
- `index.html` — add `data-reveal` attrs, add `<script src="js/modules/animations.js">`
