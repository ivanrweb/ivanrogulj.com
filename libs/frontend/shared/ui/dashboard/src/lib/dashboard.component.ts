import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// eslint-disable-next-line @nx/enforce-module-boundaries

@Component({
  selector: 'lib-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div class="portfolio-container">
      <!-- HERO -->
      <section class="hero-section">
        <div class="hero-glow"></div>
        <div class="hero-glow hero-glow--secondary"></div>
        <div class="hero-content">
          <div class="hero-eyebrow">Software &amp; Music intersection</div>
          <h1 class="hero-title">Soundionic</h1>
          <div class="hero-lines">
            <p class="hero-desc">
              <img class="term-prompt" src="svg/terminal.svg" alt="" />
              Browser-based audio tools built on the Web Audio API
            </p>
            <p class="hero-desc">
              <img class="term-prompt" src="svg/terminal.svg" alt="" />
              Downloadable VST plugins to use in your audio workstation
            </p>
            <p class="hero-desc">
              <img class="term-prompt" src="svg/terminal.svg" alt="" />
              Articles about creation of these music tools, so you can implement
              them in your own projects
            </p>
          </div>
          <div class="hero-stack">
            <span class="stack-tag">Web Audio API</span>
            <span class="stack-tag">MIDI</span>
            <span class="stack-tag">DSP</span>
            <span class="stack-tag">JUCE Framework (C++)</span>
            <span class="stack-tag">Angular</span>
            <span class="stack-tag">NestJS</span>
          </div>
        </div>
      </section>

      <!-- VIRTUAL ANALOG SYNTH -->
      <section class="project-row" (click)="navigate('audio/analog-synth')">
        <div class="project-inner">
          <div class="project-visual">
            <div class="visual-box">
              <img src="images/synth.svg" alt="Synth" />
            </div>
          </div>
          <div class="project-text">
            <div class="project-tags">
              <span class="tag">Audio API</span>
              <span class="tag">MIDI API</span>
            </div>
            <h2 class="project-title">Virtual Analog Synth</h2>
            <p class="project-desc">
              Try OHM-1, a fully-featured polyphonic subtractive synthesizer
              that runs entirely in your browser. Three oscillators with
              selectable waveforms, a resonant low-pass filter with ADSR
              envelope, LFO modulation, a step sequencer, and a built-in effects
              chain — distortion, chorus, delay, reverb. Connect your MIDI
              controller for a hands-on hardware experience. No downloads, no
              installs.
            </p>
            <div class="project-cta">
              Launch synth <span class="cta-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      <!-- GUITAR PEDALBOARD -->
      <section
        class="project-row project-row--alt"
        (click)="navigate('audio/guitar-pedals')"
      >
        <div class="project-inner project-inner--reversed">
          <div class="project-text">
            <div class="project-tags">
              <span class="tag">Web Audio API</span>
            </div>
            <h2 class="project-title">Guitar Pedalboard</h2>
            <p class="project-desc">
              Plug your guitar into any audio interface and start building your
              rig directly in the browser. Stack and reorder distortion, chorus,
              delay, and reverb pedals in any combination via drag-and-drop.
              Processes your guitar signal in real-time with minimal latency. No
              app installations required — works entirely in Chrome. Use a
              dedicated audio interface for best results.
            </p>
            <div class="project-cta">
              Open pedalboard <span class="cta-arrow">→</span>
            </div>
          </div>
          <div class="project-visual">
            <div class="visual-box">
              <img src="images/pedalboard.svg" alt="Pedals" />
            </div>
          </div>
        </div>
      </section>

      <!-- CHORD CHANGER -->
      <section class="project-row" (click)="navigate('audio/chord-changer')">
        <div class="project-inner">
          <div class="project-visual">
            <div class="visual-box">
              <img src="images/chord-changer.svg" alt="Chord Changer" />
            </div>
          </div>
          <div class="project-text">
            <div class="project-tags">
              <span class="tag">Transpose</span>
              <span class="tag">PDF Export</span>
            </div>
            <h2 class="project-title">Chord Changer</h2>
            <p class="project-desc">
              Paste your song lyrics together with chord notation and instantly
              transpose the entire piece to any key. The tool automatically
              detects the current key, extracts all chords, and lets you shift
              up or down by any number of semitones. Supports all standard chord
              notations — sus, maj7, add9, slash chords. Export the result as a
              formatted PDF, ready to print or share.
            </p>
            <div class="project-cta">
              Try tool <span class="cta-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      <!-- PRACTICEJAM -->
      <section
        class="project-row project-row--alt"
        (click)="navigate('audio/practice-jam')"
      >
        <div class="project-inner project-inner--reversed">
          <div class="project-text">
            <div class="project-tags">
              <span class="tag">YouTube</span>
              <span class="tag">Loop Practice</span>
            </div>
            <h2 class="project-title">PracticeJam</h2>
            <p class="project-desc">
              Turn any YouTube video into a practice session. Save videos as
              Jams in your personal library, organize them into setlists, and
              mark the hardest passages as Phrases. Loop a Phrase over and over
              at reduced speed — from 25% up to full tempo — until you nail it.
              Built for musician playing any instrument learning from YouTube.
            </p>
            <div class="project-cta">
              Start practicing <span class="cta-arrow">→</span>
            </div>
          </div>
          <div class="project-visual">
            <div class="visual-box">
              <img src="images/practice-jam.svg" alt="PracticeJam" />
            </div>
          </div>
        </div>
      </section>

      <!-- VST PLUGINS -->
      <section class="project-row" (click)="navigate('juce')">
        <div class="project-inner">
          <div class="project-visual">
            <div class="visual-box">
              <img src="images/vst.svg" alt="VST" />
            </div>
          </div>
          <div class="project-text">
            <div class="project-tags">
              <span class="tag">C++ / JUCE</span>
              <span class="tag">.vst3 · .au</span>
            </div>
            <h2 class="project-title">VST Plugins</h2>
            <p class="project-desc">
              Native audio plugins built with the JUCE framework for
              professional DAW integration. Available as VST3 on Windows and
              AU/VST3 on macOS. Compatible with Ableton Live, FL Studio, Logic
              Pro, and other major DAWs. Download for free and use them in your
              productions. Each plugin ships with a PDF manual.
            </p>
            <div class="project-cta">
              View plugins <span class="cta-arrow">→</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      :host {
        display: block;
        width: 100%;
        background-color: #080f1c;
      }

      .portfolio-container {
        background-color: #080f1c;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
      }

      /* ── Hero ── */
      .hero-section {
        padding: 5rem 2rem 4rem;
        display: flex;
        justify-content: center;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        background: linear-gradient(180deg, #0a1628 0%, #080f1c 100%);
      }

      .hero-section::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: linear-gradient(
            rgba(102, 252, 241, 0.05) 1px,
            transparent 1px
          ),
          linear-gradient(90deg, rgba(102, 252, 241, 0.05) 1px, transparent 1px);
        background-size: 48px 48px;
        pointer-events: none;
      }

      .hero-glow {
        position: absolute;
        top: -20%;
        left: 50%;
        transform: translateX(-50%);
        width: 800px;
        height: 600px;
        background: radial-gradient(
          ellipse at center,
          rgba(102, 252, 241, 0.12) 0%,
          transparent 60%
        );
        pointer-events: none;
      }

      .hero-glow--secondary {
        top: 10%;
        left: 70%;
        width: 500px;
        height: 400px;
        background: radial-gradient(
          ellipse at center,
          rgba(255, 0, 127, 0.07) 0%,
          transparent 65%
        );
      }

      .hero-content {
        max-width: 760px;
        width: 100%;
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.5rem;
      }

      .hero-eyebrow {
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #66fcf1;
        letter-spacing: 2px;
        text-transform: uppercase;
        border: 1px solid rgba(102, 252, 241, 0.3);
        background: rgba(102, 252, 241, 0.05);
        padding: 4px 14px;
        border-radius: 20px;
      }

      .hero-title {
        font-family: 'Fira Code', monospace;
        font-size: clamp(2rem, 5vw, 3.2rem);
        font-weight: 700;
        color: #66fcf1;
        margin: 0;
        letter-spacing: 1px;
        line-height: 1.15;
      }

      .hero-lines {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        width: 100%;
        max-width: 580px;
      }

      .hero-desc {
        font-size: 20px;
        font-weight: 300;
        color: #b0bcce;
        margin: 0;
        line-height: 1.7;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        text-align: left;
      }

      .term-prompt {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        opacity: 0.45;
        margin-top: 4px;
      }

      .hero-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }

      .stack-tag {
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #c5c6c7;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.04);
        padding: 3px 10px;
        border-radius: 3px;
        letter-spacing: 0.5px;
      }

      /* ── Project rows ── */
      .project-row {
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        cursor: pointer;
        transition: background 0.25s;
      }

      .project-row:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .project-row--alt {
        background: #0d1828;
      }

      .project-row--alt:hover {
        background: #0f1e30;
      }

      .project-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 3rem 3rem;
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 5rem;
        align-items: center;
      }

      .project-inner--reversed {
        grid-template-columns: 1.6fr 1fr;
      }

      /* ── Visual box ── */
      .project-visual {
        display: flex;
        justify-content: center;
      }

      .visual-box {
        width: 240px;
        height: 240px;
        background: linear-gradient(135deg, #0f1e32 0%, #0c1626 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.25s, box-shadow 0.25s;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      }

      .project-row:hover .visual-box {
        border-color: rgba(102, 252, 241, 0.3);
        box-shadow: 0 0 50px rgba(102, 252, 241, 0.08),
          0 4px 24px rgba(0, 0, 0, 0.5);
      }

      .visual-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 18px;
      }

      /* ── Project text ── */
      .project-text {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .project-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .tag {
        font-family: 'Fira Code', monospace;
        font-size: 0.72rem;
        color: #66fcf1;
        border: 1px solid rgba(102, 252, 241, 0.3);
        background: rgba(102, 252, 241, 0.06);
        padding: 2px 8px;
        border-radius: 3px;
        letter-spacing: 0.5px;
        white-space: nowrap;
      }

      .project-title {
        font-family: 'Fira Code', monospace;
        font-size: clamp(1.4rem, 2.5vw, 1.9rem);
        font-weight: 700;
        color: #ffffff;
        margin: 0;
        letter-spacing: 0.5px;
        line-height: 1.2;
      }

      .project-desc {
        font-size: 1rem;
        font-weight: 300;
        color: #b8c5d5;
        margin: 0;
        line-height: 1.8;
      }

      .project-cta {
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        color: #45a29e;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 0.5rem;
        transition: color 0.2s;
      }

      .project-row:hover .project-cta {
        color: #66fcf1;
      }

      .cta-arrow {
        display: inline-block;
        transition: transform 0.2s;
      }

      .project-row:hover .cta-arrow {
        transform: translateX(5px);
      }

      @media (max-width: 900px) {
        .project-inner,
        .project-inner--reversed {
          grid-template-columns: 1fr;
          gap: 2.5rem;
          padding: 3rem 1.5rem;
        }

        .project-inner--reversed .project-visual {
          order: -1;
        }

        .hero-section {
          padding: 3.5rem 1.5rem 3rem;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  private readonly router = inject(Router);

  public navigate(path: string): void {
    this.router.navigateByUrl(path);
  }
}
