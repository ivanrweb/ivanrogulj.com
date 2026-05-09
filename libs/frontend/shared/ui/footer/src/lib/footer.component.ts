import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer>
      <p>Soundionic &copy; 2026</p>
    </footer>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      footer {
        width: 100%;
        height: 30px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
      }

      p {
        margin: 0;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class FooterComponent {}
