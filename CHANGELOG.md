# Changelog

All notable changes documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [10.1] — 2026-03-21

### Added
- Container queries on `.sp-main` — Daily and Everything Else columns now reflow based on actual main content width, not window width
- Breakpoints: ≥600px = 4 cols, 400–599px = 2 cols, <400px = 1 col
- Reflows automatically in response to both window resize and sidebar drag

### Changed
- Footer back to plain CSS `position: sticky; bottom: 0` — reliable on desktop and mobile

### Removed
- Footer inertia JS block (Option B lerp experiment) — reverted; plain sticky performs better

---

## [10.0] — 2026-03-21

### Added
- Fluid sidebar compression — sidebar narrows with window but never disappears on desktop (min 150px, max 360px)
- Everything Else: top fade (`::before`) in addition to existing bottom fade — both use `var(--bg)` for dark mode compatibility
- Footer inertia (added, then reverted in v10.1)

### Changed
- Scrollbar thumb color changed from `--rule` to `--muted` — correct contrast on light and dark themes; hover darkens to `--text`
- Weather location: Nominatim now requests at `zoom=10` (city level) to avoid hyper-local neighborhood names
- Weather location field priority: `municipality → city → town → village → county`
- Drag resize minimum updated from 120px to 150px to match sidebar fluid min

### Removed
- Sidebar collapse breakpoint (701–860px) — replaced by fluid compression

---

## [9.8] — 2026-03-21

### Added
- Weather rebuilt on Open-Meteo (free, no API key, reliable) — replaces wttr.in
- Triple geolocation fallback chain: browser geolocation → ipapi.co → freeipapi.com
- Location label cached in localStorage — persists between loads, never clears on weather failure
- `fetching…` state shown while weather loads

### Changed
- Sidebar collapse breakpoint introduced at 860px (later removed in v10.0)
- Everything Else top + bottom fade added (refined in v10.0)

---

## [9.7] — 2026-03-21

### Added
- GitHub added to Sites Admin in Daily primary grid (replaces benolivas.net)
- `target="_blank" rel="noopener"` on all Everything Else links
- Last Updated footer: shows short date (Mar 21) by default; hover/click reveals full date + time, reverts after 3s on mobile tap

### Changed
- Daily links intentionally keep same-tab behavior

---

## [9.6] — 2026-03-21

### Added
- Drag divider between main and sidebar — resize columns, persists to localStorage
- Double-click divider or "Reset layout →" footer button to restore default (192px)
- Dark mode nav dot (desktop only) — small circle, filled = on, scales on hover
- Everything Else: hidden scrollbar, bottom fade gradient
- Fluid `clamp()` scaling on greeting font size and vertical spacing

### Changed
- Dark mode split by viewport: nav dot (desktop) / footer button (mobile)
- Footer "Reset layout →" replaces dark mode button on desktop
- Mobile footer dark mode toggle unchanged

### Fixed
- Sidebar CSS variable scoped to desktop media query — no mobile bleed

---

## [9.5] — 2026-03-21

### Added
- Search input autofocuses on page load
- Footer sticky — always visible, never overlaps content
- Dark mode toggle in footer (○/●); preference saved to localStorage
- Temperature shows °C on hover (mirrors 24h clock hover)
- Responsive max-height scaling to retain content at small window heights

### Changed
- Sites Admin promoted from Everything Else to Daily primary grid
- Claude kept in Sites Admin
- Dev & Creative moved to Everything Else (first column)
- Finance & Shopping moved to first (left) column of Everything Else
- Footer visit counter → version number
- Footer date → "Last Updated" (static)
- Footer "Refresh greeting" → dark mode toggle
- Mobile artwork skeleton height: 160px → 200px
- Mobile time tap revert delay: 3s → 5s

---

## [9.4] — prior

### Foundation
- Single-file HTML startpage, no build step or server dependencies
- Search with DDG / Google / Bing engine cycling
- `@mail`, `@cal`, `@drive` AI commands via Anthropic API + MCP
- Daily primary grid (4 cols): Email & Comms, My Sites, Sites Admin, News & Feed
- Everything Else secondary grid (4 cols): categorized link library
- Sidebar: clock (12h/24h hover), weather via wttr.in, Wikiquote quotes, Wikipedia On This Day, r/museum artwork
- Tools: Pomodoro, scratchpad (localStorage), color picker + eyedropper
- Skeleton shimmer loaders
- Mobile layout (≤700px): sidebar above main, 2-column grids
