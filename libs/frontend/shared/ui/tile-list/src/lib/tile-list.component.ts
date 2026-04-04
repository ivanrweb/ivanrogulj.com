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
        flex-direction: column;
        gap: 1.5rem;
      }
    `,
  ],
})
export class TileListComponent {
  @Input()
  public items: TileItem[] = [];
}
