import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '@ivanrogulj.com/nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-wrapper',
  standalone: true,
  imports: [CommonModule, NavComponent, RouterOutlet],
  templateUrl: './wrapper.component.html',
  styleUrl: './wrapper.component.scss',
})
export class WrapperComponent {}
