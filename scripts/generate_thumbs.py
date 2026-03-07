#!/usr/bin/env python3
"""
掃描作品照片資料夾，產生 SEO 友善檔名的縮圖。
- 縮圖輸出至 assets/images/works/thumbs/
- 檔名：若有 works-photos-meta.json 則使用 newName，否則將原檔名之空格/底線轉為連字號。
從專案根目錄執行：python3 scripts/generate_thumbs.py
"""
from pathlib import Path
import re
import json

try:
    from PIL import Image
except ImportError:
    print("請先安裝 Pillow：pip install Pillow")
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parent.parent
WORKS_DIR = ROOT / "assets" / "images" / "works"
THUMBS_DIR = WORKS_DIR / "thumbs"
META_PATH = ROOT / "assets" / "data" / "works-photos-meta.json"
THUMB_MAX = 400  # 縮圖最長邊像素

def seo_filename(name: str) -> str:
    """將檔名轉為 SEO 友善格式：空格與底線改為連字號、小寫。"""
    base, ext = name.rsplit(".", 1) if "." in name else (name, "")
    base = re.sub(r"[\s_]+", "-", base).strip("-").lower()
    return f"{base}.{ext}" if ext else base

def main():
    THUMBS_DIR.mkdir(parents=True, exist_ok=True)
    meta_by_old = {}
    if META_PATH.exists():
        with open(META_PATH, "r", encoding="utf-8") as f:
            for item in json.load(f):
                meta_by_old[item["oldName"]] = item.get("newName") or item["oldName"]

    images = [f for f in WORKS_DIR.iterdir() if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
    count = 0
    for path in sorted(images):
        if path.name.startswith(".") or path.parent == THUMBS_DIR:
            continue
        out_name = meta_by_old.get(path.name) or seo_filename(path.name)
        out_name = Path(out_name).stem + ".jpg"
        out_path = THUMBS_DIR / out_name
        if out_path == path:
            continue
        try:
            img = Image.open(path).convert("RGB")
            w, h = img.size
            if max(w, h) <= THUMB_MAX:
                img.save(out_path, "JPEG", quality=88, optimize=True)
            else:
                if w >= h:
                    nw, nh = THUMB_MAX, max(1, int(h * THUMB_MAX / w))
                else:
                    nw, nh = max(1, int(w * THUMB_MAX / h)), THUMB_MAX
                img = img.resize((nw, nh), Image.Resampling.LANCZOS)
                img.save(out_path, "JPEG", quality=88, optimize=True)
            count += 1
            print(path.name, "->", out_name)
        except Exception as e:
            print("Skip", path.name, e)
    print("Done. Generated", count, "thumbnails in", THUMBS_DIR)

if __name__ == "__main__":
    main()
