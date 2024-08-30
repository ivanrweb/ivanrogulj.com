import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileItemComponent } from '@ivanrogulj.com/tile-item';

@Component({
  selector: 'lib-tile-list',
  standalone: true,
  imports: [CommonModule, TileItemComponent],
  templateUrl: './tile-list.component.html',
  styleUrl: './tile-list.component.css',
})
export class TileListComponent {
  @Input()
  public items: TileItemComponent[] = [
    {
      title: 'Test Title',
      subtitle: 'Test subtitle',
      iconUrl: 'https://images.unsplash.com/photo-1721332149346-00e39ce5c24f?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ];
}
