import { Component } from '@angular/core';

@Component({
  selector: 'lib-patreon',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <div class="content">
        <h1 class="title">Support the Work</h1>
        <p class="desc">
          Creating web audio software, lessons and articles take time.<br />You
          can support this channel by becoming a Patron if you enjoy our
          content.<br />
          Every new subscriber helps us making more quality content and keeping
          this company going.<br /><br />Thank you!
        </p>
        <a
          class="patreon-card"
          href="https://patreon.com/IvanRogulj"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="card-inner">
            <div class="card-left">
              <div class="patreon-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.82 2.41C18.78 2.41 22 5.65 22 9.62c0 3.96-3.22 7.19-7.18 7.19-3.95 0-7.17-3.23-7.17-7.19 0-3.97 3.22-7.21 7.17-7.21M2 21.6h3.5V2.41H2V21.6z"
                  />
                </svg>
              </div>
              <div class="card-text">
                <span class="card-title">Soundionic</span>
                <span class="card-sub">patreon.com/Soundionic</span>
              </div>
            </div>
            <div class="cta">Become a Patron &rarr;</div>
          </div>
          <div class="card-glow"></div>
        </a>
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
        padding: 4rem 2rem 2rem;
        background-color: #0b0c10;
        text-align: center;
      }

      .content {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
      }

      .title {
        font-family: 'Fira Code', monospace;
        font-size: 2rem;
        font-weight: 400;
        color: #66fcf1;
        margin: 0;
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      .desc {
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        font-weight: 300;
        color: #888;
        line-height: 1.75;
        margin: 0 0 1.25rem;
      }

      .patreon-card {
        display: block;
        margin-top: 1rem;
        width: 100%;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 1.75rem 2rem;
        text-decoration: none;
        position: relative;
        overflow: hidden;
        transition: border-color 0.25s, background 0.25s;
      }

      .patreon-card:hover {
        border-color: #ff424d;
        background: #22202a;
      }

      .patreon-card:hover .card-glow {
        opacity: 1;
      }

      .patreon-card:hover .cta {
        color: #ff424d;
      }

      .card-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(
          ellipse at 50% 0%,
          rgba(255, 66, 77, 0.12) 0%,
          transparent 70%
        );
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.25s;
      }

      .card-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        position: relative;
        z-index: 1;
      }

      .card-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .patreon-icon {
        width: 40px;
        height: 40px;
        color: #ff424d;
        flex-shrink: 0;
      }

      .patreon-icon svg {
        width: 100%;
        height: 100%;
      }

      .card-text {
        display: flex;
        flex-direction: column;
        gap: 3px;
        text-align: left;
      }

      .card-title {
        font-family: 'Fira Code', monospace;
        font-size: 1rem;
        font-weight: 700;
        color: #c5c6c7;
        letter-spacing: 0.5px;
      }

      .card-sub {
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #888;
        letter-spacing: 0.5px;
      }

      .cta {
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        color: #c5c6c7;
        letter-spacing: 0.5px;
        white-space: nowrap;
        transition: color 0.25s;
      }

      @media (max-width: 480px) {
        .card-inner {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class PatreonComponent {}
