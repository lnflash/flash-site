# Map & Merchant Page Redesign
**Date:** 2026-03-05  
**Branch:** staging-revamp  
**Approved by:** Dread  
**Commits:** `2042ade` (map), `7cc540e` + `37ca8b2` + `dbc2a8b` + `755fc0e` (merchant profile)

---

## Problem

The original `map/index.html` was 3,239 lines of HTML + 4,090 lines of CSS (~7,300 lines total).

Features that were cut:
- Two-row toolbar (main + filter rows)
- Slide-in filter panel with backdrop overlay
- 4 category chips: Open Now, Top Rated, Nearby, Rewards — **these were fake** (API only returns coordinates/title/username, no service data)
- Sort dropdown (Name A-Z, Z-A, Top Rated, Nearest)
- Info/about modal
- Map ↔ List view toggle
- Nostr chat embedded inside the map page
- QR code library
- Google Places enrichment on the map page
- Font Awesome dependency

**Key insight:** Complexity scales with location count. Flash has 34 merchants in one country. Starbucks has 36,000 stores — their locator is complex. Ours shouldn't be.

---

## Map Page Redesign

### Architecture
3 layers only:
1. **Full-screen map** — pre-centered on Jamaica `{lat: 18.1096, lng: -77.2975}`, zoom 10
2. **Floating header** — frosted glass, dark: Flash logo + search input + "Become a merchant →" CTA
3. **Pin tap → bottom sheet** — slides up with merchant name, Flash Pay badge, Get Directions + View Profile

### Result
- 328 lines total (map styles inline)
- `css/pages/map.css` emptied (styles moved inline)
- All Google Places enrichment moved to `/merchant/` profile page

### Data layer
GraphQL: `businessMapMarkers` → `{mapInfo: {coordinates: {latitude, longitude}, title}, username}`

CORS routing:
- `getflash.io` → `https://api.flashapp.me/graphql` (direct)
- staging → `https://api.test.flashapp.me/graphql` (CORS blocked — fallback to mock)
- localhost → `https://corsproxy.io/?https://api.flashapp.me/graphql`

### Mock data (12 merchants)
Spread across Jamaica: Kingston (6), Montego Bay (3), Ocho Rios, Port Antonio, Mandeville.
Activates automatically when API fetch fails.

---

## Merchant Profile Page (`/merchant/?u=username`)

### Purpose
Shareable URL for each Flash merchant. Hub for:
- Google Places enriched info (address, phone, rating, hours, website)
- Lightning payment QR
- Live Nostr DM chat with merchant

### Section 1 — Hero
- Merchant name (from `businessMapMarkers` filtered by username)
- Avatar (first letter of name)
- "Flash Merchant" badge
- Google Places enrichment: address, phone, ★ rating, open/closed status, website
- Uses TextQuery `"${title} Jamaica"` with 500m location bias, picks closest result within ~1.5km

### Section 2 — Pay with Flash
- QRCode.js renders `pay.flashapp.me/{username}`
- "Open Flash Pay" button → same URL

### Section 3 — Nostr Chat (NIP-17 Gift Wrap)

**Key decision:** No NIP-07 sign-in required. Ephemeral keys generated on page load.

**Flow:**
1. `NostrTools.generateSecretKey()` → ephemeral `{sk, pk}` per session
2. Visitor assigned: `"Flash visitor #XXXX"` (random 4-digit)
3. Compose area shows: `"Sending as Flash visitor #XXXX — your identity is private"`
4. Send → NIP-17 gift wrap:
   - `rumor` (kind:14) — the message, p-tagged to merchant pubkey
   - `seal` (kind:13) — rumor encrypted with sender's ephemeral key → recipient pubkey (NIP-44)
   - `wrap` (kind:1059) — seal encrypted with a one-time random key → recipient pubkey
5. Wrap published to 6 relays → appears in merchant's Flash app as a DM
6. Subscribe to kind:1059 wraps p-tagged to ephemeral pubkey → merchant replies appear in thread
7. Optimistic UI — message appears immediately, published async

**Relays:** `relay.damus.io`, `relay.primal.net`, `relay.snort.social`, `nostr.mom`, `relay.nostr.bg`, `nostr-pub.wellorder.net`

**nostr-tools version:** `2.23.3` (global: `NostrTools`, capital T)

### API queries
```graphql
# Get merchant Nostr pubkey
query { npubByUsername(username: "tastee_nk") { npub username } }

# Get merchant name + coords (filter by username client-side)
query { businessMapMarkers { mapInfo { coordinates { latitude longitude } title } username } }
```

### Mock data (4 merchants)
| username | Title | Details |
|---|---|---|
| `tastee_nk` | Tastee Patties — New Kingston | Address, phone, rating 4.3, open, website |
| `islandgrill_hwt` | Island Grill Half Way Tree | Address, phone, rating 4.1, open |
| `doctorscave` | Doctor's Cave Beach Hotel | Full details, rating 4.6, website |
| `ochi_jerk` | Ochi Rios Jerk Centre | Rating 4.5, closed |

Each has 1–4 mock Nostr messages demonstrating the chat UI.

---

## User Flow: Map → Profile

```
Map page
  → tap pin
  → bottom sheet: [Get Directions] [View Profile]
  → "View Profile" → /merchant/?u={username}
  → merchant profile page
  → [QR code] [Pay with Flash button]
  → [Nostr chat — no sign-in]
```

---

## Research References

| Site | Approach | Lesson |
|---|---|---|
| Bitcoin.com map | Full-screen + floating search only | Map IS the UI — simplicity wins |
| BTCmap.org | Same — minimal chrome | Confirms pattern |
| Starbucks locator | Left panel + map, filter-heavy | Right for 36k stores, wrong for 34 |
