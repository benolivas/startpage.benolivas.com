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

  // Example images from embedded use items
  const images = [];
  for (const m of html.matchAll(/class="embedded-use-item"[\s\S]*?<img\b[^>]*src="([^"]+)"/gi)) {
    const src = decode(m[1]);
    if (!images.includes(src)) images.push(src);
    if (images.length >= 6) break;
  }

  // Short excerpt: body text without the credit line and footer
  let text = stripTags(
    html
      .replace(/Contributed by[\s\S]*?<\/a>/i, '')
      .replace(/This post was originally published at[\s\S]*$/i, '')
      .replace(/<div class="embedded-use-item"[\s\S]*?<\/div>/gi, ''),
  );
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
  writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), uses }, null, 1) + '\n');
  console.log(`fonts.json: ${uses.length} uses (${fetched} from feeds)`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
