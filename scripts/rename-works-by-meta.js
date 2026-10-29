#!/usr/bin/env node
/**
 * 依 works-photos-meta.json 將 images/works 內照片重新命名為 SEO 英文檔名。
 * 從專案根目錄執行：node scripts/rename-works-by-meta.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'assets/images/works');
const META_PATH = path.join(ROOT, 'assets/data/works-photos-meta.json');
const IMAGES_JSON = path.join(ROOT, 'assets/data/works-images.json');

if (!fs.existsSync(META_PATH)) {
  console.error('Missing:', META_PATH);
  process.exit(1);
}
if (!fs.existsSync(DIR)) {
  console.error('Missing:', DIR);
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
let done = 0;
let skipped = 0;

meta.forEach((item) => {
  const oldPath = path.join(DIR, item.oldName);
  const newPath = path.join(DIR, item.newName);
  if (item.oldName === item.newName) {
    skipped++;
    return;
  }
  try {
    fs.renameSync(oldPath, newPath);
    console.log(item.oldName, '->', item.newName);
    done++;
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.warn('Skip (not found):', item.oldName);
      skipped++;
    } else {
      throw e;
    }
  }
});

const list = meta.map((m) => m.newName);
fs.writeFileSync(IMAGES_JSON, JSON.stringify(list, null, 2));
console.log('Done. Renamed:', done, 'Skipped:', skipped, 'Total:', meta.length);
console.log('Updated', IMAGES_JSON);
console.log('');
console.log('完成後請將 assets/js/main.js 中 img 的 filename 改為 item.newName，以使用新檔名載入圖片。');
