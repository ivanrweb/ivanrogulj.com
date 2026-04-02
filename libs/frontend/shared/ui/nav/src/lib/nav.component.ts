import { Component, Input } from '@angular/core';

import { NavItem, NavItemComponent } from '@ivanrogulj.com/nav-item';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-nav',
  standalone: true,
  imports: [NavItemComponent, RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  @Input()
  public navItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: 'dashboard',
    },
    {
      title: 'My Projects',
      url: 'my-projects',
    },
    {
      title: 'JUCE Plugins',
      url: 'juce',
    },
  ];
}
