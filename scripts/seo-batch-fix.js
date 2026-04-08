const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_BASE = 'https://grad.8-ways.com';
const BRAND = '小巴老師攝影團隊';
const BRAND_COMPANY = '八威創意有限公司';
const DEFAULT_THEME_COLOR = '#b08b57';

const EXCLUDE_DIRS = new Set(['.git', 'node_modules']);
const EXCLUDE_FILES = new Set([
  'components/header.html',
  'components/footer.html',
  'components/cta-global.html',
  'templates/work-detail.html',
]);

function walkHtmlFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIRS.has(e.name)) continue;
    const abs = path.join(dir, e.name);
    const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (e.isDirectory()) walkHtmlFiles(abs, out);
    else if (e.isFile() && e.name.endsWith('.html') && !EXCLUDE_FILES.has(rel)) out.push(rel);
  }
  return out.sort();
}

function routeFromFile(rel) {
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function urlFromRoute(route) {
  if (route === '/') return `${SITE_BASE}/`;
  return `${SITE_BASE}${route}`;
}

function toAbsImage(src, route) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('//')) return `https:${src}`;
  const cleanRoute = route.endsWith('/') ? route : `${route.substring(0, route.lastIndexOf('/') + 1) || '/'}`;
  if (src.startsWith('/')) return `${SITE_BASE}${src}`;
  return `${SITE_BASE}${path.posix.normalize(path.posix.join(cleanRoute, src))}`;
}

function stripTags(v) {
  return String(v || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function pick(regex, text) {
  const m = text.match(regex);
  return m ? m[1].trim() : '';
}

function pickHeroImage(html, route) {
  const htmlNoScript = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  const heroSection = htmlNoScript.match(/<section[^>]*class="[^"]*hero[^"]*"[^>]*>[\s\S]*?<\/section>/i);
  if (heroSection) {
    const img = pick(/<img[^>]*src="([^"]+)"/i, heroSection[0]);
    if (img) return toAbsImage(img, route);
    const bg = pick(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i, heroSection[0].replace(/"/g, '"'));
    if (bg) return toAbsImage(bg, route);
  }
  const cover = pick(/<img[^>]*class="[^"]*(cover|hero|kv|banner)[^"]*"[^>]*src="([^"]+)"/i, htmlNoScript);
  if (cover) return toAbsImage(cover, route);
  const firstImg = pick(/<img[^>]*src="([^"]+)"/i, htmlNoScript);
  return toAbsImage(firstImg, route);
}

function safeAttr(text) {
  return String(text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').trim();
}

function pageToken(rel) {
  return rel.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

function schemaTypeForFile(rel, html) {
  if (rel === 'index.html') return 'Organization,WebSite';
  if (rel.startsWith('blog/') && rel !== 'blog/index.html') return 'BlogPosting,BreadcrumbList';
  if (rel.startsWith('pages/work/')) return 'Article,BreadcrumbList,ImageObject';
  if (rel.includes('faq')) return 'WebPage,FAQPage';
  if (rel.includes('pricing') || rel.includes('plans') || rel.includes('service')) return 'Service,WebPage';
  return 'WebPage';
}

function buildSchema(rel, route, seo, noindex) {
  const url = seo.canonical;
  const items = [];
  if (rel === 'index.html') {
    items.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: BRAND,
      legalName: BRAND_COMPANY,
      url,
      logo: `${SITE_BASE}/assets/images/logo/eightways-logo-square-gold.png`,
      contactPoint: [{ '@type': 'ContactPoint', telephone: '+886-911-252-302', contactType: 'customer service', areaServed: 'TW' }],
    });
    items.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BRAND,
      url,
      inLanguage: 'zh-Hant',
    });
  } else {
    const isArticle = rel.startsWith('blog/') || rel.startsWith('pages/work/');
    const base = {
      '@context': 'https://schema.org',
      '@type': isArticle ? 'Article' : 'WebPage',
      name: seo.title,
      headline: seo.title,
      description: seo.description,
      url,
      inLanguage: 'zh-Hant',
      isPartOf: { '@type': 'WebSite', name: BRAND, url: `${SITE_BASE}/` },
      image: seo.ogImage || undefined,
    };
    items.push(base);
    const segments = route.split('/').filter(Boolean);
    if (segments.length > 0) {
      const list = [{ '@type': 'ListItem', position: 1, name: '首頁', item: `${SITE_BASE}/` }];
      let acc = '';
      segments.forEach((s, i) => {
        acc += `/${s}`;
        list.push({ '@type': 'ListItem', position: i + 2, name: s.replace(/[-_]/g, ' '), item: `${SITE_BASE}${acc}${i === segments.length - 1 && rel.endsWith('/index.html') ? '/' : ''}` });
      });
      items.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list });
    }
    if (/faq/i.test(rel)) {
      items.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [{
          '@type': 'Question',
          name: '常見問題',
          acceptedAnswer: { '@type': 'Answer', text: 'FAQ 內容請依頁面實際問答持續維護。' },
        }],
      });
    }
  }
  if (noindex) {
    items.push({ '@context': 'https://schema.org', '@type': 'WebPage', url, name: seo.title, description: 'noindex page' });
  }
  return items.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n  ');
}

function ensureHead(html, rel) {
  const route = routeFromFile(rel);
  const canonical = urlFromRoute(route);
  const oldTitle = stripTags(pick(/<title>([\s\S]*?)<\/title>/i, html)) || `${BRAND}｜8-ways.com`;
  const oldDesc = stripTags(pick(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i, html)) || `${BRAND} 提供幼兒園畢業照與畢業典禮攝影服務。`;
  const title = oldTitle;
  const description = oldDesc.slice(0, 160);
  const hero = pickHeroImage(html, route);
  const noindex = rel.startsWith('projects/') || /noindex/i.test(html);
  const ogType = (rel.startsWith('blog/') && rel !== 'blog/index.html') || rel.startsWith('pages/work/') ? 'article' : 'website';
  const fallbackOg = `${SITE_BASE}/assets/images/hero/graduation-hero-01.jpg?v=${pageToken(rel)}`;
  const seo = {
    file: rel,
    route,
    title,
    description,
    canonical,
    heroImage: hero || 'TODO: 缺 hero image',
    ogImage: (!hero || hero.includes('+') || hero.includes('{{')) ? fallbackOg : hero,
    schemaType: schemaTypeForFile(rel, html),
    noindex: noindex ? 'yes' : 'no',
  };

  const headStart = html.search(/<head>/i);
  const headEnd = html.search(/<\/head>/i);
  if (headStart < 0 || headEnd < 0) return { html, seo };

  const before = html.slice(0, headStart + '<head>'.length);
  const after = html.slice(headEnd);
  const styleLinks = Array.from(html.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/gi)).map((m) => m[0]);
  if (!styleLinks.some((s) => /assets\/css\/style\.css/.test(s))) {
    styleLinks.push('<link rel="stylesheet" href="/assets/css/style.css" />');
  }
  const otherHeadLinks = Array.from(html.matchAll(/<link[^>]*rel="preconnect"[^>]*>|<link[^>]*rel="preload"[^>]*>/gi)).map((m) => m[0]);
  const schema = buildSchema(rel, route, seo, noindex);
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';
  const head = `
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeAttr(title)}</title>
  <meta name="description" content="${safeAttr(description)}" />
  <meta name="robots" content="${robots}" />
  <meta name="theme-color" content="${DEFAULT_THEME_COLOR}" />
  <link rel="canonical" href="${safeAttr(canonical)}" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/assets/images/logo/eightways-logo-square-gold.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta property="og:locale" content="zh_TW" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${safeAttr(title)}" />
  <meta property="og:description" content="${safeAttr(description)}" />
  <meta property="og:url" content="${safeAttr(canonical)}" />
  <meta property="og:image" content="${safeAttr(seo.ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeAttr(title)}" />
  <meta name="twitter:description" content="${safeAttr(description)}" />
  <meta name="twitter:image" content="${safeAttr(seo.ogImage)}" />
  ${otherHeadLinks.join('\n  ')}
  ${styleLinks.join('\n  ')}
  ${schema}`;
  return { html: `${before}${head}\n${after}`, seo };
}

function updateHtmlLang(html) {
  if (/<html[^>]*lang=/i.test(html)) return html.replace(/<html([^>]*)lang="[^"]*"([^>]*)>/i, '<html$1lang="zh-Hant"$2>');
  return html.replace(/<html([^>]*)>/i, '<html lang="zh-Hant"$1>');
}

function ensureMainImageAttrs(html) {
  return html.replace(/<img([^>]*?)>/gi, (full, attrs) => {
    let out = attrs;
    if (!/\balt="/i.test(out)) out += ' alt="TODO: 補上圖片描述"';
    if (!/\bwidth="/i.test(out) && !/\bheight="/i.test(out) && /\bclass="[^"]*(hero|cover)/i.test(out)) out += ' width="1200" height="630"';
    if (/class="[^"]*(hero|cover)/i.test(out)) out = out.replace(/\sloading="lazy"/i, '');
    return `<img${out}>`;
  });
}

function main() {
  const htmlFiles = walkHtmlFiles(ROOT);
  const seoRows = [];

  for (const rel of htmlFiles) {
    const abs = path.join(ROOT, rel);
    let html = fs.readFileSync(abs, 'utf8');
    html = updateHtmlLang(html);
    html = ensureMainImageAttrs(html);
    const result = ensureHead(html, rel);
    fs.writeFileSync(abs, result.html, 'utf8');
    seoRows.push(result.seo);
  }

  const unique = Array.from(new Set(seoRows.filter((r) => r.noindex !== 'yes').map((r) => r.canonical))).sort();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((u) => `  <url><loc>${u}</loc><changefreq>monthly</changefreq><priority>${u.endsWith('/') ? '0.9' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_BASE}/sitemap.xml\n`, 'utf8');

  if (!fs.existsSync(path.join(ROOT, 'manifest.webmanifest'))) {
    fs.writeFileSync(path.join(ROOT, 'manifest.webmanifest'), JSON.stringify({
      name: '8-ways 幼兒園畢業照攝影',
      short_name: '8-ways',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: DEFAULT_THEME_COLOR,
      icons: [
        { src: '/assets/images/logo/eightways-logo-square-gold.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/images/logo/eightways-logo-square-gold.png', sizes: '512x512', type: 'image/png' },
      ],
    }, null, 2), 'utf8');
  }

  if (!fs.existsSync(path.join(ROOT, 'favicon.svg'))) {
    fs.writeFileSync(path.join(ROOT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#b08b57"/><text x="32" y="40" text-anchor="middle" font-size="28" fill="#fff" font-family="Arial">8</text></svg>`, 'utf8');
  }
  if (!fs.existsSync(path.join(ROOT, 'favicon.ico'))) {
    fs.copyFileSync(path.join(ROOT, 'assets/images/logo/eightways-logo-square-gold.png'), path.join(ROOT, 'favicon.ico'));
  }

  if (!fs.existsSync(path.join(ROOT, '404.html'))) {
    fs.writeFileSync(path.join(ROOT, '404.html'), `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>找不到頁面｜${BRAND}</title><meta name="robots" content="noindex, nofollow"/><link rel="canonical" href="${SITE_BASE}/404.html"/><link rel="icon" href="/favicon.ico"></head><body><main style="max-width:720px;margin:80px auto;padding:0 16px"><h1>404 找不到頁面</h1><p>此頁面不存在或已搬移，請回首頁繼續瀏覽。</p><p><a href="/">回首頁</a></p></main></body></html>`, 'utf8');
  }

  fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# ${BRAND}\n- 品牌：${BRAND}\n- 公司：${BRAND_COMPANY}\n- 網站用途：幼兒園畢業照、畢業典禮攝影服務與作品展示\n- 正式網站：${SITE_BASE}/\n- 重要頁面：\n  - ${SITE_BASE}/\n  - ${SITE_BASE}/pages/graduation-photo.html\n  - ${SITE_BASE}/pages/graduation-ceremony.html\n  - ${SITE_BASE}/pages/works.html\n  - ${SITE_BASE}/blog/\n- 服務主題：幼兒園畢業照、畢業紀念冊、畢業典禮攝影、流程與方案規劃\n- 服務區域：台北、新北、桃園、新竹、宜蘭、台中、高雄\n- 聯絡方式：Line/電話 0911-252-302\n`, 'utf8');

  const headers = ['page file', 'route', 'title', 'description', 'canonical', 'hero image', 'og image', 'schema type', 'noindex'];
  const md = [
    '# SEO 維護總表',
    '',
    '| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...seoRows.map((r) => `| ${r.file} | ${r.route} | ${r.title.replace(/\|/g, '/')} | ${r.description.replace(/\|/g, '/')} | ${r.canonical} | ${r.heroImage} | ${r.ogImage} | ${r.schemaType} | ${r.noindex} |`),
    '',
    '## TODO',
    '- `favicon.ico` 目前以既有 PNG 複製，建議後續替換為正式 ICO 多尺寸檔。',
    '- FAQPage 目前使用通用佔位內容，建議後續依實際 FAQ 問答填滿。',
    '- 若新增頁面，請同步更新 title、description、hero image 與 canonical。',
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'seo-maintenance.md'), md, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'assets/data/seo-map.json'), JSON.stringify(seoRows, null, 2), 'utf8');

  console.log(`SEO batch fix completed: ${seoRows.length} pages`);
}

main();
