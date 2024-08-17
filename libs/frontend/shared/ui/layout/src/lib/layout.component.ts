import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '@ivanrogulj.com/nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-layout',
  standalone: true,
  imports: [CommonModule, NavComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
}
