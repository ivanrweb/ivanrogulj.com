import { Component, Input } from '@angular/core';

import { RouterLink } from '@angular/router';
import { NavItem } from './nav-item.interface';

@Component({
  selector: 'lib-nav-item',
  standalone: true,
  imports: [RouterLink],
  template: `<a [routerLink]="item.url">{{ item.title }}</a>`,
  styles: [
    `
      a {
        color: #000;
        text-decoration: none;
        font-size: 16px;
        font-weight: bold;
        transition: color 0.1s ease;
      }

      a:hover {
        color: #808080;
      }
    `,
  ],
})
export class NavItemComponent {
  @Input()
  public item: NavItem = { title: '', url: '' };
}
