import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuitarPedalsViewModel, PedalType } from '../../viewmodel/guitar-pedals.viewmodel';
import { DistortionPedalComponent } from '../pedals/distortion-pedal.component';
import { ChorusPedalComponent } from '../pedals/chorus-pedal.component';
import { DelayPedalComponent } from '../pedals/delay-pedal.component';
import { ReverbPedalComponent } from '../pedals/reverb-pedal.component';
import { AmpComponent } from '../amp/amp.component';

interface Cable {
  id: number;
  path: string;
  color: string;
}

@Component({
  selector: 'lib-pedalboard',
  standalone: true,
  imports: [
    CommonModule,
    DistortionPedalComponent,
    ChorusPedalComponent,
    DelayPedalComponent,
    ReverbPedalComponent,
    AmpComponent,
  ],
  template: `
    @if (vm.vm$ | async; as state) {
      <div class="board" #boardEl>
        <!-- Guitar input source -->
        <div class="source-node">
          <div class="source-icon">🎸</div>
          <div class="jack-row-source">
            <span class="jack-label-small">OUT</span>
            <div class="jack jack-out"></div>
          </div>
        </div>

        <!-- Draggable pedal slots -->
        @for (pedalType of state.pedalOrder; track pedalType; let i = $index) {
          <div
            class="pedal-slot"
            [class.drag-over]="dragOverIndex === i"
            [class.is-dragging]="dragIndex === i"
            draggable="true"
            (dragstart)="onDragStart($event, i)"
            (dragover)="onDragOver($event, i)"
            (dragleave)="onDragLeave()"
            (drop)="onDrop($event, i)"
            (dragend)="onDragEnd()"
          >
            @switch (pedalType) {
              @case ('distortion') { <lib-distortion-pedal /> }
              @case ('chorus') { <lib-chorus-pedal /> }
              @case ('delay') { <lib-delay-pedal /> }
              @case ('reverb') { <lib-reverb-pedal /> }
            }
          </div>
        }

        <!-- Amp -->
        <lib-amp />

        <!-- SVG cable overlay -->
        <svg class="cable-svg" #svgEl [attr.width]="boardWidth" [attr.height]="boardHeight">
          @for (cable of cables; track cable.id) {
            <path
              [attr.d]="cable.path"
              [attr.stroke]="cable.color"
              fill="none"
              stroke-width="3"
              stroke-linecap="round"
              opacity="0.85"
            />
          }
        </svg>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .board {
        position: relative;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: stretch;
        justify-content: center;
        gap: 20px;
        padding: 10px 14px;
        background: repeating-linear-gradient(
          0deg,
          #1a1008 0px,
          #1a1008 2px,
          #1c1209 2px,
          #1c1209 20px
        );
        border: 2px solid #3a2a10;
        border-radius: 12px;
      }

      .source-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .source-icon {
        font-size: 5rem;
      }

      .jack-row-source {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #111;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 4px 6px;
      }

      .jack-label-small {
        font-size: 0.55rem;
        color: #666;
        letter-spacing: 1px;
      }

      .jack {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #888;
        border: 2px solid #555;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
      }

      .pedal-slot {
        position: relative;
        cursor: grab;
        transition:
          transform 0.15s,
          opacity 0.15s;
        border-radius: 10px;
      }

      .pedal-slot:active {
        cursor: grabbing;
      }

      .pedal-slot.is-dragging {
        opacity: 0.4;
        transform: scale(0.97);
      }

      .pedal-slot.drag-over {
        outline: 2px dashed #ffcc00;
        outline-offset: 4px;
      }

.cable-svg {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        overflow: visible;
      }
    `,
  ],
})
export class PedalboardComponent
  implements AfterViewInit, AfterViewChecked, OnInit, OnDestroy
{
  public readonly vm = inject(GuitarPedalsViewModel);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  @ViewChild('boardEl') private boardEl!: ElementRef<HTMLDivElement>;

  public cables: Cable[] = [];
  public boardWidth = 0;
  public boardHeight = 0;

  public dragIndex = -1;
  public dragOverIndex = -1;

  private cablesDirty = false;
  private resizeObserver: ResizeObserver | null = null;

  private readonly cableColors: readonly string[] = [
    '#e74c3c',
    '#3498db',
    '#f39c12',
    '#1abc9c',
  ];

  public ngOnInit(): void {
    // will init after view
  }

  public ngAfterViewInit(): void {
    this.setupResizeObserver();
    this.cablesDirty = true;
  }

  public ngAfterViewChecked(): void {
    if (this.cablesDirty) {
      this.cablesDirty = false;
      this.recalculateCables();
    }
  }

  public ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  public onDragStart(event: DragEvent, index: number): void {
    this.dragIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  public onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  public onDragLeave(): void {
    this.dragOverIndex = -1;
  }

  public onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    if (this.dragIndex !== -1 && this.dragIndex !== targetIndex) {
      this.vm.movePedal(this.dragIndex, targetIndex);
      this.cablesDirty = true;
    }
    this.dragIndex = -1;
    this.dragOverIndex = -1;
  }

  public onDragEnd(): void {
    this.dragIndex = -1;
    this.dragOverIndex = -1;
  }

  private setupResizeObserver(): void {
    if (!this.boardEl) return;
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        this.ngZone.run(() => {
          this.recalculateCables();
          this.cdr.markForCheck();
        });
      });
      this.resizeObserver.observe(this.boardEl.nativeElement);
    });
  }

  private recalculateCables(): void {
    if (!this.boardEl) return;

    const board = this.boardEl.nativeElement;
    const boardRect = board.getBoundingClientRect();
    this.boardWidth = boardRect.width;
    this.boardHeight = boardRect.height;

    const jackOuts = Array.from(
      board.querySelectorAll('.jack-out'),
    ) as HTMLElement[];
    const jackIns = Array.from(
      board.querySelectorAll('.jack-in'),
    ) as HTMLElement[];

    const count = Math.min(jackOuts.length, jackIns.length);
    this.cables = [];

    for (let i = 0; i < count; i++) {
      const outRect = jackOuts[i].getBoundingClientRect();
      const inRect = jackIns[i].getBoundingClientRect();

      const x1 = outRect.left - boardRect.left + outRect.width / 2;
      const y1 = outRect.top - boardRect.top + outRect.height / 2;
      const x2 = inRect.left - boardRect.left + inRect.width / 2;
      const y2 = inRect.top - boardRect.top + inRect.height / 2;

      const dx = Math.abs(x2 - x1) * 0.45;
      const sag = 30;
      const path = `M ${x1},${y1} C ${x1 + dx},${y1 + sag} ${x2 - dx},${y2 + sag} ${x2},${y2}`;

      this.cables.push({
        id: i,
        path,
        color: this.cableColors[i % this.cableColors.length],
      });
    }
  }
}
