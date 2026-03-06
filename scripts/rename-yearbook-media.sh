#!/usr/bin/env bash
# Rename graduation-yearbook media to SEO-friendly English, resize images.
# Run from project root: bash scripts/rename-yearbook-media.sh

set -e
DIR="assets/images/graduation-yearbook"
MAX_WIDTH=1200

cd "$(dirname "$0")/.."

if [[ ! -d "$DIR" ]]; then echo "Missing $DIR"; exit 1; fi

# Rename: original → new (order matters for no collision)
mv -n "$DIR/參考-畢業紀念冊編排範例0_720x480_MP4.mp4" "$DIR/graduation-yearbook-layout-sample-0.mp4" 2>/dev/null || true
mv -n "$DIR/參考-畢業紀念冊編排範例1_720x480_MP4.mp4" "$DIR/graduation-yearbook-layout-sample-1.mp4" 2>/dev/null || true
mv -n "$DIR/參考-畢業紀念冊編排範例2_720x480_MP4.mp4" "$DIR/graduation-yearbook-layout-sample-2.mp4" 2>/dev/null || true
mv -n "$DIR/參考-畢業紀念冊編排範例3_720x480_MP4.mp4" "$DIR/graduation-yearbook-layout-sample-3.mp4" 2>/dev/null || true
mv -n "$DIR/證書夾實體介紹_720x480_MP4.mp4" "$DIR/graduation-certificate-holder-intro.mp4" 2>/dev/null || true
mv -n "$DIR/證書夾實體介紹1.jpg" "$DIR/graduation-certificate-holder-1.jpg" 2>/dev/null || true
mv -n "$DIR/證書夾實體介紹2.jpg" "$DIR/graduation-certificate-holder-2.jpg" 2>/dev/null || true
mv -n "$DIR/證書夾實體介紹3.jpg" "$DIR/graduation-certificate-holder-3.jpg" 2>/dev/null || true
mv -n "$DIR/畢業紀念冊實體介紹_720x480_MP4.mp4" "$DIR/graduation-yearbook-physical-intro.mp4" 2>/dev/null || true
mv -n "$DIR/畢業紀念冊實體介紹1.jpg" "$DIR/graduation-yearbook-physical-1.jpg" 2>/dev/null || true
mv -n "$DIR/畢業紀念冊實體介紹2.jpg" "$DIR/graduation-yearbook-physical-2.jpg" 2>/dev/null || true
mv -n "$DIR/畢業紀念冊實體介紹3.jpg" "$DIR/graduation-yearbook-physical-3.jpg" 2>/dev/null || true
mv -n "$DIR/畢業照 大合照換頭_720x480_MP4.mp4" "$DIR/graduation-group-photo-head-swap.mp4" 2>/dev/null || true
mv -n "$DIR/畢業照 畢冊製作 替換照片_720x480_MP4.mp4" "$DIR/graduation-yearbook-replace-photo.mp4" 2>/dev/null || true
mv -n "$DIR/成品 木質隨身碟.jpg" "$DIR/graduation-wood-usb-product.jpg" 2>/dev/null || true

# Resize images
if command -v sips >/dev/null 2>&1; then
  for f in "$DIR"/*.jpg; do
    [[ -f "$f" ]] || continue
    sips -Z $MAX_WIDTH "$f"
    echo "Resized: $(basename "$f")"
  done
fi
echo "Done."
