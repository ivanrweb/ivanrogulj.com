import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-wrapper',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div id="wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background-color: #0b0c10;
      }

      #wrapper {
        margin: 0 auto;
        max-width: 1600px;
      }

      @media (min-width: 1920px) {
        #wrapper {
          width: 80%;
        }
      }

      @media (max-width: 768px) {
        #wrapper {
          width: 100%;
        }
      }
    `,
  ],
})
export class WrapperComponent {}
