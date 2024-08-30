import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'lib-tile-item',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './tile-item.component.html',
  styleUrl: './tile-item.component.css',
})
export class TileItemComponent {
  @Input()
  public title = '';
  @Input()
  public subtitle = '';
  @Input()
  public iconUrl = '';
}
