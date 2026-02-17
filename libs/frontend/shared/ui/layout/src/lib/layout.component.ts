import { Component } from '@angular/core';
import { NavComponent } from '@ivanrogulj.com/nav';
import { WrapperComponent } from '@ivanrogulj.com/wrapper';
import { FooterComponent } from '@ivanrogulj.com/footer';

@Component({
  selector: 'lib-layout',
  standalone: true,
  imports: [NavComponent, WrapperComponent, FooterComponent],
  template: `
    <div class="layout-container">
      <lib-nav></lib-nav>
      <lib-wrapper class="content-area"></lib-wrapper>
      <lib-footer></lib-footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .layout-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100%;
      }

      .content-area {
        flex: 1; /* wrapper takes rest of the space */
        display: block;
        width: 100%;
      }

      lib-footer {
        flex-shrink: 0;
      }
    `,
  ],
})
export class LayoutComponent {}
