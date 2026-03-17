# Flash — Bitcoin Payments & Merchant Rewards

The official website for [Flash](https://getflash.io) — Jamaica's Bitcoin wallet and merchant rewards platform, powered by Lightning Network.

**Live site:** https://getflash.io  
**Staging:** https://staging.getflash.io  
**Branch:** `staging-revamp` (production branch on Vercel)

---

## Products

| Product | Description |
|---|---|
| **Flash Mobile** | Bitcoin/Lightning wallet app — iOS & Android |
| **Flash POS** | Point-of-sale system for merchants |
| **Flash Card** | Physical tap-to-pay rewards card |
| **Flash API** | RESTful + WebSocket API for developers |

---

## Tech Stack

- **Pure HTML/CSS/JS** — no frontend framework dependencies
- **Component-based** — shared `header.html` and `footer.html` loaded via fetch at runtime
- **CSS custom properties** — design tokens in `css/main.css`; page-scoped tokens in `css/pages/`
- **Google Maps API** — `AdvancedMarkerElement`, Places TextQuery (merchant map)
- **Nostr (`nostr-tools@2.23.3`)** — NIP-17 gift wrap DMs on merchant profile pages
- **GSAP** — lightning animation on homepage (`js/modules/lightning.js`)
- **Fonts** — Sora (700/800 headings) + Inter (400/500 body) via Google Fonts

---

## Site Structure

```
flash-site/
├── index.html              # Homepage (dark theme, body.home-page scoped)
├── mission.html            # Mission page
├── rewards.html            # Rewards program
├── team.html               # Team + open positions + job application modal
├── faq.html                # FAQ
├── 404.html                # "Lost in the mempool" error page
│
├── map/
│   └── index.html          # Merchant map — full-screen Google Maps
│                             Centers on Jamaica, Flash-branded pins,
│                             bottom sheet on pin tap, search, mock fallback
│
├── merchant/
│   └── index.html          # Merchant profile page (/merchant/?u=username)
│                             Google Places enrichment, Lightning QR,
│                             NIP-17 ephemeral chat (no sign-in required)
│
├── app/                    # App download page
├── blog/                   # Blog posts
├── legal/
│   ├── terms.html          # Terms & Conditions
│   └── privacy.html        # Privacy Policy
│
├── components/
│   ├── header.html         # Global nav (fetched via XHR, bypasses CDN cache)
│   └── footer.html         # Global footer (always dark; El Salvador disclaimer)
│
├── css/
│   ├── main.css            # Global styles, design tokens, component styles
│   └── pages/              # Page-specific stylesheets
│       ├── home.css        # Homepage (dark hero, trust strip, how-it-works)
│       ├── team.css        # Team grid, job cards, "This Could Be You!" card
│       ├── rewards.css     # Rewards page
│       ├── mission.css     # Mission page
│       └── map.css         # (empty — map styles are inline in map/index.html)
│
├── js/
│   ├── core/
│   │   ├── components.js   # Header/footer loader
│   │   ├── dark-mode-init.js
│   │   └── main.js         # Scroll-reveal, stat counters
│   └── modules/
│       ├── animations.js   # Hero phone float, scroll-reveal, stat counters
│       ├── lightning.js    # GSAP lightning strike animation (v3)
│       ├── jobFilters.js   # Team page: job card expand/collapse, search, filter
│       └── btcPrice.js     # Bitcoin price ticker in footer
│
└── assets/
    ├── img/                # Images, logos, merchant photos
    └── fontawesome/        # Font Awesome (local, for legacy pages)
```

---

## Key Pages

### Homepage (`index.html`)
Dark-themed landing page. Sections in order:
1. `#pg-hero` — headline, subhead, app store CTAs, trust strip, stat bar
2. `#pg-ways` — 3 use cases (Send Money Home, Buy Bitcoin, Spend)
3. `#pg-remittance` — how it works + fee breakdown
4. `.mid-page-CTA` — download CTA
5. `#pg-merchants` — merchant ecosystem
6. `#pg-testimonials` — customer testimonials
7. `.merchant-CTA` — merchant sign-up CTA
8. `.contact-strip` — email + WhatsApp contact strip

**Hero stats:** `0% transfer fee` · `<3s transfer speed` · `34+ Merchants 🇯🇲`  
**Hero subhead:** `"Receive in seconds — no bank account needed."`

### Merchant Map (`map/index.html`)
Full-screen map centered on Jamaica (`{lat: 18.1096, lng: -77.2975}`, zoom 10).

- **API:** `businessMapMarkers` GraphQL query → `{coordinates, title, username}`
- **Fallback:** 12 mock merchants displayed when API is unavailable (staging CORS)
- **Pin tap:** Bottom sheet → merchant name, Flash Pay badge, Get Directions + View Profile
- **View Profile** → `/merchant/?u={username}`
- **CORS logic:** `getflash.io` → direct API; staging → `api.test.flashapp.me`; localhost → corsproxy.io

### Merchant Profile (`merchant/index.html`)
URL: `/merchant/?u={username}`

1. **Hero** — merchant name, avatar, "Flash Merchant" badge, Google Places enrichment (address, phone, rating, open/closed, website)
2. **Pay with Flash** — QR code for `pay.flashapp.me/{username}` + button
3. **Nostr chat** — NIP-17 gift wrap DMs, ephemeral keypair per session, no login required

**API queries:**
- `npubByUsername(username)` → `{npub}` → decoded to hex via `NostrTools.nip19.decode()`
- `businessMapMarkers` → filtered by username for title + coords → Google Places TextQuery
- **Fallback:** 4 mock merchants (tastee_nk, islandgrill_hwt, doctorscave, ochi_jerk)

**Nostr relay list:** damus, primal, snort, nostr.mom, nostr.bg, nostr-pub.wellorder.net

---

## Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| `--green` | `#3AB54A` / `#41AD49` | CTAs, success states, key numbers, logo only |
| `--dark` | `#09090E` | Dark backgrounds, footer |
| `--mid` | `#0D0D14` | Footer utils row |
| `--text` | `#111218` | Body text (light mode) |

**Green is sacred** — never use decoratively. Reserved for: primary CTAs, success states, balance/key numbers, brand moments, logo.

### Typography
- **Headings:** Sora 700/800
- **Body:** Inter 400/500
- Roboto is fully removed.

### Themes
- **Site default:** light mode
- **Homepage:** always dark — `body.home-page` scoped CSS tokens
- **Footer:** always dark — hardcoded `#09090E`/`#0D0D14` regardless of theme

### Trust Badge Pills (approved pattern)
Hero trust strip + footer trust badges use frosted glass pill:
```css
background: rgba(255,255,255,0.07);
border: 1px solid rgba(255,255,255,0.12);
border-radius: 100px;
padding: 6px 12px;
```

---

## Critical Rules

### Legal
- **El Salvador disclaimer** MUST remain on every page in `.footer-btm`:
  > *"Island Bitcoin C.A. de S.V. entity is regulated by BCR and by the Superintendent of the Financial System of El Salvador"*
- Privacy Policy and Terms of Service links must remain in footer.
- **Never use "Banking"** — regulatory flag.
- **Never claim BOJ/regulatory compliance** — Flash is not yet regulated by BOJ.
- **No investment language** — no "earn", "grow", "profit", "returns".

### Copy Rules
- **Fiat First** — always show JMD amounts before Bitcoin/sats.
- **No "remittance"** — replaced sitewide with "send money home" / "transfer" / "family payment".
- **No Western Union brand mentions** anywhere on the site.
- **Merchant POS signup** always → `https://signup.getflash.io`
- **Fee accuracy:** Flash transfer fee = 0%; on-ramp = 1–3% (third-party); cash-out to Jamaican bank = 2% (Flash fee).

### Navigation
- No "Home" nav link — logo handles home navigation.
- Do NOT touch `/treasure-hunt` or `/treasure-hunt-for-real-this-time-2140` (KOTC pages).

### Stats (verified, do not change without confirmation)
| Stat | Value | Use |
|---|---|---|
| Downloads | 10k+ | App download page only |
| Active users | 2,500+ | Internal reference only |
| Merchants | 34+ | Heroes, rewards, merchant sections |
| Google Play rating | 5.0 ★ (3 reviews) | App download page |
| Hero stats | 0% fee · <3s · 34+ merchants | Homepage hero bar |

---

## CSS Architecture

### Key patterns
```
body.home-page        → scoped dark theme tokens for homepage
body.light-mode       → site default (light)
section:not(.pg-download) > * + * { padding-top: 120px }  → global section spacing
```

### Known CSS contracts
- **Nav:** `.main-nav` is the SAME `<ul>` on desktop and mobile. Scope drawer-only styles to `@media (max-width: 799px)` — never apply unscoped rules to `.main-nav`.
- **Job cards:** HTML has `class="job-card collapsed"`. JS toggles `.expanded`. CSS keys on `.job-card.expanded`.
- **Mobile logo:** `position: absolute; left: 50%; transform: translateX(-50%)` at ≤799px.
- **Hero body DOM:** `<canvas>` (display:none) and `.hero-bg` (position:absolute) are DOM siblings of `.hero-body`, causing it to match `> * + *` rule. Override: `#pg-hero .hero-body { padding-top: 0 }`.

---

## JavaScript Modules

| Module | Purpose |
|---|---|
| `js/modules/lightning.js` | GSAP SVG lightning strikes on homepage hero. Strike count 15 triggers KOTC easter egg. |
| `js/modules/animations.js` | Scroll-reveal (IntersectionObserver + `data-reveal`), stat counters, hero phone float |
| `js/modules/jobFilters.js` | Team page: expand/collapse job cards, search, filter, file upload, application modal |
| `js/modules/btcPrice.js` | Bitcoin price ticker in footer |
| `js/core/components.js` | Fetches `components/header.html` + `components/footer.html` and injects them |

---

## Deployment

- **CI:** Vercel auto-deploys from `staging-revamp` branch → `staging.getflash.io`
- **Deploy time:** ~36–48 seconds after `git push`
- **Cache:** `index.html` is CDN-cached; `components/header.html` is fetched via XHR at runtime (bypasses cache)
- **Production merge:** `staging-revamp` → `main` when approved

### Known staging limitations
- **Map CORS:** `api.test.flashapp.me` blocks requests from `staging.getflash.io` — map and merchant profile pages use mock fallback data on staging. Self-resolves on `getflash.io` production domain.
- **Map filter icons:** broken on staging (CORS). Self-resolves on prod.

---

## Post-Launch TODO

- [ ] Wire job application email backend (recommend Formspree — 5-min setup)
- [ ] Fix team.html modal dark mode: `#application-modal` form inputs invisible in dark mode
- [ ] Map page: CORS issue self-resolves on prod domain
- [ ] Consider adding `/merchant/?u=username` to sitemap

---

## Contact

- Website: https://getflash.io
- Support: support@getflash.io / WhatsApp +18762536977
- X: [@LNFlash](https://x.com/LNFlash)
- GitHub: [lnflash](https://github.com/lnflash)
- Nostr: `npub1l080awn9wsw87ywm3flmpmccf5rmlvhd7vfgspj2pnavxupnlfesmflash`

---

*© 2026 Flash / Island Bitcoin. All rights reserved.*
