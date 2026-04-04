import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from './nav-item.interface';

@Component({
  selector: 'lib-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a [routerLink]="item.url" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.url === '' || item.url === 'dashboard' ? false : false }">
      {{ item.title }}
    </a>
  `,
  styles: [
    `
      a {
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        color: #c5c6c7;
        text-decoration: none;
        letter-spacing: 0.5px;
        padding: 0.3rem 0;
        position: relative;
        transition: color 0.2s ease;
      }

      a::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background-color: #66fcf1;
        transition: width 0.2s ease;
      }

      a:hover {
        color: #66fcf1;
      }

      a:hover::after {
        width: 100%;
      }

      a.active {
        color: #66fcf1;
      }

      a.active::after {
        width: 100%;
      }
    `,
  ],
})
export class NavItemComponent {
  @Input()
  public item: NavItem = { title: '', url: '' };
}
