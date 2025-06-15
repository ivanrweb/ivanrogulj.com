import { Component, Input } from '@angular/core';

import { TileItem, TileItemComponent } from '@ivanrogulj.com/tile-item';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-tile-list',
  standalone: true,
  imports: [TileItemComponent, RouterOutlet],
  templateUrl: './tile-list.component.html',
  styleUrl: './tile-list.component.css',
})
export class TileListComponent {
  @Input()
  public items: TileItem[] = [];
}
