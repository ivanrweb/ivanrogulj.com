import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-dashboard',
  standalone: true,
  template: `
    <div class="portfolio-container">
      <header class="hero-section">
        <div class="hero-content">
          <h1 class="glitch-title">Software & Music</h1>
          <h2 class="subtitle">Explore the intersection</h2>
          <p class="intro-text">
            Hi! My name is Ivan and I'm a software developer and musician. This
            is a space where you can try out my online synths, virtual guitar
            rig, download my custom VST plugins, PureData and synth patches, as
            well as learn about various topics on audio and web programming in
            blog articles.
          </p>
          <p class="free-badge">
            All of my projects are free for you to use and download. Enjoy!
          </p>
        </div>
      </header>

      <main class="grid-layout">
        <section
          class="card"
          (click)="navigate('web-audio-projects/analog-synth')"
        >
          <div class="card-icon">
            <img src="svg/synth.svg" alt="Online Synth" />
          </div>
          <h3>Virtual analog Synth</h3>
          <p>
            Plug & Play! Connect your MIDI device and play directly in your
            browser - no downloads required. For optimal performance, Google
            Chrome is highly recommended due to its seamless Web Audio and Web
            MIDI support. You can jump right in and play as a guest, or create a
            free account to unlock the full experience: save your custom synth
            presets and explore public patches shared by the community!
          </p>
        </section>

        <section
          class="card"
          (click)="navigate('web-audio-projects/guitar-pedals')"
        >
          <div class="card-icon">
            <img src="svg/pedal.svg" alt="Guitar Pedalboard" />
          </div>
          <h3>Guitar Pedalboard</h3>
          <p>
            Plug & Play! Experience real-time guitar effects powered by the Web
            Audio API without any installations to your device. Simply plug your
            guitar into an audio interface and start building your rig with
            virtual pedal effects right away. While you can jam without
            registering, creating a free account lets you save your custom
            pedalboard configurations and discover public tones shared by fellow
            musicians.
          </p>
        </section>

        <section
          class="card"
          (click)="navigate('web-audio-projects/chord-changer')"
        >
          <div class="card-icon">
            <img src="svg/chord-changer.svg" alt="Chord Changer" />
          </div>
          <h3>Chord Changer</h3>
          <p>
            Paste your song lyrics and chords to easily transpose them. The tool
            features automatic key detection, current chords extraction, and
            'Export as PDF' option so you can save or print your song
            immediately!
          </p>
        </section>

        <section class="card" (click)="navigate('juce')">
          <div class="card-icon">
            <img src="svg/vst.svg" alt="VST Plugins" />
          </div>
          <h3>VST Plugins</h3>
          <p>
            VST plugins are made in C++ JUCE framework, all compatible with
            popular DAWs like Ableton, FL Studio and LogicPro - and free for
            download (.vst3 and .au extensions).
          </p>
        </section>

        <section class="card" (click)="navigate('juce')">
          <div class="card-icon">
            <img src="svg/vst.svg" alt="PureData projects" />
          </div>
          <h3>PureData Projects & Patches</h3>
          <p>Downloadable PureData projects (.pd extension).</p>
        </section>

        <section class="card" (click)="navigate('articles')">
          <div class="card-icon">
            <img src="svg/blog.svg" alt="Blog" />
          </div>
          <h3>The Blog: Music & Code</h3>
          <div class="blog-content">
            <p>
              In the blog section, you will find topics on Web Audio API, JUCE
              framework (C++ based) and PureData.
            </p>
            <p>
              This blog also includes in-depth programming tutorials. Expect
              real-world coding guides, tips, and best practices in popular
              frontend and backend frameworks and libraries, including Angular,
              NestJS, RxJS, Nx and more.
            </p>
          </div>
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
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        line-height: 1.6;
      }

      .hero-section {
        background: linear-gradient(135deg, #1f2833 0%, #0b0c10 100%);
        border-bottom: 2px solid #45a29e;
        padding: 6rem 2rem;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .hero-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(69, 162, 158, 0.03) 2px,
          rgba(69, 162, 158, 0.03) 4px
        );
        pointer-events: none;
      }

      .hero-content {
        max-width: 800px;
        margin: 0 auto;
        position: relative;
        z-index: 1;
      }

      .glitch-title {
        font-family: 'Fira Code', monospace;
        font-size: 2rem;
        font-weight: 700;
        color: #66fcf1;
        margin: 0 0 1rem 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 2px 2px 0px rgba(255, 0, 127, 0.7);
      }

      .subtitle {
        font-family: 'Fira Code', monospace;
        font-size: 1.4rem;
        color: #ff007f;
        margin-bottom: 2rem;
      }

      .intro-text {
        font-size: 1.1rem;
        font-weight: 300;
        margin-bottom: 2rem;
      }

      .free-badge {
        display: inline-block;
        background-color: rgba(102, 252, 241, 0.1);
        border: 1px solid #66fcf1;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        color: #66fcf1;
      }

      .grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        max-width: 1000px;
        margin: -3rem auto 4rem auto;
        padding: 0 2rem;
        position: relative;
        z-index: 2;
      }

      .card {
        background-color: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 2rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease,
          border-color 0.3s ease;
        display: flex;
        flex-direction: column;
        cursor: pointer;
      }

      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        border-color: #ff007f;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .card-icon {
        width: 60px;
        height: 60px;
        margin-bottom: 1.5rem;
        flex-shrink: 0;
      }

      .card-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .card h3 {
        font-family: 'Fira Code', monospace;
        font-size: 1.3rem;
        color: #66fcf1;
        margin-top: 0;
        margin-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.5rem;
      }

      .card p {
        font-size: 1rem;
        font-weight: 300;
        flex-grow: 1;
      }

      .small-text {
        font-size: 0.85rem;
        color: #888;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
      }

      .blog-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
      }

      @media (max-width: 768px) {
        .glitch-title {
          font-size: 2.5rem;
        }

        .subtitle {
          font-size: 1.2rem;
        }

        .grid-layout {
          margin-top: 2rem;
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
