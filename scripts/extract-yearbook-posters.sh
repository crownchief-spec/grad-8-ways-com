#!/usr/bin/env bash
# 從畢業紀念冊影片擷取第一格畫面作為 poster，播放前可顯示首幀不黑屏
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
MEDIA="$DIR/assets/images/graduation-album"
cd "$MEDIA"
for f in *.mp4; do
  [ -f "$f" ] || continue
  out="${f%.mp4}-poster.jpg"
  if command -v ffmpeg >/dev/null 2>&1; then
    ffmpeg -y -i "$f" -vframes 1 -q:v 3 "$out" 2>/dev/null && echo "Created $out" || echo "Skip $f"
  else
    echo "ffmpeg not found, skip $f"
  fi
done
