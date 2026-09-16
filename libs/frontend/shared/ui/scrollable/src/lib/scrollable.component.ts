import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ScrollableAxis = 'vertical' | 'horizontal' | 'both';

/**
 * Scroll container with the app's slim teal scrollbar instead of the OS default.
 * The host element is the scroller, so projected content lays out as if it were
 * a direct child of the parent.
 */
@Component({
  selector: 'lib-scrollable',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: {
    '[style.max-height]': 'maxHeight()',
    '[style.max-width]': 'maxWidth()',
    '[style.overflow-y]': "axis() === 'horizontal' ? 'hidden' : 'auto'",
    '[style.overflow-x]': "axis() === 'vertical' ? 'hidden' : 'auto'",
  },
  styles: [
    `
      :host {
        display: block;
        min-height: 0;
        min-width: 0;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: rgba(69, 162, 158, 0.2) transparent;
      }

      :host::-webkit-scrollbar {
        width: 3px;
        height: 3px;
      }

      :host::-webkit-scrollbar-track {
        background: transparent;
      }

      :host::-webkit-scrollbar-thumb {
        background: rgba(69, 162, 158, 0.15);
        border-radius: 2px;
        transition: background 0.5s ease;
      }

      :host:hover::-webkit-scrollbar-thumb {
        background: rgba(69, 162, 158, 0.6);
        transition: background 0.15s ease;
      }

      :host::-webkit-scrollbar-corner {
        background: transparent;
      }
    `,
  ],
})
export class ScrollableComponent {
  /** Any CSS length; the host scrolls once its content exceeds it. */
  public readonly maxHeight = input<string>('100%');
  public readonly maxWidth = input<string>('100%');
  public readonly axis = input<ScrollableAxis>('vertical');
}
