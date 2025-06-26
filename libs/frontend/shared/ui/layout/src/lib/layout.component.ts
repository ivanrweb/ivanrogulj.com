import { Component } from '@angular/core';

import { NavComponent } from '@ivanrogulj.com/nav';
import { WrapperComponent } from '@ivanrogulj.com/wrapper';
import { FooterComponent } from '@ivanrogulj.com/footer';

@Component({
  selector: 'lib-layout',
  standalone: true,
  imports: [NavComponent, WrapperComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
}
