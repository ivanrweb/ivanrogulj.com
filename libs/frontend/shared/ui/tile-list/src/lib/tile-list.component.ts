import { Component, Input } from '@angular/core';

import { TileItem, TileItemComponent } from '@ivanrogulj.com/tile-item';

@Component({
  selector: 'lib-tile-list',
  standalone: true,
  imports: [TileItemComponent],
  template: `
    <div class="tile-list">
      @for (item of items; track item) {
        <lib-tile-item [item]="item"></lib-tile-item>
      }
    </div>
  `,
  styles: [
    `
      .tile-list {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin: 0;
        padding: 0;
      }

      .tile {
        flex: 1 1 calc(33.333% - 16px);
        box-sizing: border-box;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        background-color: #fff;
      }
    `,
  ],
})
export class TileListComponent {
  @Input()
  public items: TileItem[] = [];
}
