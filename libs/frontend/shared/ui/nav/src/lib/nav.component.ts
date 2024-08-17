import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavItem, NavItemComponent } from '@ivanrogulj.com/nav-item';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'lib-nav',
  standalone: true,
  imports: [CommonModule, NavItemComponent, RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent {
  @Input()
  public navItems: NavItem[] = [
    {
      title: 'Web Audio API Projects',
      url: 'audio-api-projects'
    },
    {
      title: 'JUCE Plugins',
      url: 'juce-projects'
    }
  ]
}
