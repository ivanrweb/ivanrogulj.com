#!/usr/bin/env bash
# Downloads tonejs-instruments Grand Piano OGG samples and saves them
# to apps/frontend/src/assets/samples/piano/
#
# Run from the repo root:
#   chmod +x scripts/download-piano-samples.sh
#   ./scripts/download-piano-samples.sh

set -e

BASE_URL="https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/piano"
OUTPUT_DIR="apps/frontend/src/assets/samples/piano"

mkdir -p "$OUTPUT_DIR"

NOTE_NAMES=("C" "Cs" "D" "Ds" "E" "F" "Fs" "G" "Gs" "A" "As" "B")

midi_to_name() {
  local midi=$1
  local idx=$(( midi % 12 ))
  local octave=$(( midi / 12 - 1 ))
  echo "${NOTE_NAMES[$idx]}${octave}"
}

echo "Downloading Grand Piano OGG samples (MIDI 33-108)..."
echo "Output: $OUTPUT_DIR"
echo ""

COUNT=0
for midi in $(seq 33 108); do
  NAME=$(midi_to_name "$midi")
  URL="${BASE_URL}/${NAME}.ogg"
  OUT="${OUTPUT_DIR}/${NAME}.ogg"

  if [ -f "$OUT" ]; then
    echo "  [skip] ${NAME}.ogg already exists"
    continue
  fi

  if curl -sf -o "$OUT" "$URL"; then
    echo "  [ok]   ${NAME}.ogg"
    COUNT=$((COUNT + 1))
  else
    echo "  [miss] ${NAME}.ogg (not available, will use nearest neighbour)"
  fi
done

echo ""
echo "Done. Downloaded $COUNT files to $OUTPUT_DIR"
echo ""
echo "To use local files instead of GitHub CDN, update sampler-presets.config.ts:"
echo "  assetPath: 'assets/samples/piano'"
