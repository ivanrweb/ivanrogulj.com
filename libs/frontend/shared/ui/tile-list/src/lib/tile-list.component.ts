import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileItem, TileItemComponent } from '@ivanrogulj.com/tile-item';

@Component({
  selector: 'lib-tile-list',
  standalone: true,
  imports: [CommonModule, TileItemComponent],
  templateUrl: './tile-list.component.html',
  styleUrl: './tile-list.component.css',
})
export class TileListComponent {
  @Input()
  public items: TileItem[] = [];
}
