const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://grad.8-ways.com';
const BRAND = '小巴老師攝影團隊';
const COMPANY = '八威創意有限公司';
const THEME = '#b08b57';
const SKIP = new Set(['components/header.html', 'components/footer.html', 'components/cta-global.html', 'templates/work-detail.html']);
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function walk(dir, out = [], onlyHtml = true) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const abs = path.join(dir, entry.name);
    const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (entry.isDirectory()) walk(abs, out, onlyHtml);
    else if (entry.isFile() && (onlyHtml ? (entry.name.endsWith('.html') && !SKIP.has(rel)) : IMAGE_EXT.has(path.extname(entry.name).toLowerCase()))) out.push(onlyHtml ? rel : abs);
  }
  return out.sort();
}
function strip(v) { return String(v || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim(); }
function esc(v) { return String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').trim(); }
function attr(tag, key) { const m = String(tag).match(new RegExp(`\\b${key}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i')); return m ? m[2].trim() : ''; }
function route(rel) { return rel === 'index.html' ? '/' : (rel.endsWith('/index.html') ? `/${rel.slice(0, -'index.html'.length)}` : `/${rel}`); }
function url(r) { return r === '/' ? `${SITE}/` : `${SITE}${r}`; }
function abs(src, r) {
  const value = String(src || '').trim().replace(/[?#].*$/, '');
  if (!value || value.startsWith('data:')) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  const base = r.endsWith('/') ? r : r.slice(0, r.lastIndexOf('/') + 1 || 1);
  return `${SITE}${path.posix.normalize(value.startsWith('/') ? value : path.posix.join(base, value))}`;
}
function local(urlValue) { if (!urlValue.startsWith(SITE)) return null; const file = path.join(ROOT, decodeURIComponent(urlValue.slice(SITE.length)).replace(/^\/+/, '')); return fs.existsSync(file) ? file : null; }
function between(html, re) { const m = html.match(re); return m ? strip(m[1]) : ''; }
function h1(html) { return between(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i); }
function title(html) { return between(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i); }
function description(html) { const tag = (html.match(/<meta\b[^>]*\bname=(["'])description\1[^>]*>/i) || [''])[0]; return strip(attr(tag, 'content')); }
function intro(html) { const main = (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || html; const all = [...main.matchAll(/<(?:p|h2)\b[^>]*>([\s\S]*?)<\/(?:p|h2)>/gi)].map((m) => strip(m[1])); return all.find((t) => t.length >= 18 && !/^首頁/.test(t)) || ''; }
function candidates(html, r) {
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, ''); const list = [];
  const add = (src) => { const image = abs(src, r); const file = local(image); if (file && IMAGE_EXT.has(path.extname(file).toLowerCase()) && !/(?:logo|favicon|icon|qr|avatar)/i.test(image) && !list.includes(image)) list.push(image); };
  const hero = clean.match(/<(?:section|div)\b[^>]*class=(["'])[^"']*\b(?:hero|cover|banner|kv)\b[^"']*\1[^>]*>[\s\S]*?<\/(?:section|div)>/i);
  if (hero) for (const tag of hero[0].match(/<img\b[^>]*>/gi) || []) add(attr(tag, 'src'));
  for (const tag of clean.match(/<img\b[^>]*>/gi) || []) add(attr(tag, 'src'));
  for (const m of clean.matchAll(/url\(\s*(["']?)([^'"\)]+)\1\s*\)/gi)) add(m[2]);
  return list;
}
function contentTitle(old, heading) { const value = old || heading || BRAND; return value.length <= 64 ? value : `${(heading || value).slice(0, 44)}｜${BRAND}`; }
function contentDescription(old, heading, body) { const value = old && old.length >= 28 && !/^小巴老師攝影團隊 提供/.test(old) ? old : (body || `${heading || '幼兒園畢業照攝影'}的服務與作品資訊。`); return value.length <= 155 ? value : `${value.slice(0, 152)}…`; }
function schemaKinds(rel) { if (rel === 'index.html') return 'Organization,WebSite'; if (rel.startsWith('blog/') && rel !== 'blog/index.html') return 'BlogPosting,BreadcrumbList'; if (rel.startsWith('pages/work/')) return 'Article,BreadcrumbList,ImageObject'; if (rel.includes('faq')) return 'WebPage,FAQPage,BreadcrumbList'; if (/(pricing|plans|service-flow|graduation-album|graduation-photo\.html|graduation-ceremony\.html)/.test(rel)) return 'Service,WebPage,BreadcrumbList'; return 'WebPage,BreadcrumbList'; }
function faqPairs(html) { const rows = []; for (const m of html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi)) { const q = strip(m[1]), a = strip(m[2]); if (q.length >= 2 && a.length >= 8) rows.push({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }); } return rows; }
function jsonLd(page) {
  if (page.rel === 'index.html') return [
    { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, legalName: COMPANY, url: page.seo.canonical, logo: `${SITE}/assets/images/logo/eightways-logo-square-gold.png`, contactPoint: [{ '@type': 'ContactPoint', telephone: '+886-911-252-302', contactType: 'customer service', areaServed: 'TW', availableLanguage: ['zh-Hant'] }] },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: `${SITE}/`, inLanguage: 'zh-Hant' },
  ];
  const article = page.rel.startsWith('blog/') || page.rel.startsWith('pages/work/');
  const service = !article && /(pricing|plans|service-flow|graduation-album|graduation-photo\.html|graduation-ceremony\.html)/.test(page.rel);
  const base = { '@context': 'https://schema.org', '@type': article ? (page.rel.startsWith('blog/') ? 'BlogPosting' : 'Article') : (service ? 'Service' : 'WebPage'), name: page.seo.title, headline: page.seo.title, description: page.seo.description, url: page.seo.canonical, inLanguage: 'zh-Hant', image: page.seo.ogImage, isPartOf: { '@type': 'WebSite', name: BRAND, url: `${SITE}/` } };
  if (article) Object.assign(base, { author: { '@type': 'Organization', name: BRAND }, publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: `${SITE}/assets/images/logo/eightways-logo-square-gold.png` } }, mainEntityOfPage: { '@type': 'WebPage', '@id': page.seo.canonical } });
  if (service) Object.assign(base, { provider: { '@type': 'Organization', name: BRAND, url: `${SITE}/` }, areaServed: '台灣', serviceType: page.heading || page.seo.title });
  const out = [base, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '首頁', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: page.heading || page.seo.title, item: page.seo.canonical }] }];
  if (page.rel.includes('faq')) { const pairs = faqPairs(page.html); if (pairs.length) out.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: pairs }); }
  if (page.rel.startsWith('pages/work/')) out.push({ '@context': 'https://schema.org', '@type': 'ImageObject', contentUrl: page.seo.ogImage, name: page.heading || page.seo.title, representativeOfPage: true });
  return out;
}
function imageA11y(html) { return html.replace(/<img\b([^>]*?)>/gi, (all, attrs) => { let out = attrs; if (!/\balt\s*=/i.test(out)) out += ' alt="圖片說明待補"'; if (/\bclass=(["'])[^"']*\b(?:hero|cover)\b/i.test(out)) out = out.replace(/\sloading=(["'])lazy\1/i, ''); return `<img${out}>`; }); }
function lang(html) { return /<html\b[^>]*\blang=/i.test(html) ? html.replace(/<html([^>]*)\blang=(["'])[^"']*\2([^>]*)>/i, '<html$1lang="zh-Hant"$3>') : html.replace(/<html([^>]*)>/i, '<html lang="zh-Hant"$1>'); }
function head(page, original) {
  const styles = [...original.matchAll(/<link\b[^>]*\brel=(["'])stylesheet\1[^>]*>/gi)].map((m) => m[0]); if (!styles.some((s) => /assets\/css\/style\.css/.test(s))) styles.push('<link rel="stylesheet" href="/assets/css/style.css" />');
  const preload = [...original.matchAll(/<link\b[^>]*\brel=(["'])(?:preconnect|preload)\1[^>]*>/gi)].map((m) => m[0]); const type = page.rel.startsWith('blog/') || page.rel.startsWith('pages/work/') ? 'article' : 'website'; const robots = page.noindex ? 'noindex, nofollow' : 'index, follow'; const scripts = jsonLd(page).map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join('\n  ');
  return `
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(page.seo.title)}</title>
  <meta name="description" content="${esc(page.seo.description)}" />
  <meta name="robots" content="${robots}" />
  <meta name="theme-color" content="${THEME}" />
  <link rel="canonical" href="${esc(page.seo.canonical)}" />
  <link rel="icon" href="/favicon.ico" sizes="32x32" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/assets/images/logo/eightways-logo-square-gold.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta property="og:locale" content="zh_TW" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="${BRAND}" />
  <meta property="og:title" content="${esc(page.seo.title)}" />
  <meta property="og:description" content="${esc(page.seo.description)}" />
  <meta property="og:url" content="${esc(page.seo.canonical)}" />
  <meta property="og:image" content="${esc(page.seo.ogImage)}" />
  <meta property="og:image:alt" content="${esc(page.seo.ogAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(page.seo.title)}" />
  <meta name="twitter:description" content="${esc(page.seo.description)}" />
  <meta name="twitter:image" content="${esc(page.seo.ogImage)}" />
  <!-- Analytics insertion point: add GA4, GTM or Meta Pixel production IDs here. -->
  ${preload.join('\n  ')}
  ${styles.join('\n  ')}
  ${scripts}`;
}
function favicon() {
  const file = path.join(ROOT, 'favicon.ico'); const before = fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0); if (before.length >= 4 && before[0] === 0 && before[1] === 0 && before[2] === 1 && before[3] === 0) return;
  const size = 32, pixels = size * size * 4, mask = size * size / 8, out = Buffer.alloc(22 + 40 + pixels + mask); out.writeUInt16LE(1, 2); out.writeUInt16LE(1, 4); out[6] = size; out[7] = size; out.writeUInt16LE(1, 10); out.writeUInt16LE(32, 12); out.writeUInt32LE(40 + pixels + mask, 14); out.writeUInt32LE(22, 18); out.writeUInt32LE(40, 22); out.writeInt32LE(size, 26); out.writeInt32LE(size * 2, 30); out.writeUInt16LE(1, 34); out.writeUInt16LE(32, 36); out.writeUInt32LE(pixels, 42); for (let i = 0; i < size * size; i += 1) { const p = 62 + i * 4; out[p] = 0x57; out[p + 1] = 0x8b; out[p + 2] = 0xb0; out[p + 3] = 0xff; } fs.writeFileSync(file, out);
}
function support(rows) {
  const indexable = rows.filter((row) => row.noindex === 'no').map((row) => row.canonical).sort(); fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((u) => `  <url><loc>${u}</loc><changefreq>monthly</changefreq><priority>${u === `${SITE}/` ? '1.0' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`); fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  fs.writeFileSync(path.join(ROOT, 'manifest.webmanifest'), JSON.stringify({ name: '8-ways 幼兒園畢業照攝影', short_name: '8-ways', start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: THEME, icons: [{ src: '/assets/images/logo/eightways-logo-square-gold.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/images/logo/eightways-logo-square-gold.png', sizes: '512x512', type: 'image/png' }] }, null, 2) + '\n');
  fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# ${BRAND}\n\n- 正式網站：${SITE}/\n- 公司：${COMPANY}\n- 服務：幼兒園畢業照、畢業紀念冊、畢業典禮攝影、流程與方案規劃。\n- 服務區域：台北、新北、桃園、新竹、宜蘭、台中、高雄。\n- 聯絡方式：Line／電話 0911-252-302。\n- 重要頁面：\n  - ${SITE}/pages/graduation-photo.html\n  - ${SITE}/pages/graduation-ceremony.html\n  - ${SITE}/pages/graduation-album.html\n  - ${SITE}/pages/works.html\n  - ${SITE}/blog/\n`);
  fs.mkdirSync(path.join(ROOT, 'assets/data'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'assets/data/seo-map.json'), JSON.stringify(rows, null, 2) + '\n');
  const header = ['檔案', '網址', '標題', '描述', '主圖', 'OG 圖', 'Schema', '索引']; const table = rows.map((r) => `| ${r.file} | ${r.canonical} | ${r.title.replace(/\|/g, '／')} | ${r.description.replace(/\|/g, '／')} | ${r.heroImage} | ${r.ogImage} | ${r.schemaType} | ${r.noindex} |`); fs.writeFileSync(path.join(ROOT, 'seo-maintenance.md'), ['# SEO 維護總表', '', '建置：`node scripts/seo-batch-fix.js`　驗證：`node scripts/verify-static-site.js`。', '', `| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...table, '', '## 維護規則', '', '- 新增頁面時先寫入自然、具體且不重複的 title 與 description，再執行建置。', '- 建置工具會優先採用該頁主視覺，並保證每頁的社群預覽圖不同；沒有頁面照片時會選用尚未使用的站內照片。', '- 圖片、方案、聯絡資訊或網址改動後，重新執行建置與驗證。', '- GA4／GTM／Meta Pixel 請加入每頁 `<head>` 的 Analytics insertion point。', ''].join('\n'));
}
function main() {
  const files = walk(ROOT); const spare = walk(path.join(ROOT, 'assets/images'), [], false).map((f) => `${SITE}/${path.relative(ROOT, f).replace(/\\/g, '/')}`).filter((u) => !/(?:logo|favicon|icon|qr|avatar)/i.test(u)); let spareAt = 0; const used = new Set();
  const pages = files.map((rel) => { const html = fs.readFileSync(path.join(ROOT, rel), 'utf8'); const r = route(rel); return { rel, html, r, heading: h1(html), choices: candidates(html, r), noindex: rel.startsWith('projects/') || /<meta\b[^>]*\bname=(["'])robots\1[^>]*\bcontent=(["'])[^"']*noindex/i.test(html) }; });
  for (const page of pages) { let og = page.choices.find((image) => !used.has(image)); while (!og && spareAt < spare.length) { const next = spare[spareAt++]; if (!used.has(next)) og = next; } if (!og) throw new Error(`Unique OG image unavailable: ${page.rel}`); used.add(og); page.seo = { file: page.rel, route: page.r, title: contentTitle(title(page.html), page.heading), description: contentDescription(description(page.html), page.heading, intro(page.html)), canonical: url(page.r), heroImage: page.choices[0] || '站內備用照片', ogImage: og, ogAlt: page.heading || title(page.html), schemaType: schemaKinds(page.rel), noindex: page.noindex ? 'yes' : 'no' }; }
  const titles = new Map(), descriptions = new Map(); for (const page of pages) { const t = titles.get(page.seo.title) || 0; titles.set(page.seo.title, t + 1); if (t) page.seo.title = `${page.heading || page.seo.title}｜${BRAND}`; const d = descriptions.get(page.seo.description) || 0; descriptions.set(page.seo.description, d + 1); if (d) page.seo.description = `${page.heading || '本頁服務'}：${page.seo.description}`.slice(0, 155); }
  const finalDescriptions = new Map(); for (const page of pages) { const d = finalDescriptions.get(page.seo.description) || 0; finalDescriptions.set(page.seo.description, d + 1); if (d) { const labels = { 'pages/graduation-yearbook.html': '畢業紀念冊內容與製作', 'pages/photographer-experience.html': '攝影師拍攝經歷', 'pages/portfolio.html': '畢業照作品集' }; const label = labels[page.rel] || page.heading || page.seo.title; page.seo.description = `${page.seo.description.replace(/。?$/, '')}｜${label}`.slice(0, 155); } }
  for (const page of pages) { let html = lang(imageA11y(page.html)); if (page.rel.startsWith('pages/work/')) html = html.replace(/href=(["'])\.\.\/index\.html\1/g, 'href="/pages/works.html"'); const start = html.search(/<head\b[^>]*>/i), end = html.search(/<\/head>/i), tag = (html.match(/<head\b[^>]*>/i) || [])[0]; if (start < 0 || end < 0) throw new Error(`Missing <head>: ${page.rel}`); html = `${html.slice(0, start)}${tag}${head(page, page.html)}\n${html.slice(end)}`; fs.writeFileSync(path.join(ROOT, page.rel), html); }
  favicon(); support(pages.map((page) => page.seo)); console.log(`SEO build complete: ${pages.length} pages; ${used.size} unique social images.`);
}
main();
