// Builds fonts.json from Fonts In Use RSS feeds.
// Runs in GitHub Actions (Node 20+, no dependencies).
// Merges new uses into the existing archive so the pool grows over time.
//
//   node scripts/build-fonts.mjs [out=fonts.json]

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const OUT = process.argv[2] || 'fonts.json';
const MAX_USES = 600;
const FEEDS = [
  { url: 'https://fontsinuse.com/staff-picks.rss', staffPick: true },
  { url: 'https://fontsinuse.com/main.rss', staffPick: false },
];

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  ndash: '–', mdash: '—', hellip: '…', eacute: 'é',
};
function decode(s) {
  return String(s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
const stripTags = (s) => decode(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : '';
};
const titleCase = (slug) => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export function parseItem(xml, staffPick) {
  const link = decode(tag(xml, 'link'));
  const idm = link.match(/\/uses\/(\d+)\//);
  if (!idm) return null;
  const html = tag(xml, 'description');

  // Typeface names: any anchor to a typeface page that has text
  const names = {};
  for (const m of html.matchAll(/<a\b[^>]*href="https:\/\/fontsinuse\.com\/typefaces\/(\d+)\/[^"]*"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = stripTags(m[2]);
    if (text && !names[m[1]]) names[m[1]] = text;
  }

  // Typeface blocks: <a href=".../typefaces/ID/slug"><img src="sample"/></a>
  const typefaces = [];
  const seen = new Set();
  for (const m of html.matchAll(/<a\b[^>]*href="(https:\/\/fontsinuse\.com\/typefaces\/(\d+)\/([^"]+))"[^>]*>\s*<img\b[^>]*src="([^"]+)"/gi)) {
    const [, url, id, slug, sample] = m;
    if (seen.has(id)) continue;
    seen.add(id);
    typefaces.push({ id, name: names[id] || titleCase(slug), url, sample: decode(sample) });
  }

  // Example images: any use photo (static/use-media-items/), whatever wraps it —
  // some posts use <div class="embedded-use-item">, most a bare <a><img></a>
  const images = [];
  for (const m of html.matchAll(/<img\b[^>]*src="([^"]*\/static\/use-media-items\/[^"]+)"/gi)) {
    const src = decode(m[1]);
    if (!images.includes(src)) images.push(src);
    if (images.length >= 6) break;
  }

  // Short excerpt: body text without the credit line and footer
  // Prefer the first real prose paragraph; skip credit lines and font metadata
  const paras = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((p) => p.length > 40 && !/^Contributed by|License:|originally published at/i.test(p));
  let text = paras[0] || '';
  if (text.length > 260) text = text.slice(0, 257).replace(/\s+\S*$/, '') + '…';

  return {
    id: idm[1],
    title: stripTags(tag(xml, 'title')),
    url: link,
    date: new Date(tag(xml, 'pubDate') || Date.now()).toISOString(),
    author: stripTags(tag(xml, 'author')),
    staffPick,
    typefaces,
    images,
    excerpt: text,
  };
}

export function parseFeed(xml, staffPick) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)]
    .map((m) => parseItem(m[0], staffPick))
    .filter((u) => u && u.typefaces.length);
}

async function main() {
  let archive = { updated: null, uses: [] };
  if (existsSync(OUT)) {
    try { archive = JSON.parse(readFileSync(OUT, 'utf8')); } catch { /* start fresh */ }
  }
  const byId = new Map(archive.uses.map((u) => [u.id, u]));
  let fetched = 0;

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: { 'User-Agent': 'startpage.benolivas.com fonts-of-the-day (personal startpage)' } });
      if (!res.ok) throw new Error(res.status);
      for (const use of parseFeed(await res.text(), feed.staffPick)) {
        const prev = byId.get(use.id);
        // Keep the staff-pick flag if any feed has marked it
        byId.set(use.id, { ...prev, ...use, staffPick: use.staffPick || !!(prev && prev.staffPick) });
        fetched++;
      }
    } catch (e) {
      console.warn(`Feed failed: ${feed.url} (${e.message})`);
    }
  }

  if (!fetched) {
    console.warn('No items fetched; leaving archive unchanged.');
    return;
  }
  const uses = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_USES);
  const { day, history } = pickDay(uses, archive.day, archive.history || []);
  writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), day, history, uses }, null, 1) + '\n');
  console.log(`fonts.json: ${uses.length} uses (${fetched} from feeds); ${day.date}: ${day.picks.length} picks`);
}

/* ── Daily picks ──
   One font of the day + ALTERNATES, identical for every visitor because they
   live in fonts.json. Chosen once per Pacific calendar day: re-running the
   workflow on the same day keeps the same picks. Fonts picked in the last
   NO_REPEAT_DAYS are skipped; staff-pick typefaces are preferred.            */
const ALTERNATES = 8;
const NO_REPEAT_DAYS = 30;

const laDate = (d = new Date()) => d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

// Small deterministic PRNG seeded from the date, so a given day always shuffles the same way
function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function pickDay(uses, prevDay, prevHistory, date = laDate()) {
  // Typefaces that can show at least one example image
  const eligible = new Map();
  for (const u of uses) {
    if (!u.images || !u.images.length) continue;
    for (const t of u.typefaces) {
      const e = eligible.get(t.id) || { id: t.id, staff: false };
      e.staff = e.staff || u.staffPick;
      eligible.set(t.id, e);
    }
  }

  // Same day and picks still valid → keep them stable
  if (prevDay && prevDay.date === date && prevDay.picks.length && prevDay.picks.every((id) => eligible.has(id))) {
    return { day: prevDay, history: prevHistory };
  }

  const cutoff = laDate(new Date(Date.now() - NO_REPEAT_DAYS * 864e5));
  const recent = new Set(prevHistory.filter((h) => h.date >= cutoff && h.date !== date).flatMap((h) => h.picks));
  const rand = seeded(date);
  const shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const all = [...eligible.values()];
  const fresh = all.filter((e) => !recent.has(e.id));
  const pool = fresh.length >= ALTERNATES + 1 ? fresh : all; // small archive: allow repeats
  // Staff picks first, then the rest, each group shuffled by the day's seed
  const ordered = [...shuffle(pool.filter((e) => e.staff)), ...shuffle(pool.filter((e) => !e.staff))];
  const picks = ordered.slice(0, ALTERNATES + 1).map((e) => e.id);

  const history = [...prevHistory.filter((h) => h.date >= cutoff && h.date !== date), { date, picks }];
  return { day: { date, picks }, history };
}

if (import.meta.url === `file://${process.argv[1]}`) main();
