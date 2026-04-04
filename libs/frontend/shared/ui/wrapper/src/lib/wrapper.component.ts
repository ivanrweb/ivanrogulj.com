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
      #wrapper {
        margin: 2rem auto;
        width: 95%;
        max-width: 1600px;
      }

      @media (min-width: 1920px) {
        #wrapper {
          width: 80%;
        }
      }

      @media (max-width: 768px) {
        #wrapper {
          margin: 0 auto;
          width: 100%;
        }
      }
    `,
  ],
})
export class WrapperComponent {}
