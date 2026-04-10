#!/usr/bin/env bash
# Downloads FluidR3_GM instrument samples from gleitz/midi-js-soundfonts
# Run from repo root:  ./scripts/download-instrument-samples.sh
# Or single instrument: ./scripts/download-instrument-samples.sh rhodes

set -e

BASE_URL="https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM"
PIANO_URL="https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/piano"
ASSETS="apps/frontend/src/assets/samples"

midi_to_flat() {
  local midi=$1
  local names=("C" "Db" "D" "Eb" "E" "F" "Gb" "G" "Ab" "A" "Bb" "B")
  local idx=$(( midi % 12 ))
  local octave=$(( midi / 12 - 1 ))
  echo "${names[$idx]}${octave}"
}

midi_to_sharp() {
  local midi=$1
  local names=("C" "Cs" "D" "Ds" "E" "F" "Fs" "G" "Gs" "A" "As" "B")
  local idx=$(( midi % 12 ))
  local octave=$(( midi / 12 - 1 ))
  echo "${names[$idx]}${octave}"
}

download_fluidr3() {
  local key=$1 folder=$2 start=$3 end=$4
  local out_dir="$ASSETS/$key"
  mkdir -p "$out_dir"
  echo "=== $key ($folder) ==="
  local count=0
  for midi in $(seq "$start" "$end"); do
    local name; name=$(midi_to_flat "$midi")
    local out="$out_dir/${name}.mp3"
    [ -f "$out" ] && continue
    if curl -sf -o "$out" "${BASE_URL}/${folder}-mp3/${name}.mp3"; then
      echo "  [ok]   ${name}.mp3"
      count=$((count + 1))
    else
      echo "  [miss] ${name}.mp3"
    fi
  done
  echo "  Downloaded $count new files"
  echo ""
}

download_piano() {
  local out_dir="$ASSETS/piano"
  mkdir -p "$out_dir"
  echo "=== piano (Grand Piano OGG) ==="
  local count=0
  for midi in $(seq 33 108); do
    local name; name=$(midi_to_sharp "$midi")
    local out="$out_dir/${name}.ogg"
    [ -f "$out" ] && continue
    if curl -sf -o "$out" "${PIANO_URL}/${name}.ogg"; then
      echo "  [ok]   ${name}.ogg"
      count=$((count + 1))
    else
      echo "  [miss] ${name}.ogg"
    fi
  done
  echo "  Downloaded $count new files"
  echo ""
}

run_all() {
  download_fluidr3 "rhodes"     "electric_piano_1" 21 108
  download_fluidr3 "wurlitzer"  "electric_piano_2" 21 108
  download_fluidr3 "hammond"    "drawbar_organ"    21 108
  download_fluidr3 "synth-lead" "lead_2_sawtooth"  21 108
  download_fluidr3 "polysynth"  "pad_3_polysynth"  21 108
  download_piano
  echo "All done."
}

case "${1:-all}" in
  all)        run_all ;;
  piano)      download_piano ;;
  rhodes)     download_fluidr3 "rhodes"     "electric_piano_1" 21 108 ;;
  wurlitzer)  download_fluidr3 "wurlitzer"  "electric_piano_2" 21 108 ;;
  hammond)    download_fluidr3 "hammond"    "drawbar_organ"    21 108 ;;
  synth-lead) download_fluidr3 "synth-lead" "lead_2_sawtooth"  21 108 ;;
  polysynth)  download_fluidr3 "polysynth"  "pad_3_polysynth"  21 108 ;;
  *) echo "Unknown: $1. Options: all, piano, rhodes, wurlitzer, hammond, synth-lead, polysynth" ;;
esac
