import { Component, inject, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
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
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './tile-item.component.html',
  styleUrl: './tile-item.component.css',
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
