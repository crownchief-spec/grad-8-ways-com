/**
 * Blog 建置腳本
 * 讀取 content/articles/*.md，產生 blog/index.html（列表）與 blog/{slug}.html（文章頁）
 * 使用方式：npm run build:blog
 */

const fs = require('fs');
const path = require('path');

let matter;
try {
  matter = require('gray-matter');
} catch (e) {
  console.error('請先執行 npm install gray-matter marked');
  process.exit(1);
}
let marked;
try {
  marked = require('marked');
} catch (e) {
  marked = null;
}

const CONTENT_DIR = path.join(__dirname, '../content/articles');
const BLOG_DIR = path.join(__dirname, '../blog');
const SITE_BASE = 'https://grad.8-ways.com';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md')
    .map((f) => path.join(dir, f));
}

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseArticle(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const slug = data.slug || path.basename(filePath, '.md');
  const title = data.title || slug;
  const description = data.description ? String(data.description).trim() : '';
  const date = data.date ? String(data.date).trim() : '';
  const cover = data.cover ? String(data.cover).trim() : '';
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const body = content ? content.trim() : '';
  return {
    slug,
    title,
    description,
    date,
    cover,
    tags,
    body,
    ...data,
  };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Blog 頁面在 blog/ 目錄下，圖片改為相對路徑 ../assets/images/blog/ 才能正確載入 */
function blogImageSrc(absolutePath) {
  if (!absolutePath || typeof absolutePath !== 'string') return '';
  return absolutePath.replace(/^\/images\/blog\//, '../assets/images/blog/');
}

function articleBodyImageSrc(html) {
  if (!html || typeof html !== 'string') return html;
  return html.replace(/src="\/images\/blog\//g, 'src="../assets/images/blog/');
}

function buildIndexHtml(articles) {
  const sorted = [...articles].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const cards = sorted.map((a) => {
    const coverSrc = blogImageSrc(a.cover) || escapeHtml(a.cover);
    const coverImg = a.cover
      ? `<img src="${coverSrc}" alt="${escapeHtml(a.title)}" loading="lazy" class="blog-card-cover" />`
      : '';
    const dateStr = formatDate(a.date);
    return `<article class="blog-card">
  <a href="${a.slug}.html" class="blog-card-link">
    ${coverImg}
    <div class="blog-card-body">
      <h2 class="blog-card-title">${escapeHtml(a.title)}</h2>
      ${dateStr ? `<time class="blog-card-date">${escapeHtml(dateStr)}</time>` : ''}
      ${a.description ? `<p class="blog-card-excerpt">${escapeHtml(a.description)}</p>` : ''}
      <span class="blog-card-cta">閱讀全文</span>
    </div>
  </a>
</article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>幼兒園畢業照攝影 畢業典禮攝影｜畢業攝影資訊分享｜小巴老師｜8-ways.com</title>
  <link rel="icon" type="image/png" href="../assets/images/logo/eightways-logo-square-gold.png" />
  <meta name="description" content="幼兒園畢業照攝影、畢業典禮攝影與拍攝規劃相關的專業資訊與經驗分享。" />
  <link rel="canonical" href="${SITE_BASE}/blog/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="幼兒園畢業照攝影 畢業典禮攝影｜畢業攝影資訊分享｜小巴老師" />
  <meta property="og:description" content="幼兒園畢業照攝影、畢業典禮攝影與拍攝規劃相關的專業資訊與經驗分享。" />
  <meta property="og:url" content="${SITE_BASE}/blog/" />
  <meta property="og:locale" content="zh_TW" />
  <meta name="robots" content="index, follow" />
  <link rel="stylesheet" href="../assets/css/style.css" />
</head>
<body>
  <div id="site-header-placeholder"></div>
  <main class="subpage" id="top">
    <section class="section tight section--articles">
      <div class="container container--articles">
        <p class="kicker">攝影資訊</p>
        <h1>畢業攝影資訊分享</h1>
        <p class="intro-desc">幼兒園畢業照攝影、畢業典禮攝影與拍攝規劃相關的專業資訊與經驗分享。</p>
        <p class="intro-desc">在這裡整理與幼兒園畢業照、畢業典禮攝影、服裝規劃、拍攝流程與活動設計相關的文章內容，提供學校與家長在規劃畢業拍攝時參考。</p>
        <div class="blog-list">
          ${cards}
        </div>
        <div class="actions actions--articles" style="margin-top:24px">
          <a class="btn ghost" href="../index.html">回首頁</a>
        </div>
      </div>
    </section>
  </main>
  <div id="site-footer-placeholder"></div>
  <script src="../assets/js/include-components.js" defer></script>
  <script src="../assets/js/main.js" defer></script>
</body>
</html>`;
}

function buildArticleHtml(a) {
  let bodyHtml = a.body && marked ? marked.parse(a.body, { gfm: true }) : escapeHtml(a.body || '').replace(/\n/g, '<br>');
  bodyHtml = articleBodyImageSrc(bodyHtml);
  const ogCoverPath = a.cover && !a.cover.startsWith('http') ? a.cover.replace(/^\/images\/blog\//, '/assets/images/blog/') : a.cover;
  const ogImage = a.cover ? (a.cover.startsWith('http') ? a.cover : SITE_BASE + ogCoverPath) : '';
  const articleUrl = `${SITE_BASE}/blog/${a.slug}.html`;

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>幼兒園畢業照攝影 畢業典禮攝影｜${escapeHtml(a.title)}｜小巴老師｜8-ways.com</title>
  <link rel="icon" type="image/png" href="../assets/images/logo/eightways-logo-square-gold.png" />
  <meta name="description" content="${escapeHtml(a.description || a.title)}" />
  <link rel="canonical" href="${articleUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(a.title)}" />
  <meta property="og:description" content="${escapeHtml(a.description || a.title)}" />
  <meta property="og:url" content="${articleUrl}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
  <meta property="og:locale" content="zh_TW" />
  <meta name="robots" content="index, follow" />
  <link rel="stylesheet" href="../assets/css/style.css" />
</head>
<body>
  <div id="site-header-placeholder"></div>
  <main class="subpage" id="top">
    <article class="section tight">
      <div class="container" style="max-width:720px">
        <header class="article-header">
          <p class="kicker"><a href="../blog/">攝影資訊</a></p>
          <h1>${escapeHtml(a.title)}</h1>
          ${a.date ? `<time class="article-date">${escapeHtml(formatDate(a.date))}</time>` : ''}
        </header>
        <div class="article-body prose">
          ${bodyHtml}
        </div>
        <div class="actions" style="margin-top:32px">
          <a class="btn ghost" href="../blog/">← 回攝影資訊列表</a>
          <a class="btn ghost" href="../index.html">回首頁</a>
        </div>
      </div>
    </article>
  </main>
  <div id="site-footer-placeholder"></div>
  <script src="../assets/js/include-components.js" defer></script>
  <script src="../assets/js/main.js" defer></script>
</body>
</html>`;
}

function main() {
  ensureDir(BLOG_DIR);
  const files = listMarkdown(CONTENT_DIR);
  const articles = files.map(parseArticle);

  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), buildIndexHtml(articles), 'utf8');
  console.log('已寫入 blog/index.html');

  articles.forEach((a) => {
    fs.writeFileSync(path.join(BLOG_DIR, a.slug + '.html'), buildArticleHtml(a), 'utf8');
    console.log('  生成 blog/' + a.slug + '.html');
  });
  console.log('Blog 建置完成，共', articles.length, '篇文章。');
}

main();
