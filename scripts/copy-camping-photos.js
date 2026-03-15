/**
 * Copy 69 family-camping-graduation photos from .cursor assets to works folder.
 * Resize with sips (macOS), rename with SEO: 露營畢業照-自然生動-活潑-NN.jpg
 * Order = user-provided list; first = page thumbnail.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(process.env.HOME || '', '.cursor/projects/Users-benson-Documents-grad-8-ways-com/assets');
const DEST = path.join(__dirname, '../assets/images/works/family-camping-graduation');
const MAX_SIZE = 1600;

const SOURCE_FILES = [
  '2025-05-03-12-16-42-DSC_5075-f14aad91-7b47-4874-8046-13c2c0ecfc8d.png',
  '2025-05-03-12-08-54-DSC_4978-fda0f965-c9d8-435e-9977-742c9dd86d67.png',
  '2025-05-03-12-30-21-DSC_5242-027c79f5-51a3-46ee-9855-1cda1292b896.png',
  '2025-05-03-14-26-25-DSC_5961-079551ee-b49f-4412-9335-e9119d1b8a65.png',
  '2025-05-03-14-37-06-DSC_6078-c829d9fb-7dc7-4901-9391-e639291280c5.png',
  '2025-05-03-12-16-20-DSC_5056-e18ab683-b3d6-4602-861f-af34d3b9988d.png',
  '2025-05-03-15-09-23-DSC_6494-f7ce85ea-0608-40cd-a62f-51cfa2b2198e.png',
  '2025-05-03-14-46-52-DSC_6219-984999fe-0363-4e65-b52b-53fc5592d0e0.png',
  '2025-05-03-11-34-45-DSC_4831-bec90e8c-c5d4-495b-b306-d584babe9777.png',
  '2025-05-03-12-09-57-DSC_5004-5b8864f6-9946-422a-a9f6-8c5e772a0541.png',
  '2025-05-03-15-14-35-DSC_6587-f5ef1007-5c7b-46a8-9d55-f68d4da81e9e.png',
  '2025-05-03-12-10-14-DSC_5012-fac43ce0-2cbc-4476-8dda-2c43a262c771.png',
  '2025-05-03-15-48-56-DSC_7063-07fb85f7-78d3-4d60-9abe-05bff6904e7f.png',
  '2025-05-03-12-17-33-DSC_5108-a7b28cbb-d74d-4156-80b6-91705d20b738.png',
  '2025-05-03-12-30-09-DSC_5218-4f38b96a-2c91-403a-b2e2-517d615115f3.png',
  '2025-05-03-12-22-02-DSC_5165-6d41896e-94fa-48f9-be0b-5de66487ca75.png',
  '2025-05-03-12-30-23-DSC_5245-c0a0ab6a-49d7-47e7-9fb9-e8f302d202f5.png',
  '2025-05-03-13-28-51-DSC_5350-df2f9ceb-c508-41dd-9766-72841a94ae5f.png',
  '2025-05-03-13-34-41-DSC_5398-1c653c24-f87f-443e-99d6-37077acea1ba.png',
  '2025-05-03-13-18-07-DSC_5293-a6b3a355-6ae6-47e5-bbd3-d41d11bfd1f4.png',
  '2025-05-03-13-39-03-DSC_5440-dcfbdc15-c805-4a04-b151-eea3c67d7202.png',
  '2025-05-03-12-22-15-DSC_5179-259a58dd-5dd1-40b9-9d82-73314d5ec94c.png',
  '2025-05-03-13-39-44-DSC_5456-c4ffdb80-ee64-43a7-972d-9c1e8140cb5c.png',
  '2025-05-03-13-46-44-DSC_5544-d24d7a06-7757-42c6-bb07-6646d1113030.png',
  '2025-05-03-14-01-36-DSC_5594-de872f69-283e-48ef-9efd-413d8f5ed0ef.png',
  '2025-05-03-14-18-40-DSC_5800-6182e1af-7606-4d48-955a-5136b059d258.png',
  '2025-05-03-14-21-59-DSC_5851-0f17d8ee-c0a6-4eaa-911f-e359dc2e385e.png',
  '2025-05-03-14-27-16-DSC_5980-d15bc4fd-6b20-4e0f-a573-23e79f9b9501.png',
  '2025-05-03-14-29-40-DSC_6018-924b37a4-57e9-4c49-9358-b8bcfa038565.png',
  '2025-05-03-14-39-06-DSC_6118-154f11f5-cbdb-4343-8b0f-5e67f616cef4.png',
  '2025-05-03-14-59-40-DSC_6331-6192acbc-1354-4ea5-a7cf-e8ad08994dfd.png',
  '2025-05-03-14-37-29-DSC_6086-c7328b4d-f2f4-45ff-87f8-4a737b3a676d.png',
  '2025-05-03-15-02-06-DSC_6348-294f998f-5de4-4b11-99cd-7c042968f1db.png',
  '2025-05-03-15-04-43-DSC_6429-6794109f-7b6f-47e0-8687-33d958b04be9.png',
  '2025-05-03-15-04-24-DSC_6420-80941554-5353-4ecc-b9bc-99397bdc7c72.png',
  '2025-05-03-15-11-04-DSC_6540-bcda0454-bcd8-4f10-b426-373607701e53.png',
  '2025-05-03-15-06-48-DSC_6477-6084cd49-614c-48e0-9737-b5084bae6354.png',
  '2025-05-03-15-12-41-DSC_6569-48d2f3fe-d1d2-4df5-a607-bcca36cca5bc.png',
  '2025-05-03-14-59-40-DSC_6331-6192acbc-1354-4ea5-a7cf-e8ad08994dfd.png',
  '2025-05-03-15-22-59-DSC_6708-fdd75389-9990-4313-9b25-ac8881115189.png',
  '2025-05-03-13-31-43-DSC_5371-dec222a6-a2c6-4d04-b301-9ffa8b68ee5c.png',
  '2025-05-03-14-04-44-DSC_5628-914d3eb0-2708-4257-b7e3-1ae86e3e3a88.png',
  '2025-05-03-13-36-38-DSC_5422-4d5bce1b-7ad8-4883-9a8b-e439613379b0.png',
  '2025-05-03-14-19-47-DSC_5825-bbf2a7a9-1907-4d2c-8fb9-a5f042fb630a.png',
  '2025-05-03-14-24-45-DSC_5923-34aefcc4-2287-4a9b-8163-5d7fe9b8958f.png',
  '2025-05-03-14-23-04-DSC_5889-1af2c6cb-2ab1-49b5-8305-514f3886b0fc.png',
  '2025-05-03-14-49-46-DSC_6248-d04a2cd6-1fe1-45ff-bb37-e68977751d0b.png',
  '2025-05-03-15-24-47-DSC_6724-b7bd57d6-caba-4637-83c4-75342b29d11c.png',
  '2025-05-03-15-07-00-DSC_6489-f6968581-d306-45f2-bdda-3e038bdb13a2.png',
  '2025-05-03-15-28-58-DSC_6794-8e846c8d-d088-4de1-9108-69ee4c5d2c61.png',
  '2025-05-03-15-28-23-DSC_6779-126f01fe-da59-45fc-b7d5-237af5cf22c2.png',
  '2025-05-03-11-43-21-DSC_4863-5283aa86-0205-477c-b80c-8a8ca85983d0.png',
  '2025-05-03-11-46-23-DSC_4913-3fb428f7-9523-4df0-a5c2-37dee4e47dd8.png',
  '2025-05-03-12-24-26-DSC_5193-f6841dfb-bf7e-450a-bd9b-f40e553abd33.png',
  '2025-05-03-15-05-59-DSC_6446-2ee73ae5-9380-4f61-abf4-881969d0957e.png',
  '2025-05-03-15-39-02-DSC_6977-a4b92994-6e41-4419-87ba-4f87b591a7e0.png',
  '2025-05-03-13-31-43-DSC_5371-dec222a6-a2c6-4d04-b301-9ffa8b68ee5c.png',
  '2025-05-03-14-04-44-DSC_5628-914d3eb0-2708-4257-b7e3-1ae86e3e3a88.png',
  '2025-05-03-13-36-38-DSC_5422-4d5bce1b-7ad8-4883-9a8b-e439613379b0.png',
  '2025-05-03-14-19-47-DSC_5825-bbf2a7a9-1907-4d2c-8fb9-a5f042fb630a.png',
  '2025-05-03-14-24-45-DSC_5923-34aefcc4-2287-4a9b-8163-5d7fe9b8958f.png',
  '2025-05-03-14-23-04-DSC_5889-1af2c6cb-2ab1-49b5-8305-514f3886b0fc.png',
  '2025-05-03-14-49-46-DSC_6248-d04a2cd6-1fe1-45ff-bb37-e68977751d0b.png',
  '2025-05-03-15-24-47-DSC_6724-b7bd57d6-caba-4637-83c4-75342b29d11c.png',
  '2025-05-03-15-07-00-DSC_6489-f6968581-d306-45f2-bdda-3e038bdb13a2.png',
  '2025-05-03-15-28-58-DSC_6794-8e846c8d-d088-4de1-9108-69ee4c5d2c61.png',
  '2025-05-03-15-28-23-DSC_6779-126f01fe-da59-45fc-b7d5-237af5cf22c2.png',
  '2025-05-03-15-30-35-DSC_6813-baa16e24-e629-4c2d-b78f-9d3855a9d33a.png',
  '2025-05-03-15-10-27-DSC_6525-ce647dfc-7ed9-45ba-b560-e382825f5181.png',
  '2025-05-03-15-20-06-DSC_6673-e64bd7dc-03e3-4228-ade0-8c9de62e75a7.png',
  '2025-05-03-15-51-15-DSC_7139-a81df171-56b6-4f87-bbb2-d2c5fa017b2e.png',
  '2025-05-03-16-44-49-DSC_7336-8fb77fc9-031f-404d-b4d4-9ea1c705dd36.png',
  '2025-05-03-15-52-34-DSC_7178-41091d74-3908-43d6-8c66-03a2c9ef8977.png',
  '2025-05-03-16-50-49-DSC_7409-d4fad1bc-5df3-41fa-a808-671f1569cf3f.png',
  '2025-05-03-16-50-03-DSC_7398-efa50538-ef64-4898-bf45-469b3b4431f1.png',
  '2025-05-03-17-29-02-DSC_7536-402f8b9b-168c-454f-8bb7-b8d393c394f4.png',
  '2025-05-03-17-33-23-DSC_7556-ed80a2e3-3088-43d2-abad-d9af2e882bba.png',
  '2025-05-03-12-02-12-DSC_4938-1d132ec3-c2c7-4c50-bda0-244d62355605.png',
  '2025-05-03-15-38-26-DSC_6953-bd553a80-87c7-4ce6-adb5-276447820367.png',
];

const FILES = SOURCE_FILES.slice(0, 69);

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

const altTemplates = [
  '家庭旅遊聯誼 露營畢業照 自然生動 活潑',
  '幼兒園畢業照 露營 家庭 旅遊',
  '露營畢業照 草地帳篷 自然互動',
  '幼兒園畢業照 師生合照 家庭合照',
  '畢業照 露營區 空拍 自然生動',
];

for (let i = 0; i < FILES.length; i++) {
  const srcPath = path.join(SRC, FILES[i]);
  const num = String(i + 1).padStart(2, '0');
  const destName = `露營畢業照-自然生動-活潑-${num}.jpg`;
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

// Output gallery order (random) for HTML
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const indices = shuffle(Array.from({ length: 69 }, (_, i) => i + 1));
fs.writeFileSync(
  path.join(__dirname, '../scripts/camping-gallery-order.json'),
  JSON.stringify({ cover: '露營畢業照-自然生動-活潑-01.jpg', order: indices }, null, 2)
);
console.log('Gallery order (random) saved to scripts/camping-gallery-order.json');
