# startpage.benolivas.com

A personal browser startpage. Single HTML file — no build step, no dependencies, no server-side storage.

**Live:** [startpage.benolivas.com](https://startpage.benolivas.com)

---

## Features

- **Search** — DDG / Google / Bing cycle; `@mail`, `@cal`, `@drive` commands via Anthropic API + MCP
- **Daily links** — primary grid of most-used sites
- **Everything else** — secondary categorized link library
- **Sidebar** — live clock (12h/24h hover), weather (°F/°C hover), quote, today in history, artwork from r/museum
- **Tools** — Pomodoro timer, scratchpad (persisted), color picker + eyedropper
- **Dark mode** — nav dot (desktop) or footer toggle (mobile); preference persisted
- **Resizable layout** — drag the divider between main and sidebar; double-click or "Reset layout" to restore default
- **Responsive** — fluid scaling on desktop; dedicated mobile layout ≤700px

---

## Setup

No build step. Drop `index.html` anywhere and open it.

**As a Chrome new tab page:**
1. Install the [Custom New Tab URL](https://chrome.google.com/webstore/detail/custom-new-tab-url/mmjbdbjnoablegbcapnhobbgbamioppa) extension
2. Point it at your hosted URL or a local file path

**To enable `@mail` / `@cal` / `@drive` AI search:**
1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
2. Set `ANTHROPIC_API_KEY` in the config block at the top of the `<script>` section
3. For production: proxy requests through a serverless function rather than exposing the key in the browser

---

## Version History

### v9.6 — 2026-03-21
- Desktop: drag divider to resize main/sidebar columns; persists to localStorage
- Desktop: double-click divider or "Reset layout →" footer button to restore default width
- Desktop: dark mode moved to nav dot (filled circle = on); hidden on mobile
- Mobile: dark mode footer toggle unchanged (○/●)
- Fluid `clamp()` scaling on greeting, spacing, and link sizes — smooth resize, no hard breakpoints
- "Everything else" section: soft fade + hidden scrollbar on desktop
- Footer buttons split cleanly by viewport: Reset layout (desktop) / Dark mode (mobile)

### v9.5 — 2026-03-21
- Mobile artwork skeleton height increased to better match average loaded size
- Mobile time tap: extended revert delay from 3s to 5s
- Daily section: Sites Admin promoted to primary grid; Claude kept; Dev & Creative moved to Everything Else
- Everything Else: Finance & Shopping moved to first (left) column
- Sidebar: temperature shows °C on hover, reverts to °F on mouse-out
- Footer: visit counter replaced with version number
- Footer: date changed to "Last Updated"
- Footer: Refresh greeting replaced with Dark mode toggle (○/●); preference persisted
- Footer: sticky — always visible, never overlapping content
- Search: auto-focuses on page load (new tab behavior)
- Responsive: max-height breakpoints added to retain content at small window heights

### v9.4 — prior
- Initial documented version
- Search with engine cycling (DDG / Google / Bing)
- `@mail` / `@cal` / `@drive` command integration via Anthropic API
- Sidebar: clock, weather, quote, today in history, r/museum artwork
- Tools: Pomodoro, scratchpad, color picker + eyedropper
- Dark mode foundation
- Mobile layout (≤700px): sidebar above main, 2-column grid

---

## Roadmap

- **Built-in editor** — edit links, categories, and layout without touching the HTML
- **Column drag** — resize primary grid column widths
- **API integration** — calendar view, task runner, auto-email
- **AI tools** — scheduler, prioritizer, graphic generation
- **Profile** — localStorage-based preferences (name, location, timezone)
- **Public deployment** — config-driven version for others to self-host

---

## Security note

The `ANTHROPIC_API_KEY` in the script config is intentionally left blank in this repo. Never commit a real key. For production use, proxy API calls through a serverless function (Cloudflare Workers, Netlify Functions, etc.) so the key never reaches the browser.

---

## License

MIT — see [LICENSE](LICENSE)
