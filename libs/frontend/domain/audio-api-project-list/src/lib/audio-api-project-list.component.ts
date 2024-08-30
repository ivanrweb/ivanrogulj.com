import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileListComponent } from '@ivanrogulj.com/tile-list';

@Component({
  selector: 'lib-audio-api-project-list',
  standalone: true,
  imports: [CommonModule, TileListComponent],
  templateUrl: './audio-api-project-list.component.html',
  styleUrl: './audio-api-project-list.component.scss',
})
export class AudioApiProjectListComponent {}
