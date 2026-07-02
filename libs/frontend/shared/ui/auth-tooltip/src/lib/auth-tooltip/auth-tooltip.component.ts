import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-auth-tooltip',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="tooltip-wrapper">
      <ng-content></ng-content>
      <div class="auth-tooltip">
        <span class="msg">login required</span>
        <div class="links">
          <a routerLink="/login">login</a>
          <span class="sep">/</span>
          <a routerLink="/register">register</a>
        </div>
        <div class="arrow"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .tooltip-wrapper {
        position: relative;
        display: inline-flex;
      }

      .auth-tooltip {
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        background: #1f2833;
        border: 1px solid #45a29e;
        border-radius: 6px;
        padding: 8px 12px;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        z-index: 9999;
      }

      .tooltip-wrapper:hover .auth-tooltip {
        opacity: 1;
        pointer-events: auto;
      }

      .msg {
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        color: #888;
        letter-spacing: 0.5px;
      }

      .links {
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
      }

      .links a {
        color: #66fcf1;
        text-decoration: none;
        padding: 4px 8px;
        border: 1px solid rgba(102, 252, 241, 0.3);
        border-radius: 4px;
        transition: background 0.15s;
      }

      .links a:hover {
        background: rgba(102, 252, 241, 0.1);
        border-color: #66fcf1;
      }

      .sep {
        color: #555;
      }

      .arrow {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: #45a29e;
      }

      .auth-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        height: 12px;
      }
    `,
  ],
})
export class AuthTooltipComponent {}
