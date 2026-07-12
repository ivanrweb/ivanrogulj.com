import { Component } from '@angular/core';

interface VstPlugin {
  name: string;
  description: string;
  image: string;
  downloads: {
    label: string;
    ext: string;
    platform: string;
    url: string;
  }[];
}

@Component({
  selector: 'lib-juce-project-list',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <div class="content">
        <h1 class="page-title">VST Desktop plugins for your DAW</h1>
        <p class="page-sub">
          Native audio plugins built in C++ with JUCE framework.<br />
          Download them for your platform (available for MacOS and Windows).<br />
          Compatible with Ableton, FL Studio, and Logic Pro, and other popular
          digital audio workstations.
        </p>

        @for (plugin of plugins; track plugin.name) {
        <div class="plugin-card">
          <div class="plugin-left">
            <div>
              <h2 class="plugin-name">{{ plugin.name }}</h2>
              <p class="plugin-desc">{{ plugin.description }}</p>
            </div>
            <div class="downloads">
              @for (dl of plugin.downloads; track dl.label) {
              <a
                class="download-box"
                [href]="dl.url"
                [attr.download]="dl.label"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="dl-platform">{{ dl.ext }}</span>
                <span class="dl-label">Download for {{ dl.label }}</span>
                <span class="dl-arrow">&darr;</span>
              </a>
              }
            </div>
          </div>
          <div class="plugin-right">
            <img class="plugin-img" [src]="plugin.image" [alt]="plugin.name" />
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      :host {
        display: block;
        width: 100%;
        background-color: #0b0c10;
        min-height: calc(100vh - 60px);
      }

      .page {
        padding: 4rem 2rem;
        background-color: #0b0c10;
      }

      .content {
        max-width: 1100px;
        margin: 0 auto;
      }

      .page-title {
        font-family: 'Fira Code', monospace;
        font-size: clamp(1.4rem, 2.5vw, 1.9rem);
        font-weight: 500;
        color: #66fcf1;
        margin: 0 0 0.5rem 0;
        letter-spacing: 1px;
      }

      .page-sub {
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        font-weight: 300;
        color: #888;
        margin: 0 0 3rem 0;
        line-height: 1.65;
      }

      .plugin-card {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 2rem;
        min-height: 280px;
      }

      .plugin-left {
        min-width: 0;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1.5rem;
      }

      .plugin-name {
        font-family: 'Fira Code', monospace;
        font-size: 1.3rem;
        font-weight: 700;
        color: #c5c6c7;
        margin: 0 0 0.6rem 0;
        letter-spacing: 0.5px;
      }

      .plugin-desc {
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        font-weight: 300;
        color: #888;
        margin: 0;
        line-height: 1.6;
      }

      .downloads {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .download-box {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.7rem 1rem;
        background: #0f1318;
        border: 1px solid #333;
        border-radius: 6px;
        text-decoration: none;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      }

      .download-box::before {
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

      .download-box:hover {
        border-color: #2a3545;
        background: #131920;
      }

      .download-box:hover::before {
        opacity: 1;
      }

      .dl-platform {
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        color: #66fcf1;
        letter-spacing: 0.3px;
        font-weight: 700;
        background: rgba(102, 252, 241, 0.08);
        border: 1px solid rgba(102, 252, 241, 0.3);
        border-radius: 4px;
        padding: 0.15rem 0.4rem;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .dl-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        color: #c5c6c7;
        letter-spacing: 0.3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
        flex: 1;
      }

      .dl-arrow {
        font-size: 1rem;
        color: #45a29e;
        flex-shrink: 0;
      }

      .plugin-right {
        border-left: 1px solid #2a3040;
        overflow: hidden;
      }

      .plugin-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      @media (max-width: 700px) {
        .plugin-card {
          grid-template-columns: minmax(0, 1fr);
        }
        .plugin-right {
          min-height: 200px;
          border-left: none;
          border-top: 1px solid #2a3040;
        }
        .page {
          padding: 2rem 1rem;
        }
        .downloads {
          flex-direction: column;
        }
        .download-box {
          width: 100%;
        }
      }
    `,
  ],
})
export class JuceProjectListComponent {
  protected readonly plugins: VstPlugin[] = [
    {
      name: 'Aether Reverb Plugin',
      description:
        'An algorithmic reverb plugin with pre-delay, damping, and size controls. Suitable for any mix bus or individual instrument track.',
      image: 'images/aether_reverb.png',
      downloads: [
        {
          label: 'Windows',
          ext: '.vst3',
          platform: 'Windows',
          url: 'assets/downloads/AetherReverb.vst3.zip',
        },
        {
          label: 'macOS',
          ext: '.component (AU)',
          platform: 'macOS',
          url: 'assets/downloads/AetherReverb.component.zip',
        },
      ],
    },
  ];
}
