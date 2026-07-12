import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { AvatarComponent } from '@ivanrogulj.com/avatar';

@Component({
  selector: 'lib-about',
  standalone: true,
  imports: [AvatarComponent, NgIcon],
  template: `
    <div class="about-page">
      <section class="about-section">
        <h2 class="section-title">About me</h2>
        <div class="about-me-row">
          <div class="about-me-text">
            <p>
              Hi, my name is Ivan Rogulj. I'm a full-stack web developer with 8
              years of industry experience, focused on building scalable web
              applications and making life simpler through automation.
            </p>
            <p>
              When I'm not writing code, I'm making music. I build virtual
              synthesizers, audio effects, and plugins because there's something
              deeply satisfying about hearing your own engineering decisions
              through a pair of headphones.
            </p>
          </div>
          <lib-avatar
            class="avatar"
            [size]="140"
            initials="IR"
            src="avatar.jpeg"
          />
        </div>
        <div class="social-links">
          <a
            href="https://www.linkedin.com/in/ivan-rogulj-443839235"
            target="_blank"
            rel="noopener"
            class="social-link"
          >
            <ng-icon name="phosphorLinkedinLogo" size="1.1rem"></ng-icon>
            LinkedIn
          </a>
          <a
            href="https://github.com/irogulj"
            target="_blank"
            rel="noopener"
            class="social-link"
          >
            <ng-icon name="phosphorGithubLogo" size="1.1rem"></ng-icon>
            GitHub
          </a>
        </div>
      </section>

      <section class="about-section">
        <h2 class="section-title">Technologies</h2>
        <div class="tech-grid">
          <div class="tech-card">
            <span class="tech-name">Angular</span>
            <p class="tech-desc">
              Frontend framework used for this entire website — standalone
              components, server-side rendering, and NgRx ComponentStore for
              state management.
            </p>
          </div>

          <div class="tech-card">
            <span class="tech-name">NestJS</span>
            <p class="tech-desc">
              Backend REST API built with NestJS and TypeORM, handling
              authentication, articles, and analog synth patch storage.
            </p>
          </div>

          <div class="tech-card">
            <span class="tech-name">Web Audio API</span>
            <p class="tech-desc">
              Powers the browser-based analog synthesizer and guitar pedalboard
              — oscillators, resonant filters, ADSR envelopes, LFO modulation,
              and a full real-time effects chain (distortion, chorus, delay,
              reverb), all running natively in the browser without any audio
              libraries.
            </p>
          </div>

          <div class="tech-card">
            <span class="tech-name">Web MIDI API</span>
            <p class="tech-desc">
              Connects hardware MIDI controllers to the synthesizer — supports
              note on/off, CC learn and mapping, so any knob or key on a
              physical controller can control any parameter in real time.
            </p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2 class="section-title">Credits</h2>
        <ul class="credits-list">
          <li>
            <a
              href="https://github.com/fefanto/fontaudio"
              target="_blank"
              rel="noopener"
            >
              Font Audio
            </a>
            by fefanto — icon font for audio UI controls (knobs, sliders,
            waveforms)
          </li>
          <li>
            <a
              href="https://github.com/gleitz/midi-js-soundfonts"
              target="_blank"
              rel="noopener"
            >
              midi-js-soundfonts
            </a>
            by gleitz — MIDI soundfont samples
          </li>
        </ul>
      </section>
    </div>
  `,
  styles: [
    `
      .about-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 3rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 3rem;
      }

      .about-section {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .about-me-row {
        display: flex;
        align-items: center;
        gap: 3rem;
      }

      .about-me-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .section-title {
        font-family: 'Fira Code', monospace;
        font-size: clamp(1.1rem, 2vw, 1.4rem);
        font-weight: 500;
        letter-spacing: 1px;
        color: #66fcf1;
        margin: 0;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(102, 252, 241, 0.15);
      }

      p {
        font-family: 'Inter', sans-serif;
        font-size: 1.05rem;
        font-weight: 300;
        color: #dde1e7;
        line-height: 1.8;
        margin: 0;
      }

      .tech-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .tech-card {
        background: #2a3547;
        border: 1px solid #3d4f66;
        border-radius: 8px;
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        transition: border-color 0.15s;

        &:hover {
          border-color: rgba(102, 252, 241, 0.3);
        }
      }

      .tech-name {
        font-family: 'Fira Code', monospace;
        font-size: 1rem;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: 0.5px;
      }

      .tech-desc {
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        font-weight: 300;
        color: #888;
        line-height: 1.6;
        margin: 0;
      }

      .credits-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .credits-list li {
        display: flex;
        align-items: baseline;
        gap: 0.6rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        color: #c5c6c7;
      }

      .credits-list a {
        color: #66fcf1;
        text-decoration: none;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        white-space: nowrap;

        &:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      }

      .avatar {
        padding-top: 10px;
      }

      .social-links {
        display: flex;
        gap: 1rem;
      }

      .social-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
        color: #c5c6c7;
        text-decoration: none;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 0.6rem 1.2rem;
        transition: color 0.15s, border-color 0.15s;

        ng-icon {
          display: flex;
          align-items: center;
          font-size: 1.3rem;
        }

        &:hover {
          color: #66fcf1;
          border-color: rgba(102, 252, 241, 0.4);
        }
      }

      @media (max-width: 640px) {
        .about-me-row {
          flex-direction: column-reverse;
          align-items: flex-start;
        }

        .tech-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AboutComponent {}
