import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export interface TileItem {
  title: string;
  subtitle: string;
  iconUrl: string;
  path: string;
}

@Component({
  selector: 'lib-tile-item',
  standalone: true,
  template: `
    @if (item) {
      <div class="tile" (click)="navigate()">
        @if (item.iconUrl) {
          <img [src]="item.iconUrl" alt="Tile Icon" class="tile-icon">
        }
        <div class="tile-content">
          <h3 class="tile-title">{{ item.title }}</h3>
          <p class="tile-subtitle">{{ item.subtitle }}</p>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 200px;
        height: 200px;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        background-color: #f9f9f9;
      }

      .tile-icon {
        width: 100%;
        height: 50%;
        object-fit: cover;
      }

      .tile-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 50%;
        text-align: center;
        padding: 5px;
      }

      .tile-title {
        margin: 0;
        font-size: 1.1em;
        font-weight: bold;
      }

      .tile-subtitle {
        margin: 5px 0 0 0;
        color: #666;
        font-size: 0.9em;
      }
    `,
  ],
})
export class TileItemComponent {
  @Input()
  public item?: TileItem;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public navigate(): void {
    if (this.item?.path) {
      this.router.navigate([this.item.path], { relativeTo: this.route });
    }
  }
}
