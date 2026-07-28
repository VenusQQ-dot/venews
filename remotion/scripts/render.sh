#!/usr/bin/env bash
# Render the deck to out/deck.mp4.
#
# On a normal machine, `npx remotion render AnthropicDeck out/deck.mp4` is enough.
# In constrained/sandboxed environments Remotion's internal static-file server can
# stall a font fetch when it recycles a browser page mid-render, failing the whole
# job. This script sidesteps that by rendering in short frame segments (each loads
# fonts once, no recycle) and concatenating them — every segment renders cleanly.
#
# Optional: set REMOTION_CHROME_EXECUTABLE to a headless-shell binary if the
# bundled Chromium download is blocked.
set -euo pipefail
cd "$(dirname "$0")/.."

COMP=AnthropicDeck
STEP=400
BROWSER_ARG=()
[ -n "${REMOTION_CHROME_EXECUTABLE:-}" ] && BROWSER_ARG=(--browser-executable="$REMOTION_CHROME_EXECUTABLE")

TOTAL=$(npx remotion compositions --quiet 2>/dev/null | awk -v c="$COMP" '$1==c{print $2}')
: "${TOTAL:=2858}"

mkdir -p out/seg; rm -f out/seg/*.mp4 out/seg/concat.txt
i=0
for START in $(seq 0 "$STEP" $((TOTAL-1))); do
  END=$((START+STEP-1)); [ "$END" -gt $((TOTAL-1)) ] && END=$((TOTAL-1))
  OUT=$(printf "out/seg/s%02d.mp4" "$i")
  npx remotion render "$COMP" "$OUT" "${BROWSER_ARG[@]}" --frames="$START-$END" --concurrency=2
  echo "file '$(basename "$OUT")'" >> out/seg/concat.txt
  i=$((i+1))
done

npx remotion ffmpeg -f concat -safe 0 -i out/seg/concat.txt -c copy out/deck.mp4 -y
echo "Wrote out/deck.mp4"
