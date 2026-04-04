import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export interface TileItem {
  title: string;
  description: string;
  iconUrl: string;
  path: string;
}

@Component({
  selector: 'lib-tile-item',
  standalone: true,
  template: `
    @if (item) {
      <div class="tile" (click)="navigate()">
        <div class="tile-image">
          <img [src]="item.iconUrl" [alt]="item.title" />
        </div>
        <div class="tile-content">
          <h3 class="tile-title">{{ item.title }}</h3>
          <p class="tile-description">{{ item.description }}</p>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      .tile {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        background-color: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      }

      .tile:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        border-color: #ff007f;
      }

      .tile-image {
        flex-shrink: 0;
        width: 180px;
        overflow: hidden;
        background-color: #111;
      }

      .tile-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .tile-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1.8rem 2rem;
      }

      .tile-title {
        font-family: 'Fira Code', monospace;
        font-size: 1.3rem;
        color: #66fcf1;
        margin: 0 0 1rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.5rem;
      }

      .tile-description {
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        font-weight: 300;
        color: #c5c6c7;
        margin: 0;
        line-height: 1.6;
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
