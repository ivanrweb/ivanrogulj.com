import { Component, Input } from '@angular/core';

import { NavItem, NavItemComponent } from '@ivanrogulj.com/nav-item';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-nav',
  standalone: true,
  imports: [NavItemComponent, RouterLink],
  template: `
    <nav>
      <section class="items">
        @for (navItem of navItems; track navItem) {
          <lib-nav-item [routerLink]="navItem.url" [item]="navItem"></lib-nav-item>
        }
      </section>
    </nav>
  `,
  styles: [
    `
      nav {
        background-color: #fff;
        height: 60px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .items {
        width: 80%;
        margin: 0 auto;
      }

      lib-nav-item {
        margin-right: 2.5rem;
        color: #000;
      }

      lib-nav-item:hover {
        color: #808080;
        text-decoration: none;
      }

      lib-nav-item:last-child {
        margin-right: 0;
      }

      lib-nav-item.active {
        border-bottom: 2px solid #ff5722;
      }
    `,
  ],
})
export class NavComponent {
  @Input()
  public navItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: 'dashboard',
    },
    {
      title: 'Web Audio Projects',
      url: 'web-audio-projects',
    },
    {
      title: 'VST Plugins',
      url: 'juce',
    },
  ];
}
