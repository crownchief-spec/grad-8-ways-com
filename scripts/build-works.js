/**
 * 攝影作品文章系統 - 建置腳本
 * 讀取 content/works/*.md，產生 works.json 與 pages/work/<slug>.html
 * 使用方式：npm run build:works
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

const CONTENT_DIR = path.join(__dirname, '../content/works');
const DATA_DIR = path.join(__dirname, '../assets/data');
const PAGES_WORK_DIR = path.join(__dirname, '../pages/work');
const TEMPLATE_PATH = path.join(__dirname, '../templates/work-detail.html');
const SITE_BASE = 'https://grad.8-ways.com';

const CATEGORY_LABELS = {
  'graduation-photo': '畢業照攝影',
  'graduation-ceremony': '畢業典禮攝影',
  'school-event': '學校活動攝影',
  'family-photo': '家庭寫真',
};

const SUBCATEGORY_LABELS = {
  'kindergarten': '幼兒園',
  'primary-school': '小學',
  'school': '學校',
  'family': '家庭',
  'group-family': '團體家庭',
  'outdoor': '戶外',
  'campus-life': '校園生活',
  'event': '活動',
};

function getLabel(map, value) {
  if (!value) return '';
  return map[value] || value;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => path.join(dir, f));
}

function parseWork(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  if (data.draft === true) return null;
  const slug = path.basename(filePath, '.md');
  const categoryLabel = getLabel(CATEGORY_LABELS, data.category);
  const subcategoryLabel = getLabel(SUBCATEGORY_LABELS, data.subcategory);
  const gallery = Array.isArray(data.gallery) ? data.gallery : [];
  const tags = Array.isArray(data.tags) ? data.tags : [];
  let dateStr = '';
  if (data.date) {
    if (typeof data.date === 'object' && data.date.toISOString) {
      dateStr = data.date.toISOString().slice(0, 10);
    } else {
      dateStr = String(data.date).slice(0, 10);
    }
  }
  const dateDisplay = dateStr ? dateStr.replace(/-/g, '/') : '';

  return {
    slug,
    title: data.title || '未命名作品',
    date: dateDisplay,
    dateISO: dateStr || null,
    category: data.category || '',
    subcategory: data.subcategory || '',
    categoryLabel,
    subcategoryLabel,
    cover: data.cover || '',
    excerpt: data.excerpt || '',
    gallery,
    video: data.video || '',
    tags,
    body: content ? content.trim() : '',
  };
}

function buildWorksList(files) {
  const works = [];
  for (const fp of files) {
    const w = parseWork(fp);
    if (w) works.push(w);
  }
  works.sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || ''));
  return works;
}

function pathToAbsolute(p) {
  if (!p) return '';
  return p.startsWith('http') ? p : (p.startsWith('/') ? SITE_BASE + p : SITE_BASE + '/' + p);
}

function buildDetailHtml(work) {
  let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const coverPath = (work.cover || '').replace(/^\//, '');
  const shareUrl = `${SITE_BASE}/pages/work/${work.slug}.html`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(work.title);
  const metaTitle = `${work.title}｜小巴老師｜8-ways.com`;
  const metaDesc = work.excerpt ? work.excerpt.slice(0, 160) : work.title;
  const ogImage = pathToAbsolute(work.cover);

  const categoryBlock = work.categoryLabel
    ? ` <span class="work-badge">${work.categoryLabel}</span>` : '';
  const subcategoryBlock = work.subcategoryLabel
    ? ` <span class="work-badge">${work.subcategoryLabel}</span>` : '';

  const excerptBlock = work.excerpt
    ? `<div class="work-excerpt"><p>${escapeHtml(work.excerpt)}</p></div>` : '';

  const bodyHtml = work.body && marked
    ? marked.parse(work.body, { gfm: true })
    : (work.body ? `<div class="work-body">${escapeHtml(work.body).replace(/\n/g, '<br>')}</div>` : '');
  const bodyBlock = work.body
    ? `<div class="work-body prose">${bodyHtml}</div>` : '';

  let galleryHtml = '';
  if (work.gallery && work.gallery.length > 0) {
    const items = work.gallery.map((src) => {
      const s = (src || '').replace(/^\//, '');
      return `<div class="work-gallery-item"><img src="../../${s}" alt="" loading="lazy" /></div>`;
    }).join('\n');
    galleryHtml = `<div class="work-gallery" aria-label="作品相簿">\n${items}\n</div>`;
  }
  const galleryBlock = galleryHtml;

  let videoBlock = '';
  if (work.video && work.video.trim()) {
    const v = work.video.trim();
    const embedUrl = v.includes('youtube.com') || v.includes('youtu.be')
      ? v.replace(/youtu\.be\/([^?]+)/, 'https://www.youtube.com/embed/$1').replace(/watch\?v=([^&]+)/, 'embed/$1')
      : v;
    videoBlock = `<div class="work-video-wrap"><div class="work-video-inner"><iframe src="${escapeHtml(embedUrl)}" title="作品影片" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div>`;
  }

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  const replacements = {
    '{{metaTitle}}': metaTitle,
    '{{metaDescription}}': metaDesc,
    '{{ogImage}}': ogImage,
    '{{shareUrl}}': shareUrl,
    '{{title}}': escapeHtml(work.title),
    '{{date}}': escapeHtml(work.date),
    '{{dateISO}}': work.dateISO || work.date,
    '{{categoryBlock}}': categoryBlock,
    '{{subcategoryBlock}}': subcategoryBlock,
    '{{excerptBlock}}': excerptBlock,
    '{{coverPath}}': coverPath,
    '{{bodyBlock}}': bodyBlock,
    '{{galleryBlock}}': galleryBlock,
    '{{videoBlock}}': videoBlock,
    '{{facebookShareUrl}}': facebookShareUrl,
    '{{lineShareUrl}}': lineShareUrl,
    '{{twitterShareUrl}}': twitterShareUrl,
  };

  for (const [k, v] of Object.entries(replacements)) {
    html = html.split(k).join(v);
  }
  return html;
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function main() {
  ensureDir(DATA_DIR);
  ensureDir(PAGES_WORK_DIR);

  const files = listMarkdownFiles(CONTENT_DIR);
  const works = buildWorksList(files);

  fs.writeFileSync(
    path.join(DATA_DIR, 'works.json'),
    JSON.stringify(works, null, 2),
    'utf8'
  );
  console.log('已寫入 assets/data/works.json，共', works.length, '篇作品');

  for (const work of works) {
    const html = buildDetailHtml(work);
    const outPath = path.join(PAGES_WORK_DIR, work.slug + '.html');
    fs.writeFileSync(outPath, html, 'utf8');
    console.log('  生成', work.slug + '.html');
  }

  console.log('建置完成。');
}

main();
