/**
 * Copy 34 日式老建築外景畢業照 to works folder.
 * Cover: 2025-02-20-08-32-41-DSC_0458 -> 01, rest shuffled -> 02..34
 * Resize with sips, rename: 畢業照-自然生動-活潑-NN.jpg
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(process.env.HOME || '', '.cursor/projects/Users-benson-Documents-grad-8-ways-com/assets');
const DEST = path.join(__dirname, '../assets/images/works/japanese-old-building-outdoor');
const MAX_SIZE = 1600;

const COVER_FILE = '2025-02-20-08-32-41-DSC_0458-116fc6a2-d02d-4853-8b28-1ef486913e2b.png';

const OTHER_FILES = [
  '2025-02-20-10-56-16-DSC_2609-b1c55e81-10b8-4607-88f6-9bfa51cd18b8.png',
  '2025-02-20-11-16-10-DSC_3028-37acd574-ae80-4e64-a4b1-1feb122ac2b1.png',
  '2025-02-20-11-28-55-DSC_3216-3adfddb7-2d05-4c03-a277-95db731b3808.png',
  '2025-02-20-14-05-11-DSC_4674-57d59702-0b9d-4dcd-ab47-d007a8960f38.png',
  '2025-02-20-10-49-47-DSC_2452-8bda760e-334d-4a81-8d6c-c4b2147ffcc1.png',
  '2025-02-20-13-50-57-DSC_4438-64431b0a-3a8f-4913-9881-3ed7b697ddd8.png',
  '2025-02-20-09-11-11-DSC_1032-4ea3cef1-787d-44e8-a26c-8b525f55dfd5.png',
  '2025-02-20-08-35-40-DSC_0500-2b5f1a37-c968-49af-8a0e-b17f46b39a83.png',
  '2025-02-20-10-38-15-DSC_2189-d4a7401d-c611-4750-9eb6-1e7a0e188fbc.png',
  '2025-02-20-11-53-57-DSC_3839-1a641ed7-fe1c-4719-b13b-844fe19b7c1e.png',
  '2025-02-20-14-41-02-DSC_5183-1621be2e-5017-4c16-84c0-666f8f09c25e.png',
  '2025-02-20-14-18-10-DSC_4861-895fc817-216d-4eca-8052-a7a515f1343f.png',
  '2025-02-20-11-56-25-DSC_3909-7e9f55fc-fa58-4d90-adb4-b1ca99fb1796.png',
  '2025-02-20-14-20-34-DSC_4901-80bde75f-622d-469a-8797-d3e9efd08b65.png',
  '2025-02-20-10-55-04-DSC_2576-4f865abd-54e9-45ea-adb5-188b8fce7ecf.png',
  '2025-02-20-15-37-37-DSC_6034-6cbef89e-faa5-42c4-90cb-baabc0bcce39.png',
  '2025-02-20-15-09-49-DSC_5583-e1af62ec-97c4-4817-9a52-085eac312882.png',
  '2025-02-20-15-53-49-DSC_6437-b8826f3d-295f-40c1-bffa-4812e4fe159e.png',
  '2025-02-20-15-54-36-DSC_6446-53e679e0-c4e6-4dfa-876c-889188ed9ff6.png',
  '2025-02-20-16-13-50-DSC_6822-cefed440-756f-4324-90c6-6a4dee7f1145.png',
  '2025-02-20-08-41-48-DSC_0628-5131b710-31be-4acf-9c65-43936e55b6ef.png',
  '2025-02-20-09-22-46-DSC_1255-ff327574-6d3f-43a3-af2f-84956654a03a.png',
  '2025-02-20-09-57-56-DSC_1754-38949fb8-1e9d-4bc9-8a26-efa83107fc64.png',
  '2025-02-20-13-36-33-DSC_4167-766e30c3-10e4-497b-aeca-392cff71f5c3.png',
  '2025-02-20-13-45-38-DSC_4349-a38e8884-9f3c-4d61-8141-03646dacbc51.png',
  '2025-02-20-09-25-06-DSC_1315-979a463c-4915-4014-94c5-653b0f20dac7.png',
  '2025-02-20-14-19-12-DSC_4880-38038a87-b2d4-462b-a239-4d2632a47b4b.png',
  '2025-02-20-15-09-59-DSC_5590-6f5e1cc5-1dab-4694-8ceb-ed890d6f2b0d.png',
  '2025-02-20-15-24-35-DSC_5768-a8e8c739-1565-4843-9188-7f8689308016.png',
  '2025-02-20-15-35-40-DSC_5967-7d57e11a-05a8-4541-97b8-08a4a722880a.png',
  '2025-02-20-15-35-37-DSC_5957-ee8b37b1-3fbf-4d06-8c44-51af6525eba8.png',
  '2025-02-20-15-48-46-DSC_6302-d3f6b4c4-f484-4f6b-8e29-1483b9062025.png',
  '2025-02-20-15-55-14-DSC_6468-bf1c2e87-94b0-4486-a53d-93594877b23c.png',
];

// Shuffle other files for mosaic random order
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const ordered = [COVER_FILE, ...shuffle(OTHER_FILES)];

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

for (let i = 0; i < ordered.length; i++) {
  const srcPath = path.join(SRC, ordered[i]);
  const num = String(i + 1).padStart(2, '0');
  const destName = `畢業照-自然生動-活潑-${num}.jpg`;
  const destPath = path.join(DEST, destName);
  if (!fs.existsSync(srcPath)) {
    console.warn('Skip (not found):', ordered[i]);
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
console.log('Done. Total:', ordered.length);
