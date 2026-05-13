#!/usr/bin/env python3
import os, subprocess, base64

screenshot_path = '/Users/ivanrogulj/.claude/image-cache/3d49aa4c-bd64-4a5b-87d8-398b936081e8/14.png'
with open(screenshot_path, 'rb') as f:
    img_b64 = base64.b64encode(f.read()).decode()

HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>OHM-1 Owner's Manual</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Share+Tech+Mono&display=swap');

  * {{ box-sizing: border-box; margin: 0; padding: 0; }}

  body {{
    background: #f0ebe0;
    color: #1a1a1a;
    font-family: 'Courier New', 'Share Tech Mono', monospace;
    font-size: 9pt;
    line-height: 1.55;
  }}

  .page {{
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 13mm 22mm 13mm 22mm;
    background: #f0ebe0;
    page-break-after: always;
    position: relative;
  }}

  /* ── Cover ── */
  .cover {{ text-align: center; padding-top: 12mm; }}
  .cover-logo {{
    font-size: 52pt;
    font-weight: 900;
    letter-spacing: 12px;
    font-family: 'Courier New', monospace;
    color: #1a1a1a;
    border: 4px solid #1a1a1a;
    display: inline-block;
    padding: 6px 28px;
    margin-bottom: 6mm;
  }}
  .cover-subtitle {{
    font-size: 13pt;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 10mm;
  }}
  .cover-screenshot {{
    width: 100%;
    max-width: 145mm;
    border: 4px solid #1a1a1a;
    display: block;
    margin: 0 auto 10mm auto;
    padding: 5px;
    background: #f0ebe0;
    box-sizing: content-box;
  }}
  .cover-manual-title {{
    font-size: 18pt;
    letter-spacing: 8px;
    text-transform: uppercase;
    border-top: 3px solid #1a1a1a;
    border-bottom: 3px solid #1a1a1a;
    padding: 5px 0;
    margin-bottom: 8mm;
  }}
  .cover-footer {{
    position: absolute;
    bottom: 15mm;
    left: 22mm;
    right: 22mm;
    text-align: center;
    font-size: 8pt;
    color: #666;
    border-top: 1px solid #666;
    padding-top: 4px;
  }}
  .cover-specs {{
    font-size: 8pt;
    color: #555;
    letter-spacing: 2px;
    margin-top: 4mm;
  }}

  /* ── Section headers ── */
  .section-header {{
    background: #1a1a1a;
    color: #f0ebe0;
    font-size: 11pt;
    font-weight: bold;
    letter-spacing: 4px;
    text-transform: uppercase;
    padding: 5px 10px;
    margin-bottom: 4mm;
    margin-top: 0;
  }}

  .section-num {{
    display: inline-block;
    margin-right: 8px;
    color: #aaa;
  }}

  h2 {{
    font-size: 10pt;
    letter-spacing: 3px;
    text-transform: uppercase;
    border-bottom: 1.5px solid #1a1a1a;
    padding-bottom: 2px;
    margin: 4mm 0 2mm 0;
    font-weight: bold;
  }}

  h3 {{
    font-size: 9.5pt;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 4mm 0 2mm 0;
    font-weight: bold;
    color: #222;
  }}

  p {{ margin-bottom: 1.5mm; }}

  /* ── TOC ── */
  .toc-entry {{
    display: flex;
    align-items: baseline;
    margin-bottom: 2mm;
    font-size: 9.5pt;
  }}
  .toc-title {{ flex: 1; }}
  .toc-dots {{
    flex: 1;
    border-bottom: 1px dotted #666;
    margin: 0 4px 3px 4px;
  }}
  .toc-page {{ min-width: 16px; text-align: right; }}
  .toc-section {{
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 3mm;
  }}

  /* ── Tables ── */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 2mm 0 3mm 0;
    font-size: 8.5pt;
  }}
  th {{
    background: #1a1a1a;
    color: #f0ebe0;
    padding: 4px 8px;
    text-align: left;
    letter-spacing: 1px;
    font-size: 8pt;
  }}
  td {{
    padding: 3px 8px;
    border-bottom: 1px solid #ccc;
    vertical-align: top;
  }}
  tr:nth-child(even) td {{ background: #e8e3d8; }}

  /* ── Info boxes ── */
  .note-box {{
    border: 1px solid #888;
    background: #e8e3d8;
    padding: 2.5mm;
    margin: 2.5mm 0;
    font-size: 8pt;
  }}
  .note-box strong {{
    font-size: 7.5pt;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: block;
    margin-bottom: 2mm;
    color: #444;
  }}

  /* ── Parameter list ── */
  .param-list {{ margin: 2mm 0 4mm 0; }}
  .param-item {{
    display: grid;
    grid-template-columns: 38mm 1fr;
    gap: 2mm;
    margin-bottom: 1.5mm;
    font-size: 8.5pt;
    padding-bottom: 1.5mm;
    border-bottom: 1px dashed #ccc;
  }}
  .param-name {{
    font-weight: bold;
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    letter-spacing: 1px;
  }}

  /* ── Page number ── */
  .page-num {{
    position: absolute;
    bottom: 12mm;
    right: 22mm;
    font-size: 8pt;
    color: #666;
  }}
  .page-num-left {{
    position: absolute;
    bottom: 12mm;
    left: 22mm;
    font-size: 8pt;
    color: #666;
    letter-spacing: 2px;
  }}
  .header-line {{
    border-top: 2px solid #1a1a1a;
    border-bottom: 1px solid #888;
    padding: 3px 0 2px 0;
    margin-bottom: 8mm;
    font-size: 7.5pt;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #555;
    display: flex;
    justify-content: space-between;
  }}

  /* ── SVG diagrams ── */
  .diagram-wrap {{
    margin: 4mm 0 6mm 0;
    text-align: center;
  }}
  .diagram-caption {{
    font-size: 7.5pt;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #555;
    margin-top: 2mm;
    text-align: center;
  }}

  /* ── Waveform icons text ── */
  .waveform-row {{
    display: flex;
    gap: 6mm;
    margin: 2mm 0 4mm 0;
    align-items: center;
  }}
  .waveform-item {{
    text-align: center;
    font-size: 7.5pt;
  }}

  /* ── Two-column layout ── */
  .two-col {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    margin-bottom: 4mm;
  }}

  /* ── Midi CC table ── */
  .midi-cc-table td:first-child {{
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    font-weight: bold;
  }}

  @page {{ margin: 0; size: A4; }}

  @media print {{
    body {{ background: #f0ebe0; }}
    .page {{ margin: 0; box-shadow: none; page-break-after: always; }}
  }}
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 1: COVER                                              -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="cover">
    <div class="cover-logo">OHM-1</div>
    <div class="cover-subtitle">Polyphonic Virtual Analog Synthesizer</div>
    <img class="cover-screenshot" src="data:image/png;base64,{img_b64}" alt="OHM-1 Interface"/>
    <div class="cover-manual-title">Owner's Manual</div>
    <div class="cover-specs">
      WEB AUDIO API &nbsp;·&nbsp; MIDI-READY &nbsp;·&nbsp; IN-BROWSER &nbsp;·&nbsp; NO INSTALLATION REQUIRED
    </div>
  </div>
  <div class="cover-footer">
    © Soundionic &nbsp;·&nbsp; soundionic.com
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 2: SIGNAL FLOW                                        -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header"><span class="section-num">1</span>SIGNAL FLOW</div>

  <p>Understanding the signal flow of OHM-1 is essential for getting the most out of the synthesizer. Audio begins at the <strong>Source Module</strong> and passes through the <strong>Filter</strong>, <strong>Amplifier</strong>, and <strong>Effects Rack</strong> before reaching the output. Modulation sources (LFOs, envelopes) and triggers (MIDI, Sequencer) operate in parallel.</p>

  <div class="diagram-wrap">
    <svg viewBox="0 0 510 340" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="Courier New, monospace" font-size="8">

      <!-- Background -->
      <rect width="510" height="340" fill="#e8e3d8"/>

      <!-- ── Source boxes ── -->
      <rect x="10" y="30" width="72" height="24" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="46" y="46" text-anchor="middle" font-weight="bold">OSC 1–8</text>

      <rect x="10" y="62" width="72" height="24" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="46" y="78" text-anchor="middle" font-weight="bold">SAMPLER</text>

      <rect x="10" y="94" width="72" height="24" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="46" y="110" text-anchor="middle" font-weight="bold">NOISE GEN</text>

      <!-- source labels -->
      <text x="46" y="22" text-anchor="middle" font-size="6.5" letter-spacing="1" fill="#444">SOURCE</text>

      <!-- ── Source arrows to filter ── -->
      <line x1="82" y1="42" x2="108" y2="65" stroke="#1a1a1a" stroke-width="1"/>
      <line x1="82" y1="74" x2="108" y2="68" stroke="#1a1a1a" stroke-width="1"/>
      <line x1="82" y1="106" x2="108" y2="74" stroke="#1a1a1a" stroke-width="1"/>

      <!-- ── Filter box ── -->
      <rect x="108" y="42" width="72" height="44" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="144" y="61" text-anchor="middle" font-weight="bold">FILTER</text>
      <text x="144" y="72" text-anchor="middle" font-size="7" fill="#555">+ ENV</text>
      <text x="144" y="34" text-anchor="middle" font-size="6.5" letter-spacing="1" fill="#444">FILTER</text>

      <!-- ── Arrow filter → adsr ── -->
      <line x1="180" y1="64" x2="200" y2="64" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── ADSR box ── -->
      <rect x="200" y="42" width="62" height="44" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="231" y="61" text-anchor="middle" font-weight="bold">ADSR</text>
      <text x="231" y="72" text-anchor="middle" font-size="7" fill="#555">GAIN</text>
      <text x="231" y="34" text-anchor="middle" font-size="6.5" letter-spacing="1" fill="#444">AMPLIFIER</text>

      <!-- ── Arrow adsr → level ── -->
      <line x1="262" y1="64" x2="282" y2="64" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── Level box ── -->
      <rect x="282" y="42" width="58" height="44" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="311" y="61" text-anchor="middle" font-weight="bold">LEVEL</text>
      <text x="311" y="72" text-anchor="middle" font-size="7" fill="#555">GAIN</text>

      <!-- ── Arrow level → effects bus ── -->
      <line x1="340" y1="64" x2="368" y2="64" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── Effects bus ── -->
      <rect x="368" y="42" width="98" height="24" fill="#1a1a1a"/>
      <text x="417" y="58" text-anchor="middle" fill="#f0ebe0" font-weight="bold" letter-spacing="1">EFFECTS BUS</text>

      <!-- effects chain vertical arrow -->
      <line x1="417" y1="66" x2="417" y2="80" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── Distortion ── -->
      <rect x="368" y="80" width="98" height="24" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="417" y="96" text-anchor="middle" font-weight="bold">DISTORTION</text>
      <line x1="417" y1="104" x2="417" y2="114" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── Chorus ── -->
      <rect x="368" y="114" width="98" height="24" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="417" y="130" text-anchor="middle" font-weight="bold">CHORUS</text>
      <line x1="417" y1="138" x2="417" y2="148" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── Delay ── -->
      <rect x="368" y="148" width="98" height="24" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="417" y="164" text-anchor="middle" font-weight="bold">DELAY</text>
      <line x1="417" y1="172" x2="417" y2="182" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── Reverb ── -->
      <rect x="368" y="182" width="98" height="24" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="417" y="198" text-anchor="middle" font-weight="bold">REVERB</text>
      <line x1="417" y1="206" x2="417" y2="216" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── Compressor ── -->
      <rect x="368" y="216" width="98" height="24" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="417" y="232" text-anchor="middle" font-weight="bold">COMPRESSOR</text>
      <line x1="417" y1="240" x2="417" y2="250" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>

      <!-- ── Master Gain ── -->
      <rect x="368" y="250" width="98" height="24" fill="#1a1a1a"/>
      <text x="417" y="266" text-anchor="middle" fill="#f0ebe0" font-weight="bold">MASTER GAIN</text>
      <line x1="466" y1="262" x2="492" y2="262" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arr)"/>
      <text x="495" y="266" font-size="8" font-weight="bold">OUT</text>

      <!-- Analyser branch -->
      <line x1="417" y1="274" x2="417" y2="284" stroke="#1a1a1a" stroke-width="1" stroke-dasharray="3,2"/>
      <rect x="368" y="284" width="98" height="22" fill="#f0ebe0" stroke="#888" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="417" y="299" text-anchor="middle" font-size="7.5" fill="#555">ANALYSER → SCOPE</text>

      <!-- ── LFO boxes (left column) ── -->
      <rect x="10" y="150" width="58" height="22" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="39" y="165" text-anchor="middle" font-weight="bold">LFO 1</text>
      <rect x="10" y="178" width="58" height="22" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="39" y="193" text-anchor="middle" font-weight="bold">LFO 2</text>
      <text x="39" y="144" text-anchor="middle" font-size="6.5" letter-spacing="1" fill="#444">MODULATION</text>

      <!-- LFO arrows → Filter + OSC detune (dashed) -->
      <line x1="68" y1="161" x2="140" y2="161" stroke="#555" stroke-width="1" stroke-dasharray="4,2" marker-end="url(#arr_dash)"/>
      <line x1="68" y1="189" x2="140" y2="189" stroke="#555" stroke-width="1" stroke-dasharray="4,2" marker-end="url(#arr_dash)"/>
      <text x="73" y="153" text-anchor="start" font-size="6.5" fill="#555">cutoff / pitch / vol</text>
      <text x="73" y="181" text-anchor="start" font-size="6.5" fill="#555">delay / pitch / vol</text>

      <!-- ── Sequencer + MIDI ── -->
      <rect x="10" y="218" width="72" height="22" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="46" y="233" text-anchor="middle" font-weight="bold">SEQUENCER</text>
      <rect x="10" y="246" width="72" height="22" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="46" y="261" text-anchor="middle" font-weight="bold">MIDI IN</text>
      <text x="46" y="212" text-anchor="middle" font-size="6.5" letter-spacing="1" fill="#444">TRIGGERS</text>

      <!-- Seq/MIDI arrows to source -->
      <line x1="82" y1="229" x2="96" y2="84" stroke="#888" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arr_dash)"/>
      <line x1="82" y1="257" x2="96" y2="90" stroke="#888" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arr_dash)"/>
      <text x="70" y="205" text-anchor="middle" font-size="6" fill="#888">note on/off</text>

      <!-- Arrow defs -->
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#1a1a1a"/>
        </marker>
        <marker id="arr_dash" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#555"/>
        </marker>
      </defs>

      <!-- Legend -->
      <rect x="10" y="298" width="355" height="32" fill="none" stroke="#aaa" stroke-width="0.5"/>
      <text x="18" y="309" font-size="6.5" fill="#555">LEGEND:</text>
      <line x1="60" y1="307" x2="90" y2="307" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="94" y="310" font-size="6.5" fill="#444">Audio signal</text>
      <line x1="150" y1="307" x2="180" y2="307" stroke="#555" stroke-width="1" stroke-dasharray="4,2"/>
      <text x="184" y="310" font-size="6.5" fill="#444">Modulation / Trigger</text>
      <text x="18" y="323" font-size="6.5" fill="#555">Each active MIDI note creates an independent voice with its own filter and ADSR nodes.</text>
    </svg>
    <div class="diagram-caption">FIG. 1-1 — OHM-1 Complete Signal Chain</div>
  </div>

  <p>Each <strong>MIDI note-on</strong> event spawns an independent voice containing its own oscillator bank, filter node, and ADSR gain node. All voices converge at the <strong>Effects Input Bus</strong> and are processed by the shared effects chain before reaching the master output.</p>

</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 4: SOURCE MODULE                                      -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header"><span class="section-num">2</span>SOURCE MODULE</div>

  <h2>2.1 Oscillator Engine</h2>
  <p>OHM-1 is a <strong>polyphonic subtractive synthesizer</strong>. Each voice can use up to <strong>8 simultaneous oscillators</strong>, all tuned to the same note but with optional detuning spread. The oscillators are rendered in real time using the Web Audio API at the system's native sample rate (typically 44.1 kHz or 48 kHz).</p>

  <h2>2.2 Waveforms</h2>
  <p>Four classic analog waveforms are available. Select the desired waveform using the waveform selector buttons in the SOURCE panel.</p>

  <div class="diagram-wrap">
    <svg viewBox="0 0 440 80" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="Courier New, monospace" font-size="8">
      <rect width="440" height="80" fill="#e8e3d8"/>

      <!-- Sine wave -->
      <rect x="10" y="10" width="90" height="58" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="55" y="22" text-anchor="middle" font-weight="bold" font-size="7">SINE</text>
      <path d="M14,45 C21,31 27,31 34,45 C41,59 47,59 54,45 C61,31 67,31 74,45 C81,59 87,59 94,45" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>

      <!-- Sawtooth -->
      <rect x="118" y="10" width="90" height="58" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="163" y="22" text-anchor="middle" font-weight="bold" font-size="7">SAWTOOTH</text>
      <polyline points="126,62 146,26 146,62 166,26 166,62 186,26 186,62 200,62" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>

      <!-- Square -->
      <rect x="226" y="10" width="90" height="58" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="271" y="22" text-anchor="middle" font-weight="bold" font-size="7">SQUARE</text>
      <polyline points="234,62 234,30 254,30 254,62 274,62 274,30 294,30 294,62 308,62" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>

      <!-- Triangle -->
      <rect x="334" y="10" width="90" height="58" fill="#f0ebe0" stroke="#1a1a1a" stroke-width="1.5"/>
      <text x="379" y="22" text-anchor="middle" font-weight="bold" font-size="7">TRIANGLE</text>
      <polyline points="342,62 357,30 372,62 387,30 402,62 416,62" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>
    </svg>
    <div class="diagram-caption">FIG. 2-1 — Available Oscillator Waveforms</div>
  </div>

  <table>
    <tr><th>Waveform</th><th>Harmonic Content</th><th>Character</th></tr>
    <tr><td><strong>Sine</strong></td><td>Fundamental only</td><td>Pure, clean, flute-like</td></tr>
    <tr><td><strong>Sawtooth</strong></td><td>All harmonics (odd + even)</td><td>Bright, buzzy, string/brass-like</td></tr>
    <tr><td><strong>Square</strong></td><td>Odd harmonics only</td><td>Hollow, nasal, clarinet-like</td></tr>
    <tr><td><strong>Triangle</strong></td><td>Odd harmonics, lower amplitude</td><td>Soft, mellow, between sine and square</td></tr>
  </table>

  <h2>2.3 Oscillator Count &amp; Spread (Detune)</h2>
  <div class="two-col">
    <div>
      <p><strong>OSC COUNT</strong> — Set the number of oscillators per voice using the [ – ] and [ + ] buttons. Range: 1 to 8. Multiple oscillators create a fuller, thicker sound. Gain is automatically compensated to maintain consistent perceived loudness.</p>
    </div>
    <div>
      <p><strong>SPREAD</strong> — Detunes the oscillators symmetrically around the center pitch. Range: 0–100 cents. At 0%, all oscillators are in unison. Higher values produce a wide, detuned "supersaw" effect. Dynamic gain adjusts for phase coherence.</p>
    </div>
  </div>

  <h2 style="break-before: page; padding-top: 4mm;">2.4 Noise Generator</h2>
  <p>The <strong>UTILITY</strong> module provides a built-in noise generator, independent of the oscillators. Three noise colors are available via the <strong>COLOR</strong> dropdown. Noise level is set with the <strong>NOISE LVL</strong> knob (0.0 – 1.0). Noise mixes directly into the signal before the filter.</p>

  <table>
    <tr><th>Color</th><th>Spectral Density</th><th>Character &amp; Use</th></tr>
    <tr><td><strong>White</strong></td><td>Flat (0 dB/octave)</td><td>Bright hiss. Air, hi-hat layering, breath</td></tr>
    <tr><td><strong>Pink</strong></td><td>–3 dB/octave</td><td>Balanced, natural. Wind, ocean, percussion</td></tr>
    <tr><td><strong>Brown</strong></td><td>–6 dB/octave</td><td>Deep, dark rumble. Bass layering, thunder, sub texture</td></tr>
  </table>

  <div class="note-box">
    <strong>Tip</strong>
    Mix a small amount of White noise with a Sine wave oscillator and open the filter slightly to create realistic flute and wind instrument sounds. Use Brown noise layered under a bass patch for added sub-frequency weight.
  </div>

  <h2>2.5 Sampler Mode</h2>
  <p>Switch the SOURCE module to <strong>SAMPLER</strong> mode to play back audio samples chromatically instead of using oscillators. The sampler uses the same filter and amplifier ADSR pipeline as oscillator mode. Velocity center point is 64 (MIDI), corresponding to unity gain.</p>

</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 5: UTILITY + FILTER                                   -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header"><span class="section-num">3</span>UTILITY MODULE</div>

  <h2>3.1 Voicing Mode</h2>
  <div class="two-col">
    <div>
      <p><strong>POLY</strong> — Polyphonic mode (default). Multiple notes can play simultaneously, each with its own independent voice, filter, and envelope. Suitable for chords and pads.</p>
    </div>
    <div>
      <p><strong>MONO</strong> — Monophonic mode. Only one note sounds at a time. When a new note is triggered, the previous voice is released immediately. Ideal for bass lines and monophonic leads.</p>
    </div>
  </div>

  <!-- ═════════════════════════════════════════════════════════ -->
  <div class="section-header" style="margin-top:6mm"><span class="section-num">4</span>FILTER MODULE</div>

  <p>OHM-1 uses a <strong>Lowpass Biquad Filter</strong> per voice. The filter shapes the tonal character of the sound by attenuating frequencies above the cutoff point. Its behavior is modulated by a dedicated ADSR envelope.</p>

  <h2>4.1 Cutoff &amp; Resonance</h2>
  <div class="param-list">
    <div class="param-item">
      <div class="param-name">CUTOFF</div>
      <div>Sets the filter's cutoff frequency. Range: <strong>20 Hz – 10,000 Hz</strong> (logarithmic scale). At low values the sound is dark and muffled; at high values it is bright and open. Default: 2,000 Hz.</div>
    </div>
    <div class="param-item">
      <div class="param-name">RES (Q)</div>
      <div>Resonance emphasizes frequencies around the cutoff point. Range: <strong>1.0 – 20.0</strong>. Higher values produce a pronounced peak or self-oscillation at the cutoff frequency. Default: 1.0.</div>
    </div>
    <div class="param-item">
      <div class="param-name">ENV AMT</div>
      <div>Controls how much the filter envelope modulates the cutoff frequency. Range: <strong>0 – 100%</strong>. At 100%, the envelope can sweep the filter up to 5,000 Hz above the sustain frequency. Default: 50%.</div>
    </div>
  </div>

  <h2>4.2 Filter Envelope (ADSR)</h2>
  <p>The Filter Envelope shapes how the cutoff frequency evolves over time during a note. The curve below shows a typical filter envelope sweep.</p>

  <div class="diagram-wrap">
    <svg viewBox="0 0 440 110" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="Courier New, monospace">
      <rect width="440" height="110" fill="#e8e3d8"/>

      <!-- Grid lines -->
      <line x1="60" y1="15" x2="60" y2="85" stroke="#ccc" stroke-width="0.5"/>
      <line x1="140" y1="15" x2="140" y2="85" stroke="#ccc" stroke-width="0.5"/>
      <line x1="300" y1="15" x2="300" y2="85" stroke="#ccc" stroke-width="0.5"/>
      <line x1="380" y1="15" x2="380" y2="85" stroke="#ccc" stroke-width="0.5"/>
      <line x1="40" y1="50" x2="420" y2="50" stroke="#ccc" stroke-width="0.5" stroke-dasharray="3,3"/>

      <!-- Zero line -->
      <line x1="40" y1="85" x2="420" y2="85" stroke="#1a1a1a" stroke-width="1"/>
      <!-- Left axis -->
      <line x1="40" y1="15" x2="40" y2="85" stroke="#1a1a1a" stroke-width="1"/>

      <!-- ADSR Curve (filter envelope - fast attack, moderate decay, low sustain) -->
      <polyline points="40,85 60,15 140,60 300,60 380,85" fill="none" stroke="#1a1a1a" stroke-width="2"/>
      <!-- Shaded area -->
      <polygon points="40,85 60,15 140,60 300,60 380,85" fill="rgba(0,0,0,0.08)"/>

      <!-- Phase labels -->
      <text x="50" y="100" text-anchor="middle" font-size="8" font-family="Courier New" font-weight="bold">A</text>
      <text x="100" y="100" text-anchor="middle" font-size="8" font-family="Courier New" font-weight="bold">D</text>
      <text x="220" y="100" text-anchor="middle" font-size="8" font-family="Courier New" font-weight="bold">S (KEY HELD)</text>
      <text x="360" y="100" text-anchor="middle" font-size="8" font-family="Courier New" font-weight="bold">R</text>

      <!-- Axis labels -->
      <text x="30" y="18" text-anchor="end" font-size="7" font-family="Courier New" fill="#555">PEAK</text>
      <text x="30" y="63" text-anchor="end" font-size="7" font-family="Courier New" fill="#555">SUST.</text>
      <text x="30" y="88" text-anchor="end" font-size="7" font-family="Courier New" fill="#555">0</text>

      <!-- "Key On" and "Key Off" markers -->
      <line x1="40" y1="10" x2="40" y2="90" stroke="#666" stroke-width="0.5" stroke-dasharray="2,2"/>
      <text x="40" y="9" text-anchor="middle" font-size="7" fill="#666">KEY ON</text>
      <line x1="300" y1="10" x2="300" y2="90" stroke="#666" stroke-width="0.5" stroke-dasharray="2,2"/>
      <text x="300" y="9" text-anchor="middle" font-size="7" fill="#666">KEY OFF</text>

      <!-- Cutoff base marker -->
      <line x1="40" y1="60" x2="370" y2="60" stroke="#888" stroke-width="0.5" stroke-dasharray="4,3"/>
      <text x="373" y="63" font-size="7" fill="#888">CUTOFF BASE</text>
    </svg>
    <div class="diagram-caption">FIG. 4-1 — Filter Envelope Shape</div>
  </div>

  <table>
    <tr><th>Parameter</th><th>Range</th><th>Description</th></tr>
    <tr><td>ATTACK</td><td>0 – 1.0 s</td><td>Time to reach peak filter frequency</td></tr>
    <tr><td>DECAY</td><td>0 – 1.0 s</td><td>Time to fall from peak to sustain level</td></tr>
    <tr><td>SUSTAIN</td><td>0 – 1.0 (0–100%)</td><td>Held filter level during key press</td></tr>
    <tr><td>RELEASE</td><td>0.02 – 1.0 s</td><td>Time to fall from sustain to closed (min 20 ms)</td></tr>
  </table>

</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 6: AMPLIFIER                                          -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header"><span class="section-num">5</span>AMPLIFIER MODULE</div>

  <p>The Amplifier Module controls the overall loudness and the volume envelope of each voice. The <strong>Amplitude Envelope</strong> determines how the volume evolves from note-on to note-off.</p>

  <h2>5.1 Master Volume</h2>
  <p><strong>MASTER VOL</strong> — Sets the final output level after all processing. Range: <strong>0.0 – 1.0</strong>. Default: 0.5. This parameter is MIDI-mappable and affects the output of all active voices simultaneously.</p>

  <div class="note-box">
    <strong>Automatic Gain Compensation</strong>
    OHM-1 automatically adjusts per-voice gain based on the number of active voices and oscillators to prevent clipping. More oscillators and more voices result in proportionally reduced individual voice levels. Velocity (0–127) applies an additional gain curve with an exponent of 1.2 for expressive dynamic response.
  </div>

  <h2>5.2 Amplitude Envelope (ADSR)</h2>
  <p>The Amplitude Envelope shapes the volume contour of each note. A minimum release time of <strong>5 ms</strong> is enforced to prevent audible clicks during fast releases.</p>

  <div class="diagram-wrap">
    <svg viewBox="0 0 440 110" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="Courier New, monospace">
      <rect width="440" height="110" fill="#e8e3d8"/>

      <!-- Grid -->
      <line x1="60" y1="15" x2="60" y2="85" stroke="#ccc" stroke-width="0.5"/>
      <line x1="130" y1="15" x2="130" y2="85" stroke="#ccc" stroke-width="0.5"/>
      <line x1="300" y1="15" x2="300" y2="85" stroke="#ccc" stroke-width="0.5"/>
      <line x1="380" y1="15" x2="380" y2="85" stroke="#ccc" stroke-width="0.5"/>

      <!-- Axes -->
      <line x1="40" y1="85" x2="420" y2="85" stroke="#1a1a1a" stroke-width="1"/>
      <line x1="40" y1="15" x2="40" y2="85" stroke="#1a1a1a" stroke-width="1"/>

      <!-- ADSR Curve (typical amp envelope - moderate attack, moderate decay, high sustain) -->
      <polyline points="40,85 60,15 130,36 300,36 380,85" fill="none" stroke="#1a1a1a" stroke-width="2"/>
      <polygon points="40,85 60,15 130,36 300,36 380,85" fill="rgba(0,0,0,0.08)"/>

      <!-- Phase labels -->
      <text x="50" y="100" text-anchor="middle" font-size="8" font-family="Courier New" font-weight="bold">A</text>
      <text x="95" y="100" text-anchor="middle" font-size="8" font-family="Courier New" font-weight="bold">D</text>
      <text x="215" y="100" text-anchor="middle" font-size="8" font-family="Courier New" font-weight="bold">S (KEY HELD)</text>
      <text x="340" y="100" text-anchor="middle" font-size="8" font-family="Courier New" font-weight="bold">R</text>

      <!-- Labels -->
      <text x="30" y="18" text-anchor="end" font-size="7" font-family="Courier New" fill="#555">PEAK</text>
      <text x="30" y="39" text-anchor="end" font-size="7" font-family="Courier New" fill="#555">SUST.</text>
      <text x="30" y="88" text-anchor="end" font-size="7" font-family="Courier New" fill="#555">0</text>

      <line x1="40" y1="10" x2="40" y2="90" stroke="#666" stroke-width="0.5" stroke-dasharray="2,2"/>
      <text x="40" y="9" text-anchor="middle" font-size="7" fill="#666">KEY ON</text>
      <line x1="300" y1="10" x2="300" y2="90" stroke="#666" stroke-width="0.5" stroke-dasharray="2,2"/>
      <text x="300" y="9" text-anchor="middle" font-size="7" fill="#666">KEY OFF</text>
    </svg>
    <div class="diagram-caption">FIG. 5-1 — Amplitude Envelope Shape (default: A=0.15s, D=0.6s, S=80%, R=5ms)</div>
  </div>

  <table>
    <tr><th>Parameter</th><th>Range</th><th>Default</th><th>Description</th></tr>
    <tr><td>ATTACK</td><td>0 – 1.0 s</td><td>0.15 s</td><td>Time from note-on to maximum volume</td></tr>
    <tr><td>DECAY</td><td>0 – 1.0 s</td><td>0.6 s</td><td>Time from peak to sustain level</td></tr>
    <tr><td>SUSTAIN</td><td>0 – 1.0</td><td>0.8 (80%)</td><td>Volume level held during key press</td></tr>
    <tr><td>RELEASE</td><td>0.005 – 1.0 s</td><td>0.005 s</td><td>Time to fade to silence after key release (min 5 ms)</td></tr>
  </table>

  <div class="note-box">
    <strong>Designing Patches — ADSR Guide</strong>
    <strong>Pads:</strong> Long A (0.5–1.0s), moderate D, high S (0.7–1.0), long R (0.5–1.0s).
    <strong>Plucks / Leads:</strong> Short A (0.0s), moderate D (0.2–0.5s), low S (0.1–0.3), short R.
    <strong>Strings:</strong> Moderate A (0.1–0.3s), long D, high S, moderate R.
    <strong>Bass:</strong> Short A, short D, moderate-high S, short R.
  </div>

</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 7: LFO                                                -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header"><span class="section-num">6</span>LFO &amp; MODULATION</div>

  <p>OHM-1 provides <strong>two independent Low-Frequency Oscillators (LFOs)</strong> for modulating audio parameters over time. LFOs add movement and expression to static sounds — vibrato, tremolo, filter sweeps, and rhythmic effects.</p>

  <h2>6.1 LFO 1 &amp; LFO 2</h2>
  <div class="two-col">
    <div>
      <div class="param-list">
        <div class="param-item"><div class="param-name">RATE</div><div>LFO oscillation speed. Range: <strong>0 – 20 Hz</strong>. Slow rates (0.1–2 Hz) for sweeps; fast rates (5–20 Hz) for vibrato/tremolo effects.</div></div>
        <div class="param-item"><div class="param-name">DEPTH</div><div>Modulation intensity. Range: <strong>0 – 1.0</strong> (normalized). Actual modulation depth depends on the selected destination. At 0, the LFO has no effect.</div></div>
      </div>
    </div>
    <div>
      <p><strong>Waveforms</strong> — same four waveforms as the oscillators:</p>
      <ul style="margin-left:4mm; margin-top:2mm; font-size:8.5pt; line-height:1.8;">
        <li><strong>Sine</strong> — smooth, natural modulation</li>
        <li><strong>Triangle</strong> — linear, clean sweep</li>
        <li><strong>Square</strong> — hard switching between two values</li>
        <li><strong>Sawtooth</strong> — one-directional ramp</li>
      </ul>
    </div>
  </div>

  <h2>6.2 Modulation Destinations</h2>
  <p>Each LFO can target one destination at a time. Select the destination via the dropdown below the LFO waveform buttons.</p>

  <table>
    <tr><th>Destination</th><th>Modulates</th><th>Max Depth Scaling</th><th>Effect</th></tr>
    <tr><td><strong>NONE</strong></td><td>—</td><td>—</td><td>LFO is off / no modulation</td></tr>
    <tr><td><strong>FILTER CUTOFF</strong></td><td>Filter frequency</td><td>±4,000 Hz</td><td>Auto-wah, filter sweep, talking synth</td></tr>
    <tr><td><strong>PITCH</strong></td><td>Oscillator detune</td><td>±100 cents</td><td>Vibrato, pitch shimmer, chorus-like effect</td></tr>
    <tr><td><strong>VOLUME</strong></td><td>Master gain</td><td>±0.3</td><td>Tremolo, pulsating volume</td></tr>
    <tr><td><strong>DELAY TIME</strong></td><td>Delay effect time</td><td>±0.02 s</td><td>Tape flutter, subtle warble on delays</td></tr>
  </table>

  <h2>6.3 Key Sync</h2>
  <p>When <strong>KEY SYNC</strong> is enabled, the LFO resets its phase to zero each time a new MIDI note is triggered. This ensures the modulation always starts at the same point in its cycle, creating rhythmically consistent effects. When disabled, the LFO runs freely and continuously regardless of note input.</p>

  <table>
    <tr><th>LFO</th><th>Default Waveform</th><th>Default Rate</th><th>Default Key Sync</th><th>Default State</th></tr>
    <tr><td><strong>LFO 1</strong></td><td>Sine</td><td>0.0 Hz</td><td>Off (free-running)</td><td>Enabled</td></tr>
    <tr><td><strong>LFO 2</strong></td><td>Triangle</td><td>2.0 Hz</td><td>On (synced)</td><td>Disabled</td></tr>
  </table>


</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 8: STEP SEQUENCER                                     -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header"><span class="section-num">7</span>STEP SEQUENCER</div>

  <p>OHM-1 includes an integrated <strong>Step Sequencer</strong> capable of generating melodic and rhythmic patterns independently of or alongside MIDI input. It triggers note-on/note-off events directly into the voice engine, fully respecting all synthesizer parameters in real time.</p>

  <h2>7.1 Grid Layout</h2>
  <div class="two-col">
    <div>
      <p><strong>Columns:</strong> 8 steps per row (each step = one 16th note).</p>
      <p><strong>Rows:</strong> 1 to 8 rows. Each row adds 8 more steps. Click <strong>+ ADD ROW</strong> to extend. Default: 4 rows (32 steps total).</p>
      <p><strong>Maximum:</strong> 8 rows × 8 columns = <strong>64 steps</strong>.</p>
    </div>
    <div>
      <p>Each step stores:</p>
      <ul style="margin-left:4mm; font-size:8.5pt; line-height:1.8;">
        <li><strong>Active</strong> — whether the step triggers a note</li>
        <li><strong>Note</strong> — MIDI note number (0–127)</li>
        <li><strong>Velocity</strong> — MIDI velocity (0–127)</li>
      </ul>
    </div>
  </div>

  <h2>7.2 BPM &amp; Timing</h2>
  <p>Set tempo with the <strong>BPM</strong> display (range: 10–999 BPM, default: 90 BPM). Each step = one 16th note. At 90 BPM, each step lasts approximately 166 ms. Note duration is 75% of the step length. Scheduling uses the Web Audio API's sample-accurate clock with a 100 ms look-ahead window for reliable timing.</p>

  <h2>7.3 Playback &amp; Loop Behavior</h2>
  <p>Press <strong>▶ PLAY</strong> to start and <strong>■ STOP</strong> to halt the sequencer. Playback begins from step 0. After reaching the last active step in a row, the sequencer scans ahead — if no further active steps exist in the remaining rows, it loops immediately back to step 0 rather than advancing through empty rows.</p>

  <h2>7.4 Programming Steps</h2>
  <div class="param-list">
    <div class="param-item"><div class="param-name">Toggle Step</div><div>Click any step cell to activate (highlighted) or deactivate it.</div></div>
    <div class="param-item"><div class="param-name">Drag &amp; Drop</div><div>Drag an active step to another position to move its note and velocity data.</div></div>
    <div class="param-item"><div class="param-name">Copy / Paste</div><div><strong>Ctrl+C</strong> to copy a selected step, <strong>Ctrl+V</strong> to paste into the armed step position.</div></div>
    <div class="param-item"><div class="param-name">Delete Step</div><div><strong>Backspace</strong> to clear the selected step.</div></div>
    <div class="param-item"><div class="param-name">Transpose</div><div><strong>Arrow Up / Down</strong> to shift the selected step's note ±1 semitone.</div></div>
  </div>

  <h2>7.5 MIDI Step Recording</h2>
  <p>OHM-1 supports live MIDI step recording:</p>
  <ol style="margin-left:6mm; font-size:8.5pt; line-height:2.0;">
    <li>Click on a step cell to arm it (highlighted border).</li>
    <li>Play any note on your MIDI controller.</li>
    <li>The step captures the MIDI note number and velocity.</li>
    <li>The armed position automatically advances to the next available step.</li>
  </ol>

  <h2>7.6 Default Pattern</h2>
  <p>On initialization, Row 1 is pre-loaded with a C major scale ascending: <strong>C4 D4 E4 F4 G4 A4 B4 C5</strong> — all steps active at velocity 127. Rows 2–4 are empty.</p>


</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 9: EFFECTS RACK                                       -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header"><span class="section-num">8</span>EFFECTS RACK</div>

  <p>The Effects Rack processes the combined output of all active voices in the following fixed order: <strong>Distortion → Chorus → Delay → Reverb → Compressor</strong>. Each effect can be enabled or disabled independently. When disabled, its mix is set to 0 and it is bypassed.</p>

  <h2>8.1 Distortion</h2>
  <div class="param-list">
    <div class="param-item"><div class="param-name">DRIVE</div><div>Amount of saturation applied. Range: 0 – 1.0. Internally scales to 0–1000 drive gain with a sigmoid waveshaper curve. Automatic makeup gain compensates for volume increase (reduces from 1.0 → 0.1 as drive increases).</div></div>
    <div class="param-item"><div class="param-name">TONE</div><div>Post-distortion low-pass filter frequency. Range: 500 Hz – 20,000 Hz (exponential). At 1.0 the sound is fully bright; lower values roll off high-frequency distortion artifacts.</div></div>
    <div class="param-item"><div class="param-name">MIX</div><div>Dry/wet blend. Range: 0 – 1.0. Equal-power crossfade. 0 = clean signal only, 1.0 = fully distorted.</div></div>
  </div>

  <h2>8.2 Chorus</h2>
  <p>The Chorus uses a modulated delay line to create a doubling/thickening effect, simulating multiple detuned voices.</p>
  <div class="param-list">
    <div class="param-item"><div class="param-name">RATE</div><div>LFO modulation speed. Range: 0.1 – 8.0 Hz. Slow rates produce a gentle shimmer; fast rates create a vibrato-like effect.</div></div>
    <div class="param-item"><div class="param-name">DEPTH</div><div>Modulation depth of the internal delay time. Range: 0 – 1.0 (internally 0–15 ms offset from 20 ms base delay).</div></div>
    <div class="param-item"><div class="param-name">MIX</div><div>Dry/wet blend. Default: 0.15 (subtle). Equal-power crossfade.</div></div>
  </div>

  <h2>8.3 Delay</h2>
  <p>A feedback delay line with configurable time, feedback amount, and wet level.</p>
  <div class="param-list">
    <div class="param-item"><div class="param-name">TIME</div><div>Delay repeat time. Range: 0 – 1.0 seconds. Feedback path carries the delayed signal back for additional repeats.</div></div>
    <div class="param-item"><div class="param-name">FEEDBACK</div><div>Number of repeats / tail length. Range: 0 – 0.9 (capped at 90% to prevent runaway feedback). Higher values create long, decaying tails.</div></div>
    <div class="param-item"><div class="param-name">MIX</div><div>Dry/wet blend. Range: 0 – 1.0. Default: 1.0 when enabled.</div></div>
  </div>

  <h2 style="break-before: page; padding-top: 4mm;">8.4 Reverb</h2>
  <p>A convolution reverb using a synthetically generated impulse response. Provides a sense of acoustic space from small rooms to large halls.</p>
  <div class="param-list">
    <div class="param-item"><div class="param-name">MIX</div><div>Dry/wet blend. Range: 0 – 1.0. Default: 0.5. Equal-power crossfade.</div></div>
    <div class="param-item"><div class="param-name">DECAY</div><div>Reverb tail length. Range: 0.1 – 5.0 seconds. The impulse response is regenerated when this value changes (100 ms debounce). Short values simulate small rooms; long values simulate halls or chambers.</div></div>
  </div>

  <div class="note-box">
    <strong>Effects Order Note</strong>
    The effects chain order is fixed: Distortion is applied first (pre-reverb), ensuring that distorted signal — rather than the reverb tail — is processed. This is the traditional analog insert chain order. To achieve a "reverb before distortion" effect, consider reducing the reverb mix on the reverb unit and using the distortion's tone control to shape the combined result.
  </div>

</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 10: MIDI                                              -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header"><span class="section-num">9</span>MIDI IMPLEMENTATION</div>

  <p>OHM-1 uses the <strong>Web MIDI API</strong> to receive MIDI data from connected hardware controllers. Select your MIDI device from the <strong>MIDI IN</strong> dropdown in the top navigation bar. Multiple devices are supported simultaneously (shown as "+N" when more than one is active).</p>

  <h2>9.1 MIDI Input &amp; Note Handling</h2>
  <table class="midi-cc-table">
    <tr><th>Message</th><th>Status Byte</th><th>Description</th></tr>
    <tr><td>Note On</td><td>0x90 + ch, vel &gt; 0</td><td>Triggers a new voice. Each note spawns an independent voice. Velocity (0–127) scales the voice gain with an exponent of 1.2.</td></tr>
    <tr><td>Note Off</td><td>0x80 + ch, or 0x90 vel=0</td><td>Releases the corresponding voice. The amplitude envelope enters its Release phase. After the release time, the voice is deallocated.</td></tr>
    <tr><td>Control Change</td><td>0xB0 + ch</td><td>Routes CC values (0–127, normalized to 0.0–1.0) to mapped synthesizer parameters.</td></tr>
    <tr><td>MIDI Clock</td><td>0xF8</td><td>Ignored. OHM-1 uses its own internal BPM clock.</td></tr>
  </table>

  <h2>9.2 MIDI Learn — CC Mapping</h2>
  <p>Any MIDI CC control from your hardware can be mapped to a synthesizer parameter using the <strong>MIDI Learn</strong> function.</p>

  <p style="margin-top:3mm"><strong>To map a CC to a parameter:</strong></p>
  <ol style="margin-left:6mm; font-size:8.5pt; line-height:2.0; margin-top:2mm;">
    <li>Click <strong>MIDI MAPPINGS</strong> in the top bar to open the mapping panel.</li>
    <li>Click the <strong>LEARN</strong> button next to the desired parameter.</li>
    <li>The button turns active (lit) — OHM-1 is now listening for the next CC message.</li>
    <li>Move any knob, fader, or slider on your MIDI controller.</li>
    <li>The CC number is captured and the mapping is confirmed automatically.</li>
    <li>To remove a mapping, click the <strong>UNMAP</strong> button next to the parameter.</li>
  </ol>

  <div class="note-box">
    <strong>MIDI MAP View</strong>
    Click <strong>MIDI MAP</strong> in the top bar to view the complete current mapping table — all parameters and their assigned CC numbers at a glance. Mappings persist as long as the browser session is active.
  </div>

  <h2 style="break-before: page; padding-top: 4mm;">9.3 Mappable Parameters</h2>
  <table>
    <tr><th>Category</th><th>Parameter</th><th>CC Range → Internal Range</th></tr>
    <tr><td rowspan="4">Amp Envelope</td><td>ATTACK</td><td>0–127 → 0–1.0 s</td></tr>
    <tr><td>DECAY</td><td>0–127 → 0–1.0 s</td></tr>
    <tr><td>SUSTAIN</td><td>0–127 → 0–1.0</td></tr>
    <tr><td>RELEASE</td><td>0–127 → 0–1.0 s</td></tr>
    <tr><td rowspan="4">Filter Envelope</td><td>FILTER ATTACK</td><td>0–127 → 0–1.0 s</td></tr>
    <tr><td>FILTER DECAY</td><td>0–127 → 0–1.0 s</td></tr>
    <tr><td>FILTER SUSTAIN</td><td>0–127 → 0–1.0</td></tr>
    <tr><td>FILTER RELEASE</td><td>0–127 → 0–1.0 s</td></tr>
    <tr><td rowspan="4">Filter</td><td>FILTER FREQUENCY</td><td>0–127 → 20–10,000 Hz (log)</td></tr>
    <tr><td>FILTER RESONANCE</td><td>0–127 → 0–20</td></tr>
    <tr><td>FILTER ENV AMOUNT</td><td>0–127 → 0–100%</td></tr>
    <tr><td>MASTER GAIN</td><td>0–127 → 0–1.0</td></tr>
    <tr><td rowspan="2">Oscillators</td><td>OSC COUNT</td><td>0–127 → 1–8</td></tr>
    <tr><td>SPREAD (DETUNE)</td><td>0–127 → 0–100 cents</td></tr>
    <tr><td rowspan="2">LFO 1</td><td>LFO1 RATE</td><td>0–127 → 0–20 Hz</td></tr>
    <tr><td>LFO1 DEPTH</td><td>0–127 → 0–1.0</td></tr>
    <tr><td rowspan="2">LFO 2</td><td>LFO2 RATE</td><td>0–127 → 0–20 Hz</td></tr>
    <tr><td>LFO2 DEPTH</td><td>0–127 → 0–1.0</td></tr>
    <tr><td rowspan="3">Distortion</td><td>DRIVE</td><td>0–127 → 0–1.0</td></tr>
    <tr><td>TONE</td><td>0–127 → 0–1.0</td></tr>
    <tr><td>MIX</td><td>0–127 → 0–1.0</td></tr>
    <tr><td rowspan="2">Reverb</td><td>MIX</td><td>0–127 → 0–1.0</td></tr>
    <tr><td>DECAY</td><td>0–127 → 0.1–5.0 s</td></tr>
    <tr><td rowspan="3">Delay</td><td>TIME</td><td>0–127 → 0–1.0 s</td></tr>
    <tr><td>FEEDBACK</td><td>0–127 → 0–0.9</td></tr>
    <tr><td>MIX</td><td>0–127 → 0–1.0</td></tr>
    <tr><td rowspan="3">Chorus</td><td>RATE</td><td>0–127 → 0.1–8.0 Hz</td></tr>
    <tr><td>DEPTH</td><td>0–127 → 0–1.0</td></tr>
    <tr><td>MIX</td><td>0–127 → 0–1.0</td></tr>
  </table>

</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PAGE 11: APPENDIX                                          -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">APPENDIX A &nbsp; PARAMETER REFERENCE</div>

  <table>
    <tr><th>Module</th><th>Parameter</th><th>Min</th><th>Max</th><th>Default</th><th>Unit</th><th>MIDI</th></tr>
    <tr><td>Source</td><td>Waveform</td><td colspan="3">Sine / Sawtooth / Square / Triangle</td><td>—</td><td>No</td></tr>
    <tr><td>Source</td><td>OSC Count</td><td>1</td><td>8</td><td>2</td><td>integer</td><td>Yes</td></tr>
    <tr><td>Source</td><td>Spread</td><td>0</td><td>100</td><td>0</td><td>cents</td><td>Yes</td></tr>
    <tr><td>Utility</td><td>Noise Level</td><td>0.0</td><td>1.0</td><td>0.0</td><td>linear</td><td>No</td></tr>
    <tr><td>Utility</td><td>Noise Color</td><td colspan="3">White / Pink / Brown</td><td>—</td><td>No</td></tr>
    <tr><td>Utility</td><td>Voicing</td><td colspan="3">Poly / Mono</td><td>—</td><td>No</td></tr>
    <tr><td>Filter</td><td>Cutoff</td><td>20</td><td>10,000</td><td>2,000</td><td>Hz (log)</td><td>Yes</td></tr>
    <tr><td>Filter</td><td>Resonance</td><td>1.0</td><td>20.0</td><td>1.0</td><td>Q</td><td>Yes</td></tr>
    <tr><td>Filter</td><td>Env Amount</td><td>0</td><td>1.0</td><td>0.5</td><td>%</td><td>Yes</td></tr>
    <tr><td>Filter Env</td><td>Attack</td><td>0</td><td>1.0</td><td>0.3</td><td>s</td><td>Yes</td></tr>
    <tr><td>Filter Env</td><td>Decay</td><td>0</td><td>1.0</td><td>0.0</td><td>s</td><td>Yes</td></tr>
    <tr><td>Filter Env</td><td>Sustain</td><td>0</td><td>1.0</td><td>0.05</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Filter Env</td><td>Release</td><td>0.02</td><td>1.0</td><td>0.02</td><td>s</td><td>Yes</td></tr>
    <tr><td>Amplifier</td><td>Master Vol</td><td>0</td><td>1.0</td><td>0.5</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Amp Env</td><td>Attack</td><td>0</td><td>1.0</td><td>0.15</td><td>s</td><td>Yes</td></tr>
    <tr><td>Amp Env</td><td>Decay</td><td>0</td><td>1.0</td><td>0.6</td><td>s</td><td>Yes</td></tr>
    <tr><td>Amp Env</td><td>Sustain</td><td>0</td><td>1.0</td><td>0.8</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Amp Env</td><td>Release</td><td>0.005</td><td>1.0</td><td>0.005</td><td>s</td><td>Yes</td></tr>
    <tr><td>LFO 1</td><td>Rate</td><td>0</td><td>20</td><td>0.0</td><td>Hz</td><td>Yes</td></tr>
    <tr><td>LFO 1</td><td>Depth</td><td>0</td><td>1.0</td><td>0.0</td><td>linear</td><td>Yes</td></tr>
    <tr><td>LFO 2</td><td>Rate</td><td>0</td><td>20</td><td>2.0</td><td>Hz</td><td>Yes</td></tr>
    <tr><td>LFO 2</td><td>Depth</td><td>0</td><td>1.0</td><td>0.0</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Sequencer</td><td>BPM</td><td>10</td><td>999</td><td>90</td><td>BPM</td><td>No</td></tr>
    <tr><td>Sequencer</td><td>Rows</td><td>1</td><td>8</td><td>4</td><td>integer</td><td>No</td></tr>
    <tr><td>Distortion</td><td>Drive</td><td>0</td><td>1.0</td><td>0.5</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Distortion</td><td>Tone</td><td>500</td><td>20,000</td><td>20,000</td><td>Hz (exp)</td><td>Yes</td></tr>
    <tr><td>Distortion</td><td>Mix</td><td>0</td><td>1.0</td><td>1.0</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Chorus</td><td>Rate</td><td>0.1</td><td>8.0</td><td>0.27</td><td>Hz</td><td>Yes</td></tr>
    <tr><td>Chorus</td><td>Depth</td><td>0</td><td>1.0</td><td>0.2</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Chorus</td><td>Mix</td><td>0</td><td>1.0</td><td>0.15</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Delay</td><td>Time</td><td>0</td><td>1.0</td><td>0.5</td><td>s</td><td>Yes</td></tr>
    <tr><td>Delay</td><td>Feedback</td><td>0</td><td>0.9</td><td>0.3</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Delay</td><td>Mix</td><td>0</td><td>1.0</td><td>1.0</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Reverb</td><td>Mix</td><td>0</td><td>1.0</td><td>0.5</td><td>linear</td><td>Yes</td></tr>
    <tr><td>Reverb</td><td>Decay</td><td>0.1</td><td>5.0</td><td>2.0</td><td>s</td><td>Yes</td></tr>
  </table>

  <div style="margin-top:8mm; border-top:2px solid #1a1a1a; padding-top:4mm; font-size:7.5pt; color:#555; text-align:center; letter-spacing:1px;">
    OHM-1 POLYPHONIC VIRTUAL ANALOG SYNTHESIZER &nbsp;·&nbsp; OWNER'S MANUAL<br>
    © Soundionic &nbsp;·&nbsp; soundionic.com &nbsp;·&nbsp; Web Audio API / Web MIDI API
  </div>

</div>

</body>
</html>"""

html_path = '/tmp/ohm1_manual.html'
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(HTML)
print(f"HTML written to {html_path}")

output_pdf = os.path.expanduser('~/Desktop/OHM-1_Manual.pdf')

puppeteer_paths = [
    '/Users/ivanrogulj/.npm/_npx/7d92d9a2d2ccc630/node_modules/puppeteer',
]

js_script = f"""
const puppeteer = require('{puppeteer_paths[0]}');
(async () => {{
  const browser = await puppeteer.launch({{ headless: true, args: ['--no-sandbox'] }});
  const page = await browser.newPage();
  await page.emulateMediaType('print');
  await page.goto('file://{html_path}', {{ waitUntil: 'networkidle0' }});
  await page.pdf({{
    path: '{output_pdf}',
    format: 'A4',
    printBackground: true,
    margin: {{ top: 0, bottom: 0, left: 0, right: 0 }}
  }});
  await browser.close();
  console.log('PDF created: {output_pdf}');
}})().catch(e => {{ console.error(e.message); process.exit(1); }});
"""

js_path = '/tmp/gen_pdf.js'
with open(js_path, 'w') as f:
    f.write(js_script)

result = subprocess.run(['node', js_path], capture_output=True, text=True, timeout=60)
if result.returncode == 0:
    print(result.stdout.strip())
else:
    print("Puppeteer failed:", result.stderr[:500])
    print(f"\\nOpen manually: file://{html_path}")
