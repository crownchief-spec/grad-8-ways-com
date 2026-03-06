/**
 * 用 Puppeteer 動態載入 iCloud 分享相簿頁面，擷取圖片 URL。
 * 使用方式：node scripts/fetch-icloud-photos.js "https://www.icloud.com/sharedalbum/#B2KJu8EH6tBkHl9"
 */

const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'https://www.icloud.com/sharedalbum/#B2KJu8EH6tBkHl9';
const outDir = path.join(__dirname, '..', 'assets', 'images');
const outListPath = path.join(__dirname, '..', 'assets', 'images', 'icloud-photos.json');

async function main() {
  let browser;
  try {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log('正在開啟:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const imageData = await page.evaluate(() => {
      const out = { urls: [], count: 0 };
      const seen = new Set();
      document.querySelectorAll('img').forEach((img) => {
        const src = (img.currentSrc || img.src || '').trim();
        if (src && !src.startsWith('data:') && !seen.has(src)) {
          seen.add(src);
          out.urls.push(src);
        }
      });
      document.querySelectorAll('[data-src], [data-url]').forEach((el) => {
        const src = el.getAttribute('data-src') || el.getAttribute('data-url') || '';
        if (src && !src.startsWith('data:') && !seen.has(src)) {
          seen.add(src);
          out.urls.push(src);
        }
      });
      out.count = out.urls.length;
      return out;
    });

    await browser.close();
    browser = null;

    if (imageData.count === 0) {
      console.log('未擷取到任何圖片。可能原因：頁面需登入、相簿為空、或圖片由其他方式載入。');
      process.exit(1);
    }

    console.log('擷取到', imageData.count, '個圖片 URL');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outListPath, JSON.stringify(imageData, null, 2), 'utf8');
    console.log('已寫入:', outListPath);
    imageData.urls.slice(0, 10).forEach((u, i) => console.log(' ', i + 1, u));
    if (imageData.urls.length > 10) console.log(' ... 共', imageData.urls.length, '張');
  } catch (err) {
    console.error(err.message || err);
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();
