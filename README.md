# startpage.benolivas.com

A personal browser startpage. Single HTML file — no build step, no dependencies, no server-side storage.

**Live:** [startpage.benolivas.com](https://startpage.benolivas.com)

---

## Features

- **Search** — DDG / Google / Bing cycle; `@mail`, `@cal`, `@drive` commands via Anthropic API + MCP
- **Daily links** — primary grid of most-used sites, opens in same tab
- **Everything else** — secondary categorized link library, opens in new tab, soft-scroll inset with fade top and bottom
- **Sidebar** — live clock (12h/24h hover), weather (°F/°C hover, cached location), quote, today in history, artwork from r/museum; draggable width
- **Tools** — Pomodoro timer, scratchpad (persisted), color picker + eyedropper
- **Dark mode** — nav dot (desktop) or footer toggle (mobile); preference persisted to localStorage
- **Resizable layout** — drag the divider between main and sidebar; double-click or "Reset layout" to restore default
- **Responsive** — fluid scaling via `clamp()`; container queries reflow columns based on actual main content width; dedicated mobile layout ≤700px

---

## Deploy pipeline

Push to `main` on GitHub → GitHub Action SSHs into Dreamhost → `git pull` → live in ~15 seconds.

```
VSCode → git push → GitHub Actions → Dreamhost → startpage.benolivas.com
```

Secrets required in GitHub repo settings:
- `SSH_HOST` — `iad1-shared-b7-41.dreamhost.com`
- `SSH_USERNAME` — `benoli7`
- `SSH_PRIVATE_KEY` — private SSH key authorized on Dreamhost

---

## Setup

No build step. Drop `index.html` anywhere and open it.

**As a Chrome new tab page:**
1. Install the [Custom New Tab URL](https://chrome.google.com/webstore/detail/custom-new-tab-url/mmjbdbjnoablegbcapnhobbgbamioppa) extension
2. Point it at your hosted URL or a local file path

**To enable `@mail` / `@cal` / `@drive` AI search:**
1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
2. For production: proxy through a serverless function — never expose the key in the browser
3. Set `ANTHROPIC_API_KEY` in the config block at the top of the script for local/dev use only

---

## Version history

### v10.1 — 2026-03-21
- Container queries on `.sp-main` — columns reflow based on actual main content width, not window width; responds to both window resize and sidebar drag automatically
- 4 columns → 2 columns at 599px main width → 1 column at 399px
- Footer reverted to plain CSS `position: sticky` — clean and reliable on both desktop and mobile
- Inertia JS block removed entirely

### v10.0 — 2026-03-21
- Sidebar compresses fluidly (min 150px, max 360px) — never disappears on desktop
- Removed sidebar collapse breakpoint — no more jarring hide/show
- Everything Else: top AND bottom fade using `var(--bg)` — works in light and dark mode
- Scrollbar thumb color fixed — reads correctly on both themes
- Weather location accuracy improved: Nominatim zoom=10, municipality field priority
- Triple weather fallback: browser geolocation → ipapi.co → freeipapi.com

### v9.8 — 2026-03-21
- Weather rebuilt: Open-Meteo replaces wttr.in
- Location cached in localStorage — never disappears on weather failure

### v9.7 — 2026-03-21
- GitHub added to Sites Admin daily grid
- Everything Else links open in new tab; Daily links stay same tab
- Last Updated: short date by default, hover/click reveals full date + time

### v9.6 — 2026-03-21
- Drag divider to resize main/sidebar; double-click or Reset layout to restore
- Dark mode nav dot (desktop); footer toggle (mobile)
- Fluid clamp() scaling; Everything Else soft scroll with fade

### v9.5 — 2026-03-21
- Sites Admin in Daily grid; Finance & Shopping moved left in Everything Else
- Temperature °C on hover; footer dark mode toggle; footer sticky
- Search autofocuses on page load

### v9.4 — prior
- Foundation: search, @mail/@cal/@drive, Daily grid, Everything Else, sidebar panels, tools, mobile layout

---

## Roadmap — v10.2+

- **API proxy** — Cloudflare Worker / Netlify Function; @mail, @cal, @drive working
- **Sidebar productivity mode** — narrow desktop: search dominant, sidebar hidden with toggle
- **Built-in editor** — add/remove/reorder links without touching HTML
- **Profile preferences** — name, location override, timezone
- **Public deployment config** — easy self-host, no server storage

---

## Security

`ANTHROPIC_API_KEY` is intentionally blank in this repo. Never commit a real key. Proxy API calls server-side for production.

---

## License

MIT — see [LICENSE](LICENSE)
