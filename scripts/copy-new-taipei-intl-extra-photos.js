/**
 * Add 6 photos to new-taipei-international-kindergarten.
 * Resize with sips, SEO naming: 新北市國際幼兒園畢業照-自然生動-活潑-44.jpg .. 49.jpg
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(process.env.HOME || '', '.cursor/projects/Users-benson-Documents-grad-8-ways-com/assets');
const DEST = path.join(__dirname, '../assets/images/works/new-taipei-international-kindergarten');
const MAX_SIZE = 1600;

const FILES = [
  '2025-02-27-11-02-56-DSC_0724-51efac19-8814-428e-ad2e-26a1bb70ae17.png',
  '2025-02-27-13-44-22-DSC_3294-4eb48cf4-168d-41f7-8036-6296f4208397.png',
  '2025-02-27-13-55-48-DSC_3498-fb1d2395-1f41-45e0-9823-e9e56adc0586.png',
  '2025-02-27-09-30-40-DSC_8598-d371a585-e59a-48f1-b4e8-af9861b68641.png',
  '2025-02-27-14-00-29-DSC_3558-4e92f77f-15ed-4668-b293-fe93b069a657.png',
  '2025-02-27-11-39-45-DSC_1531-e8cd4ccd-40ac-479f-930d-925e494b9b1f.png',
];

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

for (let i = 0; i < FILES.length; i++) {
  const srcPath = path.join(SRC, FILES[i]);
  const num = 44 + i;
  const destName = `新北市國際幼兒園畢業照-自然生動-活潑-${num}.jpg`;
  const destPath = path.join(DEST, destName);
  if (!fs.existsSync(srcPath)) {
    console.warn('Skip (not found):', FILES[i]);
    continue;
  }
  fs.copyFileSync(srcPath, destPath);
  try {
    execSync(`sips -s format jpeg -Z ${MAX_SIZE} "${destPath}"`, { stdio: 'ignore' });
  } catch (e) {
    console.warn('sips failed for', destName, e.message);
  }
  console.log(num, destName);
}
console.log('Done. Total:', FILES.length);
