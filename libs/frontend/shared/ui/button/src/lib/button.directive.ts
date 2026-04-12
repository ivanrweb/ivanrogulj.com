import { Component, input, ViewEncapsulation } from '@angular/core';

export type ButtonVariant = 'primary' | 'muted' | 'danger' | 'toggle';

/**
 * Button directive — apply to any <button> element to get design-system styling.
 *
 * Variants:
 *   primary (default) — cyan border + text (confirm, save, action buttons)
 *   muted             — gray border + text (cancel, no)
 *   danger            — pink border + text (delete, destructive actions)
 *   toggle            — gray base, cyan glow when [active]="true" (mode/step buttons)
 *
 * Usage:
 *   <button libBtn>Save</button>
 *   <button libBtn variant="muted">Cancel</button>
 *   <button libBtn variant="danger">Delete</button>
 *   <button libBtn variant="toggle" [active]="isActive">Mode</button>
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[libBtn]',
  standalone: true,
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      button[libBtn] {
        background: #0b0c10;
        border: 1px solid #333;
        color: #c5c6c7;
        padding: 6px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        transition: all 0.2s;
        white-space: nowrap;
        box-sizing: border-box;

        &:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      }

      /* primary — cyan */
      button[libBtn]:not([variant]),
      button[libBtn][variant='primary'] {
        border-color: rgba(102, 252, 241, 0.4);
        color: #66fcf1;
        background: rgba(102, 252, 241, 0.05);

        &:hover:not(:disabled) {
          background: rgba(102, 252, 241, 0.12);
          border-color: #66fcf1;
          box-shadow: 0 0 8px rgba(102, 252, 241, 0.2);
        }
      }

      /* muted — gray */
      button[libBtn][variant='muted'] {
        border-color: #333;
        color: #888;
        background: transparent;

        &:hover:not(:disabled) {
          border-color: #555;
          color: #c5c6c7;
          background: rgba(255, 255, 255, 0.04);
        }
      }

      /* danger — pink */
      button[libBtn][variant='danger'] {
        border-color: rgba(255, 0, 127, 0.4);
        color: #ff007f;
        background: rgba(255, 0, 127, 0.06);

        &:hover:not(:disabled) {
          background: rgba(255, 0, 127, 0.12);
          border-color: #ff007f;
          box-shadow: 0 0 8px rgba(255, 0, 127, 0.25);
        }
      }

      /* toggle — gray base, cyan when active */
      button[libBtn][variant='toggle'] {
        background: #1f2833;
        border-color: #333;
        color: #888;

        &:hover:not(:disabled):not(.active) {
          background: #2a3545;
          color: #c5c6c7;
          border-color: #555;
        }

        &.active {
          background: rgba(102, 252, 241, 0.12);
          color: #66fcf1;
          border-color: #66fcf1;
          box-shadow: 0 0 8px rgba(102, 252, 241, 0.25);
        }
      }
    `,
  ],
  host: {
    '[attr.variant]': 'variant()',
    '[class.active]': 'active()',
  },
})
export class ButtonDirective {
  public variant = input<ButtonVariant>('primary');
  public active = input<boolean>(false);
}
