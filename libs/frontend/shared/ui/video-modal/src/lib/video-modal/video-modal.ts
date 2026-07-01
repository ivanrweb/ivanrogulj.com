import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'lib-video-modal',
  standalone: true,
  template: `
    @if (videoUrl()) {
    <div class="vm-backdrop" (click)="close()"></div>

    <div class="vm-container" (click)="$event.stopPropagation()">
      <button class="vm-close" (click)="close()" aria-label="Close video">✕</button>

      <div class="vm-player">
        <video [src]="videoUrl()!" controls autoplay></video>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .vm-backdrop {
        position: fixed;
        inset: 0;
        z-index: 10100;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(4px);
        cursor: pointer;
      }

      .vm-container {
        position: fixed;
        z-index: 10101;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(90vw, 960px);
        background: #1f2833;
        border: 1px solid rgba(102, 252, 241, 0.25);
        border-radius: 10px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
        overflow: hidden;
      }

      .vm-close {
        position: absolute;
        top: 10px;
        right: 12px;
        z-index: 1;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: #c5c6c7;
        font-size: 0.85rem;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;

        &:hover {
          background: rgba(102, 252, 241, 0.15);
          color: #66fcf1;
          border-color: rgba(102, 252, 241, 0.4);
        }
      }

      .vm-player {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;

        video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
      }
    `,
  ],
})
export class VideoModalComponent {
  public readonly videoUrl = input<string | null>(null);

  public readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  public close(): void {
    this.closed.emit();
  }
}
