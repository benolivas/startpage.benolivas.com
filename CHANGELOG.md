# Changelog

All notable changes to this project will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [9.6] — 2026-03-21

### Added
- Drag divider between main content and sidebar to resize columns (desktop only)
- Sidebar width persists to `localStorage`; restored on next load
- Double-click divider resets sidebar to default width (192px)
- "Reset layout →" button in footer (desktop only)
- Dark mode nav dot — small filled circle top-right of nav bar (desktop only)
- Soft fade gradient mask at bottom of "Everything else" section (desktop)
- Hidden scrollbar on "Everything else" scroll area (desktop)

### Changed
- Greeting font size now uses `clamp(18px, 3.8vw, 40px)` — fluid, no snap points
- Spacing (tier margins, block padding, link line-height) uses `clamp()` against viewport height
- Dark mode toggle split by viewport: nav dot (desktop) / footer button (mobile)
- Footer "Reset layout →" replaces dark mode button on desktop
- Mobile footer dark mode button unchanged

### Fixed
- Sidebar CSS variable properly scoped to desktop media query — no mobile bleed

---

## [9.5] — 2026-03-21

### Added
- Celsius on hover for weather temperature (mirrors 24h clock hover behavior)
- Search input auto-focuses on page load
- Sticky footer — always visible, never overlaps content
- Dark mode toggle in footer with ○/● indicator; preference saved to `localStorage`
- Responsive max-height scaling to retain content at small window heights

### Changed
- Sites Admin promoted from Everything Else to Daily primary grid
- Claude kept in Sites Admin block
- Dev & Creative moved to Everything Else (first column, under Creative Ref)
- Finance & Shopping moved to first (left) column of Everything Else
- Footer visit counter replaced with version number (v9.x)
- Footer date changed from live today's date to static "Last Updated"
- Footer "Refresh greeting" replaced with dark mode toggle
- Mobile artwork skeleton height increased from 160px to 200px
- Mobile time tap revert delay extended from 3s to 5s

---

## [9.4] — prior

### Foundation
- Single-file HTML startpage with no build step or server dependencies
- Search bar with DDG / Google / Bing engine cycling
- `@mail`, `@cal`, `@drive` AI commands via Anthropic API + MCP servers
- Daily primary grid (4 columns): Email & Comms, My Sites, Dev & Creative, News & Feed
- Everything Else secondary grid (4 columns): categorized link library
- Sidebar: live clock (12h default, 24h on hover), weather via wttr.in, quote from Wikiquote, today in history from Wikipedia, artwork from r/museum
- Tools panel: Pomodoro timer (25/5/15 presets), scratchpad (localStorage), color picker + eyedropper
- Skeleton shimmer loaders for async sidebar content
- Mobile layout (≤700px): sidebar above main, 2-column grids, tools full-width
- Dark mode CSS variable foundation
