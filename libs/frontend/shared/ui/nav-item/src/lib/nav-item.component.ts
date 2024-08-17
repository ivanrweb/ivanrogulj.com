import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavItem } from './nav-item.interface';

@Component({
  selector: 'lib-nav-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent {
  @Input()
  public item: NavItem = { title: '', url: '' };
}
