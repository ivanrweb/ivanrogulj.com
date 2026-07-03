import { Component, input, output } from '@angular/core';

@Component({
  selector: 'lib-confirm-dialog',
  standalone: true,
  host: { '(document:keydown.escape)': 'cancelled.emit()' },
  template: `
    <div class="overlay" (click)="cancelled.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ title() }}</h3>
          <button class="close-btn" type="button" (click)="cancelled.emit()">✕</button>
        </div>

        <p class="message">{{ message() }}</p>

        <div class="actions">
          <button class="btn" type="button" (click)="cancelled.emit()">Cancel</button>
          <button class="btn danger" type="button" (click)="confirmed.emit()">
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog {
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 1.5rem;
        width: min(420px, calc(100vw - 2rem));
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .dialog-header h3 {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        margin: 0;
        font-size: 1.1rem;
      }

      .close-btn {
        background: none;
        border: none;
        color: #888;
        font-size: 1rem;
        cursor: pointer;
      }

      .close-btn:hover {
        color: #c5c6c7;
      }

      .message {
        font-family: 'Inter', sans-serif;
        color: #c5c6c7;
        font-size: 0.9rem;
        margin: 0;
        overflow-wrap: break-word;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      .btn {
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        color: #c5c6c7;
        background: none;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 0.5rem 1.1rem;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }

      .btn:hover {
        border-color: #888;
      }

      .btn.danger {
        color: #ff007f;
        border-color: rgba(255, 0, 127, 0.4);
        background: rgba(255, 0, 127, 0.08);
      }

      .btn.danger:hover {
        border-color: #ff007f;
        background: rgba(255, 0, 127, 0.18);
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  public readonly title = input.required<string>();
  public readonly message = input.required<string>();
  public readonly confirmLabel = input<string>('Delete');

  public readonly confirmed = output<void>();
  public readonly cancelled = output<void>();
}
