import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChordChangerService } from '../service/chord-changer.service';
import { PdfExportService } from '../service/pdf-export.service';
import {
  SongChordsApiService,
  SongChordsDetail,
  SongChordsListItem,
} from '../service/song-chords-api.service'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DialogComponent } from '@ivanrogulj.com/dialog';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  ActionDropdownComponent,
  ActionDropdownItem,
  ActionDropdownSection,
} from '@ivanrogulj.com/action-dropdown';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ButtonDirective, BtnGroupComponent } from '@ivanrogulj.com/button';

@Component({
  selector: 'lib-chord-changer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent,
    ActionDropdownComponent,
    ButtonDirective,
    BtnGroupComponent,
  ],
  templateUrl: './chord-changer.component.html',
  styleUrl: './chord-changer.component.scss',
})
export class ChordChangerComponent {
  private readonly changerService = inject(ChordChangerService);
  private readonly pdfExportService = inject(PdfExportService);
  public readonly authService = inject(AuthService);
  public readonly router = inject(Router);
  private readonly songChordsApiService = inject(SongChordsApiService);

  public readonly negativeSteps: readonly number[] = [-6, -5, -4, -3, -2, -1];
  public readonly positiveSteps: readonly number[] = [1, 2, 3, 4, 5, 6];

  public inputText = signal<string>('');
  public currentOffset = signal<number>(0);
  public outputText = signal<string>('');
  public songs = signal<SongChordsListItem[]>([]);
  public activeSong = signal<SongChordsDetail | null>(null);
  public mode = signal<'transpose' | 'read'>('transpose');
  public saveTitleInput = signal<string>('');
  public showSaveInput = signal<boolean>(false);
  public savedSuccess = signal<boolean>(false);
  public showDeleteDialog = signal<boolean>(false);
  public pendingDeleteId = '';
  public pendingDeleteTitle = '';
  public readTitle = signal<string>('');
  public readContent = signal<string>('');

  public analysis = computed(() =>
    this.changerService.processText(this.inputText(), this.currentOffset())
  );

  public songSections = computed<ActionDropdownSection[]>(() => [
    { items: this.songs().map((s) => ({ id: s.id, name: s.title })), deletable: true },
  ]);

  constructor() {
    effect(() => {
      this.outputText.set(this.analysis().transposedText);
    });
    if (this.authService.currentUser()) {
      this.loadMySongs();
    }
  }

  public setOffset(step: number): void {
    this.currentOffset.set(step);
  }

  public setMode(m: 'transpose' | 'read'): void {
    this.mode.set(m);
  }

  public exportPdf(): void {
    this.pdfExportService.exportText(
      this.mode() === 'read' ? this.readContent() : this.outputText()
    );
  }

  public loadMySongs(): void {
    this.songChordsApiService.getMySongs().subscribe((result) => {
      this.songs.set(result);
    });
  }

  public onSongSelected(item: ActionDropdownItem): void {
    this.songChordsApiService.getSong(item.id).subscribe((detail) => {
      this.activeSong.set(detail);
      this.readTitle.set(detail.title);
      this.readContent.set(detail.content);
      this.mode.set('read');
    });
  }

  public onSongDeleted(id: string): void {
    const song = this.songs().find((s) => s.id === id);
    this.pendingDeleteId = id;
    this.pendingDeleteTitle = song?.title ?? '';
    this.showDeleteDialog.set(true);
  }

  public confirmDelete(): void {
    const id = this.pendingDeleteId;
    this.songChordsApiService.deleteSong(id).subscribe(() => {
      this.songs.update((list) => list.filter((s) => s.id !== id));
      if (this.activeSong()?.id === id) {
        this.activeSong.set(null);
        this.mode.set('transpose');
      }
      this.showDeleteDialog.set(false);
      this.pendingDeleteId = '';
      this.pendingDeleteTitle = '';
    });
  }

  public cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.pendingDeleteId = '';
    this.pendingDeleteTitle = '';
  }

  public onSaveSongClick(): void {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showSaveInput.set(true);
  }

  public confirmSaveSong(): void {
    const title = this.saveTitleInput().trim();
    if (!title) {
      return;
    }
    this.songChordsApiService
      .saveSong(title, this.outputText())
      .subscribe((result) => {
        this.songs.update((list) => [result, ...list]);
        this.saveTitleInput.set('');
        this.savedSuccess.set(true);
        setTimeout(() => {
          this.savedSuccess.set(false);
          this.showSaveInput.set(false);
        }, 1500);
      });
  }

  public saveChanges(): void {
    const song = this.activeSong();
    if (!song) {
      return;
    }
    this.songChordsApiService
      .updateSong(song.id, this.readTitle(), this.readContent())
      .subscribe((updated) => {
        this.songs.update((list) =>
          list.map((s) => (s.id === updated.id ? updated : s))
        );
      });
  }
}
