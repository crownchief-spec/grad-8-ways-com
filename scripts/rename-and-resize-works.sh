#!/usr/bin/env bash
# Resize images in images/works and rename to SEO-friendly: graduation-works-001.jpg ...
# Outputs list to assets/data/works-images.json for the works page.
# Run from project root: bash scripts/rename-and-resize-works.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/assets/images/works"
OUT_JSON="$ROOT/assets/data/works-images.json"
MAX_WIDTH=1200

cd "$ROOT"
if [[ ! -d "$DIR" ]]; then echo "Missing $DIR"; exit 1; fi
mkdir -p "$(dirname "$OUT_JSON")"

# Collect all jpg/JPG, sort for deterministic order
list=()
while IFS= read -r -d '' f; do
  list+=("$f")
done < <(find "$DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -print0 | sort -z)

total=${#list[@]}
echo "Found $total images. Resizing (max ${MAX_WIDTH}px) and renaming..."

# Resize and rename to graduation-works-001.jpg, ...
renamed=()
i=1
for f in "${list[@]}"; do
  base="$(basename "$f")"
  ext=".jpg"
  newname="graduation-works-$(printf "%03d" "$i")${ext}"
  if command -v sips >/dev/null 2>&1; then
    sips -Z $MAX_WIDTH "$f" 2>/dev/null || true
  fi
  if [[ "$base" != "$newname" ]]; then
    mv -n "$f" "$DIR/$newname" 2>/dev/null || true
  fi
  renamed+=("$newname")
  i=$((i+1))
done

# Write JSON array for works page
if command -v jq >/dev/null 2>&1; then
  printf '%s\n' "${renamed[@]}" | jq -R . | jq -s . > "$OUT_JSON"
else
  echo "[" > "$OUT_JSON"
  for i in "${!renamed[@]}"; do
    [[ $i -gt 0 ]] && echo -n "," >> "$OUT_JSON"
    echo -n "\"${renamed[$i]}\"" >> "$OUT_JSON"
  done
  echo "" >> "$OUT_JSON"
  echo "]" >> "$OUT_JSON"
fi
echo "Written $total filenames to $OUT_JSON"
echo "Done."
