#!/usr/bin/env bash
# Rename hero images to SEO-friendly names (畢業照 related), then resize for web.
# Run from project root: bash scripts/rename-and-resize-hero.sh

set -e
HERO_DIR="assets/images/hero"
MAX_WIDTH=1920
BACKUP_DIR="${HERO_DIR}/original"

cd "$(dirname "$0")/.."

if [[ ! -d "$HERO_DIR" ]]; then
  echo "Missing $HERO_DIR"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# Sort by filename (date order), rename to graduation-hero-01.jpg ...
i=1
for f in "$HERO_DIR"/2024-*.jpg "$HERO_DIR"/2025-*.jpg "$HERO_DIR"/2026-*.jpg; do
  [[ -f "$f" ]] || continue
  newname="graduation-hero-$(printf '%02d' $i).jpg"
  mv "$f" "$HERO_DIR/$newname"
  echo "  -> $newname"
  i=$((i+1))
done

# 隨身碟木質2.JPG -> graduation-gift-wood-usb.jpg
for f in "$HERO_DIR"/隨身碟*.JPG "$HERO_DIR"/隨身碟*.jpg; do
  [[ -f "$f" ]] || continue
  mv "$f" "$HERO_DIR/graduation-gift-wood-usb.jpg"
  echo "  -> graduation-gift-wood-usb.jpg"
done

# Resize: max 1920px (sips on macOS)
if command -v sips >/dev/null 2>&1; then
  for f in "$HERO_DIR"/graduation-hero-*.jpg "$HERO_DIR"/graduation-gift-wood-usb.jpg; do
    [[ -f "$f" ]] || continue
    sips -Z $MAX_WIDTH "$f"
    echo "  Resized: $(basename "$f")"
  done
fi

echo "Done."
