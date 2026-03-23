/**
 * 客戶專屬頁面 - 建置腳本
 * 讀取 content/projects/*.md，產生 projects-index.json 與 projects/<slug>.html
 * 使用方式：npm run build:projects
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

const CONTENT_DIR = path.join(__dirname, '../content/projects');
const PROJECTS_DIR = path.join(__dirname, '../projects');
const LEGACY_PROJECT_IMAGES_DIR = path.join(__dirname, '../assets/images/projects');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md')
    .map((f) => path.join(dir, f));
}

function listImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
}

function moveFileSafe(src, dest) {
  try {
    fs.renameSync(src, dest);
  } catch (e) {
    fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
  }
}

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseProject(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const slug = data.slug || path.basename(filePath, '.md');
  const passwordRaw = data.project_password != null ? data.project_password : data.password;
  const project_password = passwordRaw != null ? String(passwordRaw).trim() : '';
  const school = data.school ? String(data.school).trim() : '';
  return {
    slug,
    project_password,
    school,
    ...data,
    body: content ? content.trim() : '',
  };
}

function extractProgressSection(markdownBody) {
  if (!markdownBody) return '';
  const body = String(markdownBody).replace(/\r\n/g, '\n');
  const match = body.match(/^##\s*4[^\n]*\n([\s\S]*?)(?=^##\s|\Z)/m);
  if (match && match[1]) return match[1].trim();
  return '';
}

function extractShootContent(markdownBody) {
  if (!markdownBody) return '';
  const body = String(markdownBody).replace(/\r\n/g, '\n');
  const section2 = body.match(/^##\s*2[^\n]*\n([\s\S]*?)(?=^##\s|\Z)/m);
  const src = section2 && section2[1] ? section2[1] : body;
  const shootLine = src.match(/^\s*-\s*拍攝內容[:：]\s*(.+)$/m);
  return shootLine && shootLine[1] ? shootLine[1].trim() : '';
}

function buildIndex(projects) {
  const lookup = {};
  const records = [];
  projects.forEach((p) => {
    records.push({
      slug: p.slug,
      school: p.school ? String(p.school).trim() : '',
      password: p.project_password != null ? String(p.project_password).trim() : '',
    });
    if (p.school) {
      const school = String(p.school).trim();
      lookup[school] = p.slug;
      lookup[school.toLowerCase()] = p.slug;
    }
    if (p.project_password != null && String(p.project_password).trim() !== '') {
      const pwd = String(p.project_password).trim();
      lookup[pwd] = p.slug;
      lookup[pwd.toLowerCase()] = p.slug;
    }
  });
  return { lookup, projects: records };
}

function normalizeImageItems(p, schoolName) {
  const rawItems = Array.isArray(p.image_items) ? p.image_items : [];
  const normalized = rawItems
    .map((item, i) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const filename = item.replace(/^\.?\/?images\//i, '');
        if (!filename) return null;
        return {
          filename,
          alt: `${schoolName} 精選照片 ${i + 1}`,
          title: `${schoolName} 精選照片 ${i + 1}`,
        };
      }
      const filename = item.filename ? String(item.filename).replace(/^\.?\/?images\//i, '') : '';
      if (!filename) return null;
      return {
        filename,
        alt: item.alt ? String(item.alt) : `${schoolName} 精選照片 ${i + 1}`,
        title: item.title ? String(item.title) : `${schoolName} 精選照片 ${i + 1}`,
      };
    })
    .filter(Boolean);

  if (normalized.length) return normalized;

  const hero = Array.isArray(p.hero_images) ? p.hero_images.filter(Boolean) : [];
  return hero.map((src, i) => ({
    filename: String(src).replace(/^\.?\/?images\//i, ''),
    alt: `${schoolName} 精選照片 ${i + 1}`,
    title: `${schoolName} 精選照片 ${i + 1}`,
  }));
}

function buildDetailHtml(p, options = {}) {
  const assetPrefix = options.assetPrefix || '../../';
  const guardEntryHref = options.guardEntryHref || 'index.html';
  const resources = Array.isArray(p.resources) ? p.resources : [];
  const schoolName = p.school || p.title || '客戶專屬頁面';
  const pageNote = p.page_note ? String(p.page_note).trim() : '';
  const serviceText = p.service_type || p.service_category || p.package_name || '';
  const packageText = p.package || p.package_price || p.price || '';
  const shootContent = p.shoot_content || extractShootContent(p.body) || '';
  const progressBody = extractProgressSection(p.body);
  const bodyHtml = progressBody && marked
    ? marked.parse(progressBody, { gfm: true })
    : (progressBody ? `<div class="project-log">${escapeHtml(progressBody).replace(/\n/g, '<br>')}</div>` : '');
  const imageItems = normalizeImageItems(p, schoolName);
  const imageMetaMap = {};
  imageItems.forEach((it) => {
    imageMetaMap[it.filename] = it;
  });
  const heroImages = Array.isArray(p.hero_images) && p.hero_images.length
    ? p.hero_images.filter(Boolean).map((src) => String(src).replace(/^\.?\/?images\//i, ''))
    : imageItems.slice(0, 5).map((it) => it.filename);
  const shootDateLine = p.shoot_date ? `<p class="project-shoot-date"><strong>拍攝日期：</strong>${escapeHtml(String(p.shoot_date))}</p>` : '';
  const heroImagesHtml = heroImages.length
    ? heroImages.map((src, i) => {
      const meta = imageMetaMap[src] || {
        alt: `${schoolName} 精選照片 ${i + 1}`,
        title: `${schoolName} 精選照片 ${i + 1}`,
      };
      return `<img src="./images/${escapeHtml(src)}" alt="${escapeHtml(meta.alt)}" title="${escapeHtml(meta.title)}" ${i === 0 ? 'class="active"' : 'loading="lazy"'} />`;
    }).join('\n')
    : `<img src="${assetPrefix}assets/images/logo/eightways-logo-square-gold.png" alt="${escapeHtml(schoolName)}" class="active" />`;

  const galleryBlock = imageItems.length
    ? `<section class="project-section project-mosaic" aria-label="精選照片">
        <h2>精選照片</h2>
        ${pageNote ? `<p class="project-page-note">${escapeHtml(pageNote)}</p>` : ''}
        <div class="work-gallery work-gallery--masonry project-mosaic-grid" id="projectMosaic">
          ${imageItems.map((it) => `<div class="work-gallery-item"><img src="./images/${escapeHtml(it.filename)}" alt="${escapeHtml(it.alt)}" title="${escapeHtml(it.title)}" loading="lazy" /></div>`).join('')}
        </div>
      </section>`
    : '';

  const resourcesBlock = resources.length
    ? `<section class="project-section" aria-label="客戶下載">
        <h2>客戶下載</h2>
        <div class="project-resource-list">${resources.map((r) => `<a class="btn primary" href="${escapeHtml(r.url || '#')}" target="_blank" rel="noopener">${escapeHtml(r.label || '連結')}</a>`).join('')}</div>
      </section>`
    : '';
  const downloadResource = resources.find((r) => r && r.url && String(r.url).trim());
  const heroDownloadLabel = downloadResource && downloadResource.label
    ? String(downloadResource.label).trim()
    : '照片雲端下載';
  const heroDownloadHref = downloadResource ? String(downloadResource.url).trim() : '';
  const heroDownloadBtn = heroDownloadHref
    ? `<a class="btn primary project-hero-download-btn" href="${escapeHtml(heroDownloadHref)}" target="_blank" rel="noopener">${escapeHtml(heroDownloadLabel)}</a>`
    : `<span class="btn primary project-hero-download-btn is-disabled" aria-disabled="true">${escapeHtml(heroDownloadLabel)}</span>`;

  const noindex = p.noindex !== false;
  const isProtected = !!(p.project_password && String(p.project_password).trim());

  const guardScript = isProtected
    ? `<script>
(function(){
  var slug = ${JSON.stringify(p.slug)};
  try {
    var raw = sessionStorage.getItem('verified_projects');
    var list = raw ? JSON.parse(raw) : [];
    if (list.indexOf(slug) >= 0) return;
  } catch (e) {}
  location.replace('${guardEntryHref}?required=' + encodeURIComponent(slug) + '&msg=' + encodeURIComponent('此頁面需要輸入密碼才能查看'));
})();
</script>`
    : '';

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>幼兒園畢業照攝影 畢業典禮攝影｜${escapeHtml(schoolName)}｜客戶專屬頁面｜小巴老師｜8-ways.com</title>
  <link rel="icon" type="image/png" href="${assetPrefix}assets/images/logo/eightways-logo-square-gold.png" />
  <link rel="stylesheet" href="${assetPrefix}assets/css/style.css" />
  ${noindex ? '<meta name="robots" content="noindex, nofollow" />' : ''}
</head>
<body data-project-slug="${escapeHtml(p.slug)}" data-project-protected="${isProtected ? 'true' : 'false'}">
${guardScript}
  <div id="site-header-placeholder"></div>
  <main class="subpage project-detail" id="top">
    <section class="hero" aria-label="${escapeHtml(schoolName)} 精選照片">
      <div class="hero-media hero-carousel" id="heroCarousel" aria-hidden="true">
${heroImagesHtml}
      </div>
      <div class="overlay"></div>
      <div class="container inner">
        <header class="project-header project-header--hero">
          <h1 class="title">${escapeHtml(schoolName)}</h1>
        </header>
        <div class="project-hero-panel">
          ${shootDateLine}
          ${serviceText ? `<p><strong>服務資訊：</strong>${escapeHtml(serviceText)}</p>` : ''}
          ${packageText ? `<p><strong>方案：</strong>${escapeHtml(packageText)}</p>` : ''}
          ${shootContent ? `<p><strong>畢業照內容：</strong>${escapeHtml(shootContent)}</p>` : ''}
        </div>
      </div>
    </section>
    <div class="container project-detail-body project-detail-body--album" style="max-width:1000px">
      <div class="project-hero-download-wrap" aria-label="雲端下載入口">
        ${heroDownloadBtn}
      </div>
      <section class="project-section project-logs" aria-label="進度日誌">
        <h2>進度日誌</h2>
        <div class="project-card project-log-card">
          <div class="project-log prose">${bodyHtml || '<p class="small">目前尚無進度紀錄。</p>'}</div>
        </div>
      </section>
      ${galleryBlock}
      ${resourcesBlock}
    </div>
  </main>
  <div class="project-lightbox" id="projectLightbox" aria-hidden="true">
    <button type="button" id="projectLightboxPrev" class="project-lightbox-nav prev" aria-label="上一張">‹</button>
    <button type="button" id="projectLightboxNext" class="project-lightbox-nav next" aria-label="下一張">›</button>
    <button type="button" id="projectLightboxClose" aria-label="關閉">×</button>
    <img id="projectLightboxImage" src="" alt="" />
    <p id="projectLightboxCaption" class="project-lightbox-caption"></p>
  </div>
  <div id="site-footer-placeholder"></div>
  <script src="${assetPrefix}assets/js/include-components.js" defer></script>
  <script src="${assetPrefix}assets/js/main.js" defer></script>
  <script>
    (function() {
      var gallery = document.getElementById('projectMosaic');
      var lightbox = document.getElementById('projectLightbox');
      var lightboxImg = document.getElementById('projectLightboxImage');
      var closeBtn = document.getElementById('projectLightboxClose');
      var prevBtn = document.getElementById('projectLightboxPrev');
      var nextBtn = document.getElementById('projectLightboxNext');
      var caption = document.getElementById('projectLightboxCaption');
      if (!gallery || !lightbox || !lightboxImg || !closeBtn || !prevBtn || !nextBtn || !caption) return;
      var imgs = Array.prototype.slice.call(gallery.querySelectorAll('img'));
      var currentIndex = 0;

      function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
      }

      function openAt(index) {
        if (!imgs.length) return;
        currentIndex = (index + imgs.length) % imgs.length;
        var img = imgs[currentIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '精選照片';
        caption.textContent = img.title || img.alt || '';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
      }

      imgs.forEach(function(img, index) {
        img.addEventListener('click', function() {
          openAt(index);
        });
      });

      closeBtn.addEventListener('click', closeLightbox);
      prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openAt(currentIndex - 1);
      });
      nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openAt(currentIndex + 1);
      });
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
      });
      document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') openAt(currentIndex - 1);
        if (e.key === 'ArrowRight') openAt(currentIndex + 1);
      });
    })();
  </script>
</body>
</html>`;
}

function buildLegacyRedirectHtml(p) {
  const slug = escapeHtml(p.slug);
  const title = escapeHtml(p.school || p.title || '客戶專屬頁面');
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}｜頁面搬移中</title>
  <meta http-equiv="refresh" content="0; url=./${slug}/" />
  <link rel="canonical" href="./${slug}/" />
  <meta name="robots" content="noindex, nofollow" />
  <script>
    location.replace('./${slug}/');
  </script>
</head>
<body>
  <p>頁面已移動，正在前往 <a href="./${slug}/">./${slug}/</a> ...</p>
</body>
</html>`;
}

function main() {
  ensureDir(PROJECTS_DIR);
  const files = listMarkdown(CONTENT_DIR);
  const projects = files.map(parseProject);
  const indexData = buildIndex(projects);

  fs.writeFileSync(
    path.join(PROJECTS_DIR, 'projects-index.json'),
    JSON.stringify(indexData, null, 2),
    'utf8'
  );
  console.log('已寫入 projects/projects-index.json，共', projects.length, '所學校');

  projects.forEach((p) => {
    const slugDir = path.join(PROJECTS_DIR, p.slug);
    ensureDir(slugDir);
    const projectImageDir = path.join(slugDir, 'images');
    ensureDir(projectImageDir);

    // 將舊資產目錄中的照片移動到專案資料夾 images 子目錄
    const legacyDir = path.join(LEGACY_PROJECT_IMAGES_DIR, p.slug);
    const legacyImages = listImageFiles(legacyDir);
    legacyImages.forEach((filename) => {
      const src = path.join(legacyDir, filename);
      const dest = path.join(projectImageDir, filename);
      if (!fs.existsSync(dest)) moveFileSafe(src, dest);
    });
    if (fs.existsSync(legacyDir) && listImageFiles(legacyDir).length === 0) {
      try { fs.rmdirSync(legacyDir); } catch (e) {}
    }
    const rootImages = listImageFiles(slugDir);
    rootImages.forEach((filename) => {
      const src = path.join(slugDir, filename);
      const dest = path.join(projectImageDir, filename);
      if (!fs.existsSync(dest)) moveFileSafe(src, dest);
    });

    const html = buildDetailHtml(p, {
      assetPrefix: '../../',
      guardEntryHref: '../index.html',
    });
    fs.writeFileSync(path.join(slugDir, 'index.html'), html, 'utf8');
    const legacyHtml = path.join(PROJECTS_DIR, p.slug + '.html');
    fs.writeFileSync(legacyHtml, buildLegacyRedirectHtml(p), 'utf8');
    console.log('  生成', p.slug + '/index.html', '與', p.slug + '.html(redirect)');
  });
  console.log('建置完成。');
}

main();
