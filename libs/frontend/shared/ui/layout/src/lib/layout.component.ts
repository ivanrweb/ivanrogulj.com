import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '@ivanrogulj.com/nav';
import { RouterOutlet } from '@angular/router';
import { WrapperComponent } from '@ivanrogulj.com/wrapper';
import { FooterComponent } from '@ivanrogulj.com/footer';

@Component({
  selector: 'lib-layout',
  standalone: true,
  imports: [CommonModule, NavComponent, RouterOutlet, WrapperComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
}
