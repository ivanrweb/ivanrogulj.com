import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AvatarComponent } from '@ivanrogulj.com/avatar';

@Component({
  selector: 'lib-dashboard',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <div class="portfolio-container">
      <header class="hero-section">
        <div class="hero-content">
          <div class="hero-meta">
            <span class="hero-tag">// ivan rogulj</span>
            <span class="hero-divider">·</span>
            <span class="hero-tag">software engineer</span>
            <span class="hero-divider">·</span>
            <span class="hero-tag">musician</span>
          </div>
          <h1 class="hero-title">Explore Software &amp; Music intersection</h1>
          <div class="hero-body">
            <div class="hero-lines">
              <p class="hero-desc">
                <img
                  class="term-prompt"
                  src="svg/terminal.svg"
                  alt=""
                />Browser-based audio tools built on the Web Audio API — synths,
                effects, and utilities.
              </p>
              <p class="hero-desc">
                <img class="term-prompt" src="svg/terminal.svg" alt="" />VST
                plugins (C++/JUCE) and PureData patches.
              </p>
              <p class="hero-desc">
                <img class="term-prompt" src="svg/terminal.svg" alt="" />Learn
                about audio and tech in blog articles.
              </p>
              <p class="hero-desc">
                <img
                  class="term-prompt"
                  src="svg/terminal.svg"
                  alt=""
                />Everything is free.
              </p>
            </div>
            <lib-avatar [size]="200" initials="IR" src="avatar.jpg" />
          </div>
          <div class="hero-stack">
            <span class="stack-tag">Web Audio API</span>
            <span class="stack-tag">MIDI</span>
            <span class="stack-tag">DSP</span>
            <span class="stack-tag">JUCE Framework (C++)</span>
            <span class="stack-tag">PureData</span>
            <span class="stack-tag">Angular</span>
            <span class="stack-tag">NestJS</span>
          </div>
        </div>
      </header>

      <main class="grid-layout">
        <section
          class="card"
          (click)="navigate('web-audio-projects/analog-synth')"
        >
          <div class="card-top">
            <div class="card-icon"><img src="svg/synth.svg" alt="Synth" /></div>
            <div class="card-tags">
              <span class="tag">Web Audio API</span>
              <span class="tag">MIDI</span>
            </div>
          </div>
          <h3 class="card-title">Virtual Analog Synth</h3>
          <p class="card-desc">
            Polyphonic subtractive synth with oscillators, filter, ADSR, LFO
            modulation, step sequencer, and effects chain. Runs in-browser,
            MIDI-ready.
          </p>
        </section>

        <section
          class="card"
          (click)="navigate('web-audio-projects/guitar-pedals')"
        >
          <div class="card-top">
            <div class="card-icon">
              <img src="svg/pedal.svg" alt="Pedals" />
            </div>
            <div class="card-tags">
              <span class="tag">Web Audio API</span>
            </div>
          </div>
          <h3 class="card-title">Guitar Pedalboard</h3>
          <p class="card-desc">
            Real-time guitar effects via audio interface input. Distortion,
            chorus, delay, reverb — reorderable, low-latency, no installations.
          </p>
        </section>

        <section
          class="card"
          (click)="navigate('web-audio-projects/chord-changer')"
        >
          <div class="card-top">
            <div class="card-icon">
              <img src="svg/chord-changer.svg" alt="Chord Changer" />
            </div>
            <div class="card-tags">
              <span class="tag">Transpose</span>
            </div>
          </div>
          <h3 class="card-title">Chord Changer</h3>
          <p class="card-desc">
            Paste lyrics with chord notation, transpose to any key, detect
            probable keys and chord progressions, export to PDF.
          </p>
        </section>

        <section class="card" (click)="navigate('juce')">
          <div class="card-top">
            <div class="card-icon"><img src="svg/vst.svg" alt="VST" /></div>
            <div class="card-tags">
              <span class="tag">C++ / JUCE</span>
              <span class="tag">.vst3 · .au</span>
            </div>
          </div>
          <h3 class="card-title">VST Plugins</h3>
          <p class="card-desc">
            Native audio plugins built with the JUCE framework. Compatible with
            Ableton, FL Studio, and Logic Pro. Free download.
          </p>
        </section>

        <section class="card" (click)="navigate('juce')">
          <div class="card-top">
            <div class="card-icon">
              <img src="svg/puredata.svg" alt="PureData" />
            </div>
            <div class="card-tags">
              <span class="tag">PureData</span>
              <span class="tag">.pd</span>
            </div>
          </div>
          <h3 class="card-title">PureData Patches</h3>
          <p class="card-desc">
            Downloadable PureData projects — signal processing experiments and
            generative audio patches.
          </p>
        </section>

        <section class="card" (click)="navigate('articles')">
          <div class="card-top">
            <div class="card-icon"><img src="svg/blog.svg" alt="Blog" /></div>
            <div class="card-tags">
              <span class="tag">Tech</span>
              <span class="tag">Audio</span>
            </div>
          </div>
          <h3 class="card-title">Blog — Music &amp; Code</h3>
          <p class="card-desc">
            Technical writing on Web Audio API, JUCE, PureData, and web
            development. Angular, NestJS, RxJS, Nx — real-world guides and best
            practices.
          </p>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      :host {
        display: block;
        width: 100%;
        background-color: #0b0c10;
      }

      .portfolio-container {
        background-color: #0b0c10;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
        min-height: 100vh;
        line-height: 1.6;
      }

      /* ── Hero ── */
      .hero-section {
        border-bottom: 1px solid #1f2833;
        padding: 5rem 2rem 4rem;
        position: relative;
        overflow: hidden;
      }

      .hero-section::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: linear-gradient(
            rgba(102, 252, 241, 0.1) 1px,
            transparent 1px
          ),
          linear-gradient(90deg, rgba(102, 252, 241, 0.1) 1px, transparent 1px);
        background-size: 40px 40px;
        pointer-events: none;
      }

      .hero-content {
        max-width: 860px;
        margin: 0 auto;
        position: relative;
        z-index: 1;
      }

      .hero-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 1.5rem;
      }

      .hero-tag {
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        color: #888;
        letter-spacing: 1px;
      }

      .hero-divider {
        color: #555;
        font-size: 1.4rem;
        line-height: 1;
      }

      .hero-title {
        font-family: 'Fira Code', monospace;
        font-size: clamp(1.5rem, 2rem, 2.5rem);
        font-weight: 700;
        color: #66fcf1;
        margin: 0 0 1.25rem 0;
        letter-spacing: 1px;
        line-height: 1.1;
      }

      .hero-body {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 3rem;
        margin-bottom: 2rem;
      }

      .hero-lines {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .hero-desc {
        font-size: 1.15rem;
        font-weight: 300;
        color: #888;
        max-width: 600px;
        margin: 0 0 0.6rem 0;
        line-height: 1.7;
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .term-prompt {
        width: 30px;
        height: 30px;
        flex-shrink: 0;
        opacity: 0.6;
        margin-top: 2px;
      }

      .hero-stack {
        margin-top: 1.6rem;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .stack-tag {
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        color: #45a29e;
        border: 1px solid rgba(69, 162, 158, 0.3);
        padding: 3px 10px;
        border-radius: 3px;
        letter-spacing: 0.5px;
      }

      /* ── Grid ── */
      .grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1px;
        max-width: 1100px;
        margin: 3rem auto;
        padding: 0 2rem;
      }

      /* ── Card ── */
      .card {
        background: #0f1318;
        border: 1px solid #1a2030;
        border-radius: 6px;
        padding: 1.5rem;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        transition: border-color 0.2s, background 0.2s;
        position: relative;
        overflow: hidden;
      }

      .card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #66fcf1;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .card:hover {
        border-color: #2a3545;
        background: #131920;
      }

      .card:hover::before {
        opacity: 1;
      }

      .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .card-icon {
        width: 42px;
        height: 42px;
        flex-shrink: 0;
      }

      .card-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: grayscale(1);
      }

      .card-tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .tag {
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        color: #66fcf1;
        border: 1px solid rgba(102, 252, 241, 0.2);
        padding: 2px 7px;
        border-radius: 3px;
        letter-spacing: 0.5px;
        white-space: nowrap;
      }

      .card-title {
        font-family: 'Fira Code', monospace;
        font-size: 1.2rem;
        font-weight: 700;
        color: #c5c6c7;
        margin: 0;
        letter-spacing: 0.5px;
      }

      .card-desc {
        font-size: 1rem;
        font-weight: 300;
        color: #888;
        margin: 0;
        line-height: 1.65;
      }

      @media (max-width: 768px) {
        .hero-section {
          padding: 3rem 1.5rem;
        }
        .grid-layout {
          padding: 0 1rem;
          margin: 2rem auto;
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
