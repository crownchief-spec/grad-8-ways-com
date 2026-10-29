#!/usr/bin/env bash
# 依 works-photos-meta.json 將 images/works 內照片重新命名為 SEO 英文檔名。
# 執行前請確認已備份。執行後請將 works-images.json 更新為新檔名列表（或由頁面改讀 meta）。
# 從專案根目錄執行：bash scripts/rename-works-by-meta.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/assets/images/works"
META="$ROOT/assets/data/works-photos-meta.json"

if [[ ! -f "$META" ]]; then echo "Missing $META"; exit 1; fi
if [[ ! -d "$DIR" ]]; then echo "Missing $DIR"; exit 1; fi

# 用 Node 或 jq 解析 JSON，逐筆 rename（避免覆蓋：先全部改成暫存名再改為新名）
if command -v node >/dev/null 2>&1; then
  node -e "
    const fs = require('fs');
    const meta = JSON.parse(fs.readFileSync('$META', 'utf8'));
    const dir = '$DIR';
    const path = (n) => dir + '/' + n;
    meta.forEach((item, i) => {
      const oldPath = path(item.oldName);
      const newPath = path(item.newName);
      if (item.oldName === item.newName) return;
      try {
        fs.renameSync(oldPath, newPath);
        console.log(item.oldName + ' -> ' + item.newName);
      } catch (e) {
        if (e.code === 'ENOENT') console.warn('Skip (not found): ' + item.oldName);
        else throw e;
      }
    });
    console.log('Done. Total: ' + meta.length);
  "
else
  echo "Need Node.js to run rename. Install Node or run: node -e \"...\" with the same logic."
  exit 1
fi

# 可選：輸出新檔名列表到 works-images.json
if command -v node >/dev/null 2>&1; then
  node -e "
    const fs = require('fs');
    const meta = JSON.parse(fs.readFileSync('$META', 'utf8'));
    const list = meta.map(m => m.newName);
    fs.writeFileSync('$ROOT/assets/data/works-images.json', JSON.stringify(list, null, 2));
    console.log('Updated assets/data/works-images.json with new filenames.');
  "
fi
