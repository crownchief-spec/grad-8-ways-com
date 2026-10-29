/**
 * Copy 45 thoughtful-setup-kindergarten photos to works folder.
 * Resize with sips, rename: 幼兒園畢業照-自然生動-活潑-NN.jpg
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(process.env.HOME || '', '.cursor/projects/Users-benson-Documents-grad-8-ways-com/assets');
const DEST = path.join(__dirname, '../assets/images/works/thoughtful-setup-kindergarten');
const MAX_SIZE = 1600;

const SOURCE_FILES = [
  '2025-03-17-15-58-43-DSC_0778-da6087e6-36f0-4685-bc46-01cedeb6d380.png',
  'IMG_0733-72a6519d-0e21-48ba-a4b3-50f8307c6b9a.png',
  '2025-03-17-11-08-28-DSC_8765-ee10ee4a-b8be-4c69-a410-c20e8ace7257.png',
  '2025-03-17-11-53-54-DSC_9061-a2af4dc0-70e9-4202-b9b2-7866c2394f3a.png',
  '2025-03-17-12-44-31-DSC_9628-b26324c8-3266-42eb-8115-f8666a4da02c.png',
  '2025-03-17-10-06-11-DSC_7853-0f9d23c5-4387-46ef-8ee0-373975edab90.png',
  '2025-03-17-14-07-24-DSC_9790-c9a5a8de-330c-456f-8a81-106d4a054e85.png',
  '2025-03-17-12-46-33-DSC_9657-7dadf492-9483-4e25-aec5-09a1fb9c36a9.png',
  '2025-03-17-14-19-28-DSC_9925-660645b6-5408-4730-8166-e0556ea5ff82.png',
  '2025-03-17-12-25-20-DSC_9423-6d1c564c-e85a-4bbf-83b9-a2b4b1c80d84.png',
  '2025-03-17-11-04-19-DSC_8695-747a7734-927a-457c-825a-8d356040db10.png',
  '2025-03-17-12-05-33-DSC_9299-701885c0-1626-4e79-b4e3-337f5a47598b.png',
  '2025-03-17-11-06-31-DSC_8720-cc0196eb-b50d-4eb7-b189-702ce6d69375.png',
  '2025-03-17-14-21-45-DSC_9952-1686f4cf-68fb-4b76-8f94-1a95a8a7e60c.png',
  '2025-03-17-14-54-04-DSC_0339-16858082-65cb-4588-b052-b952462d687e.png',
  '2025-03-17-10-02-21-DSC_7816-6ce4358b-99a5-49bb-b90a-80376a277a76.png',
  '2025-03-17-14-30-41-DSC_0067-6b3558c7-d78b-4589-9779-bead802a650a.png',
  '2025-03-17-15-29-30-DSC_0409-1d21b890-b984-4822-809a-e40ff686b945.png',
  '2025-03-17-11-55-16-DSC_9094-41d52fce-8929-4b41-9502-c0fc52566858.png',
  '2025-03-17-14-28-32-DSC_0032-cbf66cf2-abcc-4816-a37b-1b5f57c6d34e.png',
  '2025-03-17-12-54-30-DSC_9758-214fe492-5ea8-4b6f-bd25-ad14e787b233.png',
  '2025-03-17-14-11-34-DSC_9847-d45519d4-c28e-4876-bcf8-b913fc5387ae.png',
  '2025-03-17-12-00-23-DSC_9198-64a4231e-6b62-4ea8-9320-e1daf0475dc7.png',
  '2025-03-17-14-34-16-DSC_0111-f96d93a5-8ac4-419c-a1b5-03518b2a5610.png',
  '2025-03-17-15-42-13-DSC_0612-fe716670-3dd4-478c-b392-77617dc00a24.png',
  '2025-03-17-16-14-32-DSC_1033-e28e800d-d126-448b-aaea-556d3d90b7b2.png',
  '2025-03-17-16-15-48-DSC_1056-f390e1d1-aafc-4332-bc48-f610e91fff61.png',
  '2025-03-17-10-23-53-DSC_8121-17d9e7be-1921-46fd-8bd7-4b4aa4968e0c.png',
  '2025-03-17-11-15-07-DSC_8839-6e637c23-27d8-468e-a5c2-b5fd14a552ee.png',
  '2025-03-17-10-39-27-DSC_8353-ec515568-5dc3-4146-83fe-10ac5df8ae2a.png',
  '2025-03-17-10-22-26-DSC_8111-50aa94cb-660d-4bfa-9ac7-c21052e390f6.png',
  '2025-03-17-14-26-08-DSC_9998-70b03aad-e6dd-4449-b85b-92aec006fca1.png',
  '2025-03-17-15-29-19-DSC_0404-dbf42e18-a285-4245-bbb9-4568015d18b9.png',
  '2025-03-17-15-34-36-DSC_0517-6de78068-bd17-41de-974f-b09ce8bfb3a7.png',
  '2025-03-17-15-34-37-DSC_0519-a018c450-15be-4bc6-8edd-d11022b2e087.png',
  '2025-03-17-15-21-56-DSC_0367-fe2fcdc6-d509-46dd-b9a2-d9140ba8d6fd.png',
  '2025-03-17-16-06-38-DSC_0904-edb626b1-d51b-48e3-8ab0-6c86263f3213.png',
  '2025-03-17-16-12-24-DSC_0968-b863e9f9-6de7-48f2-8a57-dde9ffa271e1.png',
  '2025-03-17-15-38-55-DSC_0552-55edafff-812b-4b53-8d9f-99a7b396253d.png',
  '2025-03-17-16-15-56-DSC_1063-0554cb9d-cd18-4b40-9764-2a1fdf65a957.png',
  '2025-03-17-16-20-49-DSC_1071-7ea4b38e-4d42-4289-b4c8-e23b3507f8ee.png',
  '2025-03-17-16-36-37-DSC_1219-0147a0f3-6de8-485f-bc7c-54ad6392de6a.png',
  '2025-03-17-16-36-38-DSC_1221-ffc426c9-e8a5-4ea5-8055-e49d248df8e6.png',
  '2025-03-17-16-21-43-DSC_1107-fa329094-74a3-4d6c-9c64-5aaea5f82473.png',
  '2025-03-17-16-29-59-DSC_1188-a688f2c2-c836-437d-aa10-5a9ad54ea878.png',
];

const FILES = SOURCE_FILES.slice(0, 45);

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

for (let i = 0; i < FILES.length; i++) {
  const srcPath = path.join(SRC, FILES[i]);
  const num = String(i + 1).padStart(2, '0');
  const destName = `幼兒園畢業照-自然生動-活潑-${num}.jpg`;
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

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const indices = shuffle(Array.from({ length: 45 }, (_, i) => i + 1));
fs.writeFileSync(
  path.join(__dirname, '../scripts/thoughtful-gallery-order.json'),
  JSON.stringify({ cover: '幼兒園畢業照-自然生動-活潑-01.jpg', order: indices }, null, 2)
);
console.log('Gallery order saved to scripts/thoughtful-gallery-order.json');
