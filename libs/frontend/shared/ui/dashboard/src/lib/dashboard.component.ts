import { Component } from '@angular/core';

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
            Hi! My name is Ivan Rogulj and I'm a software developer and
            musician. This is a space where you can try out my online synths,
            virtual guitar rig, download my VST plugins, PureData and synth
            patches, as well as learn about various topics on audio and web
            programming in my blog articles.
          </p>
          <p class="free-badge">
            All of my projects are free for you to use and download. Enjoy!
          </p>
        </div>
      </header>

      <main class="grid-layout">
        <section class="card">
          <div class="card-icon">
            <svg
              viewBox="0 0 100 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="5" y="5" width="90" height="40" rx="4" fill="#E0E0E0" />
              <rect x="5" y="5" width="90" height="10" fill="#333333" />
              <rect
                x="10"
                y="15"
                width="10"
                height="30"
                stroke="#333"
                stroke-width="1"
              />
              <rect
                x="20"
                y="15"
                width="10"
                height="30"
                stroke="#333"
                stroke-width="1"
              />
              <rect
                x="30"
                y="15"
                width="10"
                height="30"
                stroke="#333"
                stroke-width="1"
              />
              <rect
                x="40"
                y="15"
                width="10"
                height="30"
                stroke="#333"
                stroke-width="1"
              />
              <rect
                x="50"
                y="15"
                width="10"
                height="30"
                stroke="#333"
                stroke-width="1"
              />
              <rect
                x="60"
                y="15"
                width="10"
                height="30"
                stroke="#333"
                stroke-width="1"
              />
              <rect
                x="70"
                y="15"
                width="10"
                height="30"
                stroke="#333"
                stroke-width="1"
              />
              <rect
                x="80"
                y="15"
                width="10"
                height="30"
                stroke="#333"
                stroke-width="1"
              />
              <rect x="17" y="15" width="6" height="18" fill="#1A1A1A" />
              <rect x="27" y="15" width="6" height="18" fill="#1A1A1A" />
              <rect x="47" y="15" width="6" height="18" fill="#1A1A1A" />
              <rect x="57" y="15" width="6" height="18" fill="#1A1A1A" />
              <rect x="67" y="15" width="6" height="18" fill="#1A1A1A" />
            </svg>
          </div>
          <h3>Online Synth</h3>
          <p>
            Plug & Play! Connect your MIDI device and play directly in your
            browser - no downloads required. For optimal performance, Google
            Chrome is highly recommended due to its seamless Web Audio and Web
            MIDI support. You can jump right in and play as a guest, or create a
            free account to unlock the full experience: save your custom synth
            presets and explore public patches shared by the community!
          </p>
        </section>

        <section class="card">
          <div class="card-icon">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="20"
                y="10"
                width="60"
                height="80"
                rx="8"
                fill="#e74c3c"
                stroke="#333"
                stroke-width="3"
              />
              <circle cx="35" cy="30" r="8" fill="#1A1A1A" />
              <circle cx="65" cy="30" r="8" fill="#1A1A1A" />
              <circle cx="50" cy="50" r="8" fill="#1A1A1A" />
              <circle
                cx="50"
                cy="75"
                r="6"
                fill="#E0E0E0"
                stroke="#333"
                stroke-width="2"
              />
              <circle cx="50" cy="15" r="3" fill="#ffcc00" />
            </svg>
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

        <section class="card">
          <div class="card-icon">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="15"
                y="10"
                width="70"
                height="80"
                rx="4"
                fill="#E0E0E0"
                stroke="#333"
                stroke-width="3"
              />
              <line
                x1="25"
                y1="30"
                x2="75"
                y2="30"
                stroke="#1A1A1A"
                stroke-width="4"
              />
              <line
                x1="25"
                y1="45"
                x2="65"
                y2="45"
                stroke="#1A1A1A"
                stroke-width="4"
              />
              <line
                x1="25"
                y1="60"
                x2="75"
                y2="60"
                stroke="#1A1A1A"
                stroke-width="4"
              />
              <text
                x="60"
                y="80"
                font-family="monospace"
                font-size="24"
                font-weight="bold"
                fill="#ff007f"
              >
                +/-
              </text>
            </svg>
          </div>
          <h3>Chord Changer</h3>
          <p>
            Paste your song lyrics and chords to easily transpose them. The tool
            features automatic key detection, current chords extraction, and
            'Export as PDF' option so you can save or print your song
            immediately!
          </p>
        </section>

        <section class="card">
          <div class="card-icon">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 10 C20 10, 10 40, 50 90 C90 40, 80 10, 50 10 Z"
                fill="#E0E0E0"
                stroke="#333"
                stroke-width="2"
              />
              <circle cx="50" cy="45" r="12" fill="#1A1A1A" />
              <line
                x1="42"
                y1="20"
                x2="42"
                y2="70"
                stroke="#1A1A1A"
                stroke-width="1"
              />
              <line
                x1="46"
                y1="20"
                x2="46"
                y2="70"
                stroke="#1A1A1A"
                stroke-width="1"
              />
              <line
                x1="50"
                y1="20"
                x2="50"
                y2="70"
                stroke="#1A1A1A"
                stroke-width="1"
              />
              <line
                x1="54"
                y1="20"
                x2="54"
                y2="70"
                stroke="#1A1A1A"
                stroke-width="1"
              />
              <line
                x1="58"
                y1="20"
                x2="58"
                y2="70"
                stroke="#1A1A1A"
                stroke-width="1"
              />
            </svg>
          </div>
          <h3>VST Plugins & Patches</h3>
          <p>
            VST plugins are made in C++ JUCE framework, all compatible with
            popular DAWs like Ableton, FL Studio and LogicPro - and free for
            download (.vst3 and .au extensions).
          </p>
          <p class="small-text">
            You will also find downloadable synth patches for Yamaha DX7 and
            Behringer DeepMind (.sysex extension), as well as PureData projects
            (.pd extension).
          </p>
        </section>

        <section class="card full-width">
          <div class="card-icon">
            <svg
              viewBox="0 0 100 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="5"
                y="5"
                width="90"
                height="40"
                rx="4"
                fill="#1A1A1A"
                stroke="#00E5FF"
                stroke-width="2"
              />
              <path
                d="M15 15 L25 25 L15 35"
                stroke="#FF007F"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="30"
                y1="35"
                x2="50"
                y2="35"
                stroke="#00E5FF"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
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
export class DashboardComponent {}
