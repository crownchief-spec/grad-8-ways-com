#!/usr/bin/env python3
"""
依 works-photos-meta.json 將 assets/images/works 內原圖檔名改為與縮圖相同的 SEO 英文名稱。
從專案根目錄執行：python3 scripts/rename_works_by_meta.py
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
WORKS_DIR = ROOT / "assets" / "images" / "works"
META_PATH = ROOT / "assets" / "data" / "works-photos-meta.json"
IMAGES_JSON = ROOT / "assets" / "data" / "works-images.json"


def main():
    if not META_PATH.exists():
        print("Missing:", META_PATH)
        raise SystemExit(1)
    if not WORKS_DIR.exists():
        print("Missing:", WORKS_DIR)
        raise SystemExit(1)

    with open(META_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)

    done = 0
    skipped = 0
    for item in meta:
        old_name = item["oldName"]
        new_name = item["newName"]
        if old_name == new_name:
            skipped += 1
            continue
        old_path = WORKS_DIR / old_name
        new_path = WORKS_DIR / new_name
        if not old_path.is_file():
            print("Skip (not found):", old_name)
            skipped += 1
            continue
        try:
            old_path.rename(new_path)
            print(old_name, "->", new_name)
            done += 1
        except Exception as e:
            print("Error", old_name, e)

    names = [item["newName"] for item in meta]
    IMAGES_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(IMAGES_JSON, "w", encoding="utf-8") as f:
        json.dump(names, f, ensure_ascii=False, indent=2)
    print("Done. Renamed:", done, "Skipped:", skipped, "Total:", len(meta))
    print("Updated", IMAGES_JSON)


if __name__ == "__main__":
    main()
