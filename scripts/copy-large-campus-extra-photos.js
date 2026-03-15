/**
 * Add 12 photos to large-campus-kindergarten.
 * Resize with sips, SEO naming: 大型校園幼兒園畢業照-自然生動-活潑-24.jpg .. 35.jpg
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(process.env.HOME || '', '.cursor/projects/Users-benson-Documents-grad-8-ways-com/assets');
const DEST = path.join(__dirname, '../assets/images/works/large-campus-kindergarten');
const MAX_SIZE = 1600;

const FILES = [
  '2025-03-21-09-56-03-DSC_2254-97eb5a50-c78d-46f0-9244-fb233c9284a4.png',
  '2025-03-21-10-16-16-DSC_2596-a414d70a-40a4-4fca-a5fd-dc21d10b7c9d.png',
  '2025-03-21-10-42-20-DSC_3089-9bdecdbd-c116-4240-af83-f96e5e5c4107.png',
  '2025-03-21-09-34-45-DSC_1841-1c72fffc-5234-4f3d-9e18-d7f74285cd2f.png',
  '2025-03-21-09-36-43-DSC_1892-84950b42-d556-4054-bc3f-ef85a6fb96c8.png',
  '2025-03-21-10-14-10-DSC_2513-c4a50983-1964-41aa-b526-097ce6203346.png',
  '2025-03-21-13-08-40-DSC_5222-507ec5c4-467a-4f4d-b3e1-83a7cf8103c8.png',
  '2025-03-21-10-19-58-DSC_2665-8f109cee-e759-4f49-a526-60efb7ce07a7.png',
  '2025-03-21-12-36-31-DSC_4518-7c333962-192a-4ac2-bdf5-3e285db7109b.png',
  '2025-03-21-13-21-37-DSC_5531-65a1b227-a878-4628-a390-2ecb2bbdd378.png',
  '2025-03-21-10-57-25-DSC_3157-effa7e44-254c-45e6-aa76-fedcac3f845c.png',
  '2025-03-21-12-12-54-DSC_3913-74d6f27a-e3af-43f2-9247-2c5b8c7c2763.png',
];

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

for (let i = 0; i < FILES.length; i++) {
  const srcPath = path.join(SRC, FILES[i]);
  const num = 24 + i;
  const destName = `大型校園幼兒園畢業照-自然生動-活潑-${num}.jpg`;
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
