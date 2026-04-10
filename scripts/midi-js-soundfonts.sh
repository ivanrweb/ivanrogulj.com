#!/usr/bin/env bash
# Downloads instrument samples from gleitz/midi-js-soundfonts
#
# Usage:
#   ./scripts/midi-js-soundfonts.sh --artist <artist> --pack <pack> --key <key> [--start 21] [--end 108]
#
# --artist   One of: FatBoy | FluidR3_GM | MusyngKite
# --pack     GM instrument folder name, e.g. electric_piano_1
# --key      Local output folder name, e.g. rhodes (saved to assets/samples/<key>)
# --start    First MIDI note to download (default: 21)
# --end      Last  MIDI note to download (default: 108)
#
# Examples:
#   ./scripts/midi-js-soundfonts.sh --artist FluidR3_GM --pack electric_piano_1 --key rhodes
#   ./scripts/midi-js-soundfonts.sh --artist MusyngKite  --pack acoustic_grand_piano --key piano-mk --start 33 --end 108
#   ./scripts/midi-js-soundfonts.sh --artist FatBoy      --pack violin --key violin

set -e

ASSETS="apps/frontend/src/assets/samples"
ARTIST=""
PACK=""
KEY=""
START=21
END=108

usage() {
  echo "Usage: $0 --artist <FatBoy|FluidR3_GM|MusyngKite> --pack <gm-instrument> --key <local-name> [--start 21] [--end 108]"
  echo ""
  echo "Examples:"
  echo "  $0 --artist FluidR3_GM  --pack electric_piano_1      --key rhodes"
  echo "  $0 --artist MusyngKite  --pack acoustic_grand_piano   --key piano-mk --start 33 --end 108"
  echo "  $0 --artist FatBoy      --pack violin                 --key violin"
  exit 1
}

# Parse named args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --artist) ARTIST="$2"; shift 2 ;;
    --pack)   PACK="$2";   shift 2 ;;
    --key)    KEY="$2";    shift 2 ;;
    --start)  START="$2";  shift 2 ;;
    --end)    END="$2";    shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown argument: $1"; usage ;;
  esac
done

# Validate required args
if [[ -z "$ARTIST" || -z "$PACK" || -z "$KEY" ]]; then
  echo "Error: --artist, --pack, and --key are all required."
  echo ""
  usage
fi

# Validate artist
case "$ARTIST" in
  FatBoy|FluidR3_GM|MusyngKite) ;;
  *) echo "Error: --artist must be one of: FatBoy, FluidR3_GM, MusyngKite (got: $ARTIST)"; exit 1 ;;
esac

BASE_URL="https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/${ARTIST}"

midi_to_flat() {
  local midi=$1
  local names=("C" "Db" "D" "Eb" "E" "F" "Gb" "G" "Ab" "A" "Bb" "B")
  local idx=$(( midi % 12 ))
  local octave=$(( midi / 12 - 1 ))
  echo "${names[$idx]}${octave}"
}

out_dir="$ASSETS/$KEY"
mkdir -p "$out_dir"

echo "=== Downloading: $KEY ==="
echo "    Artist : $ARTIST"
echo "    Pack   : $PACK"
echo "    URL    : ${BASE_URL}/${PACK}-mp3/"
echo "    Output : $out_dir"
echo "    Range  : MIDI $START – $END"
echo ""

count=0
for midi in $(seq "$START" "$END"); do
  name=$(midi_to_flat "$midi")
  out="$out_dir/${name}.mp3"
  [ -f "$out" ] && continue
  if curl -sf -o "$out" "${BASE_URL}/${PACK}-mp3/${name}.mp3"; then
    echo "  [ok]   ${name}.mp3"
    count=$((count + 1))
  else
    echo "  [miss] ${name}.mp3"
  fi
done

echo ""
echo "Done. Downloaded $count new files to $out_dir"
