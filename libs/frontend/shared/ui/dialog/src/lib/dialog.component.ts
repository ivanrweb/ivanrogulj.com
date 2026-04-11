import { Component, input, output } from '@angular/core';

@Component({
  selector: 'lib-dialog',
  standalone: true,
  template: `
    <div class="dialog-backdrop" (click)="!lockClose() && closed.emit()">
      <div class="dialog-card" (click)="$event.stopPropagation()">
        @if (title()) {
          <h4 class="dialog-title">{{ title() }}</h4>
        }
        <ng-content />
        <div class="dialog-actions">
          <ng-content select="[dialogActions]" />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .dialog-card {
        background: #1f2833;
        border: 1px solid #66fcf1;
        border-radius: 8px;
        padding: 24px;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
        animation: dialog-fade-in 0.2s ease-out;
      }

      @keyframes dialog-fade-in {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .dialog-title {
        margin: 0;
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        font-weight: 700;
        color: #66fcf1;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .dialog-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class DialogComponent {
  public title = input<string>('');
  /** Prevent closing when backdrop is clicked (e.g. during a success/loading state) */
  public lockClose = input<boolean>(false);
  public closed = output<void>();
}
