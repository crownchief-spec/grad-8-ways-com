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

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
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

function renderRow(label, value) {
  if (value == null || value === '') return '';
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(String(value))}</td></tr>`;
}

function parseProject(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const slug = data.slug || path.basename(filePath, '.md');
  const project_password = data.project_password != null ? String(data.project_password).trim() : '';
  const school = data.school ? String(data.school).trim() : '';
  return {
    slug,
    project_password,
    school,
    ...data,
    body: content ? content.trim() : '',
  };
}

function buildIndex(projects) {
  const lookup = {};
  projects.forEach((p) => {
    if (p.project_password != null && String(p.project_password).trim() !== '') {
      lookup[String(p.project_password).trim()] = p.slug;
      if (p.school) lookup[String(p.school).trim()] = p.slug;
    }
  });
  return lookup;
}

function buildDetailHtml(p) {
  const bodyHtml = p.body && marked ? marked.parse(p.body, { gfm: true }) : (p.body ? `<div class="project-log">${escapeHtml(p.body).replace(/\n/g, '<br>')}</div>` : '');

  let basicRows = '';
  if (p.school) basicRows += renderRow('學校名稱', p.school);
  if (p.project_password) basicRows += renderRow('專屬密碼', p.project_password);
  if (p.contact_name) basicRows += renderRow('聯絡窗口', p.contact_name);
  if (p.contact_info) basicRows += renderRow('聯絡方式', p.contact_info);
  if (p.project_year) basicRows += renderRow('專案年份', p.project_year);
  const basicBlock = basicRows ? `<div class="project-card"><h3>基本資訊</h3><table class="project-table">${basicRows}</table></div>` : '';

  let serviceRows = '';
  if (p.service_category) serviceRows += renderRow('服務主類別', p.service_category);
  if (p.service_type) serviceRows += renderRow('服務次類別', p.service_type);
  if (p.location) serviceRows += renderRow('拍攝地點', p.location);
  if (p.shoot_date) serviceRows += renderRow('拍攝日期', p.shoot_date);
  if (p.backup_date) serviceRows += renderRow('備用日期', p.backup_date);
  if (p.student_count != null && p.student_count !== '') serviceRows += renderRow('畢業生人數', p.student_count);
  if (p.class_count != null && p.class_count !== '') serviceRows += renderRow('班級數量', p.class_count);
  const serviceBlock = serviceRows ? `<div class="project-card"><h3>服務內容</h3><table class="project-table">${serviceRows}</table></div>` : '';

  let packageRows = '';
  if (p.package_name) packageRows += renderRow('方案名稱', p.package_name);
  if (p.package_price) packageRows += renderRow('方案價格', p.package_price);
  if (p.shooting_days != null && p.shooting_days !== '') packageRows += renderRow('拍攝天數', p.shooting_days);
  if (p.shooting_items && Array.isArray(p.shooting_items) && p.shooting_items.length) {
    packageRows += `<tr><th>拍攝內容</th><td><ul>${p.shooting_items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></td></tr>`;
  }
  const packageBlock = packageRows ? `<div class="project-card"><h3>方案與價格</h3><table class="project-table">${packageRows}</table></div>` : '';

  let albumRows = '';
  if (p.has_album != null && p.has_album !== '') albumRows += renderRow('是否製作紀念冊', p.has_album === true || p.has_album === 'true' ? '是' : '否');
  if (p.album_package) albumRows += renderRow('紀念冊方案', p.album_package);
  if (p.album_size) albumRows += renderRow('尺寸', p.album_size);
  if (p.album_pages) albumRows += renderRow('頁數', p.album_pages);
  if (p.album_style) albumRows += renderRow('版型風格', p.album_style);
  if (p.proofing_required != null && p.proofing_required !== '') albumRows += renderRow('是否需要校稿', p.proofing_required === true || p.proofing_required === 'true' ? '是' : '否');
  if (p.add_on_video != null && p.add_on_video !== '') albumRows += renderRow('是否加購影片', p.add_on_video === true || p.add_on_video === 'true' ? '是' : '否');
  if (p.add_on_usb != null && p.add_on_usb !== '') albumRows += renderRow('是否加購隨身碟', p.add_on_usb === true || p.add_on_usb === 'true' ? '是' : '否');
  if (p.add_on_certificate != null && p.add_on_certificate !== '') albumRows += renderRow('是否加購證書夾', p.add_on_certificate === true || p.add_on_certificate === 'true' ? '是' : '否');
  const albumBlock = albumRows ? `<div class="project-card"><h3>紀念冊與加購資訊</h3><table class="project-table">${albumRows}</table></div>` : '';

  let specialRows = '';
  if (p.special_requests) specialRows += renderRow('特殊需求', p.special_requests);
  if (p.notes) specialRows += renderRow('其他備註', p.notes);
  const specialBlock = specialRows ? `<div class="project-card"><h3>特殊需求與備註</h3><table class="project-table">${specialRows}</table></div>` : '';

  let progressRows = '';
  if (p.current_status) progressRows += renderRow('目前狀態', p.current_status);
  if (p.current_stage) progressRows += renderRow('目前階段', p.current_stage);
  if (p.next_step) progressRows += renderRow('下一步', p.next_step);
  const progressBlock = progressRows ? `<div class="project-card"><h3>目前進度</h3><table class="project-table">${progressRows}</table></div>` : '';

  const resources = Array.isArray(p.resources) ? p.resources : [];
  const resourcesBlock = resources.length
    ? `<div class="project-card project-resources"><h3>常用連結</h3><div class="project-resource-list">${resources.map((r) => `<a class="btn primary" href="${escapeHtml(r.url || '#')}" target="_blank" rel="noopener">${escapeHtml(r.label || '連結')}</a>`).join('')}</div></div>`
    : '';

  const logBlock = p.body ? `<div class="project-card project-log-card"><h3>更新日誌</h3><div class="project-log prose">${bodyHtml}</div></div>` : '';

  const projectTitle = p.title || p.school || '客戶專屬頁面';
  const projectSubtitle = [p.service_category, p.project_year].filter(Boolean).join(' · ') || '';

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
  location.replace('index.html?required=' + encodeURIComponent(slug) + '&msg=' + encodeURIComponent('此頁面需要輸入密碼才能查看'));
})();
</script>`
    : '';

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>幼兒園畢業照攝影 畢業典禮攝影｜${escapeHtml(projectTitle)}｜小巴老師｜8-ways.com</title>
  <link rel="icon" type="image/png" href="../assets/images/logo/eightways-logo-square-gold.png" />
  <link rel="stylesheet" href="../assets/css/style.css" />
  ${noindex ? '<meta name="robots" content="noindex, nofollow" />' : ''}
</head>
<body data-project-slug="${escapeHtml(p.slug)}" data-project-protected="${isProtected ? 'true' : 'false'}">
${guardScript}
  <div id="site-header-placeholder"></div>
  <main class="subpage project-detail" id="top">
    <div class="container" style="max-width:900px">
      <header class="project-header">
        <p class="kicker">客戶專屬頁面</p>
        <h1>${escapeHtml(projectTitle)}</h1>
        ${projectSubtitle ? `<p class="project-subtitle">${escapeHtml(projectSubtitle)}專案</p>` : ''}
      </header>
      <div class="project-overview">
        ${basicBlock}
        ${serviceBlock}
        ${packageBlock}
        ${albumBlock}
        ${specialBlock}
        ${progressBlock}
        ${resourcesBlock}
        ${logBlock}
      </div>
      <div class="actions" style="margin-top:32px">
        <a class="btn ghost" href="index.html">回密碼輸入頁</a>
        <a class="btn ghost" href="../index.html">回首頁</a>
      </div>
    </div>
  </main>
  <div id="site-footer-placeholder"></div>
  <script src="../assets/js/include-components.js" defer></script>
  <script src="../assets/js/main.js" defer></script>
</body>
</html>`;
}

function main() {
  ensureDir(PROJECTS_DIR);
  const files = listMarkdown(CONTENT_DIR);
  const projects = files.map(parseProject);
  const lookup = buildIndex(projects);

  fs.writeFileSync(
    path.join(PROJECTS_DIR, 'projects-index.json'),
    JSON.stringify(lookup, null, 2),
    'utf8'
  );
  console.log('已寫入 projects/projects-index.json，共', Object.keys(lookup).length / 2, '所學校');

  projects.forEach((p) => {
    const html = buildDetailHtml(p);
    fs.writeFileSync(path.join(PROJECTS_DIR, p.slug + '.html'), html, 'utf8');
    console.log('  生成', p.slug + '.html');
  });
  console.log('建置完成。');
}

main();
