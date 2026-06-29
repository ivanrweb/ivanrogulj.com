import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { TourStep } from './tour-step.interface';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPos {
  top: number;
  left: number;
  transformOrigin: string;
}

const PADDING = 8;
const TOOLTIP_WIDTH = 310;
const TOOLTIP_GAP = 14;

@Component({
  selector: 'lib-tour',
  standalone: true,
  template: `
    @if (isVisible()) {
      <!-- backdrop -->
      <div class="tour-backdrop" (click)="onBackdropClick()"></div>

      <!-- spotlight cutout -->
      <div
        class="tour-spotlight"
        [style.top.px]="spotlight().top"
        [style.left.px]="spotlight().left"
        [style.width.px]="spotlight().width"
        [style.height.px]="spotlight().height"
      ></div>

      <!-- tooltip -->
      <div
        class="tour-tooltip"
        [style.top.px]="tooltipPos().top"
        [style.left.px]="tooltipPos().left"
      >
        <div class="tour-tooltip__progress">
          <span class="tour-tooltip__step">{{ progress() }}</span>
        </div>

        <div class="tour-tooltip__divider"></div>

        <h3 class="tour-tooltip__title">{{ currentStep().title }}</h3>

        <p class="tour-tooltip__content">{{ currentStep().content }}</p>

        <div class="tour-tooltip__actions">
          @if (!isFirst()) {
            <button class="tour-btn tour-btn--secondary" (click)="prev()">← Back</button>
          } @else {
            <span></span>
          }
          @if (isLast()) {
            <button class="tour-btn tour-btn--primary" (click)="finish()">Finish ✓</button>
          } @else {
            <button class="tour-btn tour-btn--primary" (click)="next()">Next →</button>
          }
        </div>

        <div class="tour-tooltip__dismiss">
          <button class="tour-tooltip__never" (click)="skip()">Skip tour</button>
          <button class="tour-tooltip__never" (click)="neverShow()">Don't show this tour again</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .tour-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9998;
      cursor: default;
    }

    .tour-spotlight {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      border-radius: 8px;
      border: 2px solid #66fcf1;
      box-shadow:
        0 0 0 9999px rgba(0, 0, 0, 0.78),
        0 0 20px rgba(102, 252, 241, 0.3);
      transition: top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease;
    }

    .tour-tooltip {
      position: fixed;
      z-index: 10000;
      width: ${TOOLTIP_WIDTH}px;
      background: #111c2a;
      border: 1px solid rgba(102, 252, 241, 0.25);
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.04);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: top 0.25s ease, left 0.25s ease, bottom 0.25s ease, right 0.25s ease;
    }

    .tour-tooltip__progress {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tour-tooltip__step {
      font-family: 'Fira Code', monospace;
      font-size: 0.7rem;
      color: #66fcf1;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .tour-tooltip__dismiss {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .tour-tooltip__never {
      background: none;
      border: none;
      font-family: 'Fira Code', monospace;
      font-size: 0.7rem;
      color: #667;
      cursor: pointer;
      padding: 0;
      text-align: left;
      transition: color 0.15s;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: rgba(255,255,255,0.2);

      &:hover { color: #9ba3af; text-decoration-color: rgba(255,255,255,0.4); }
    }

    .tour-tooltip__divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
    }

    .tour-tooltip__title {
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      letter-spacing: 0.5px;
    }

    .tour-tooltip__content {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      color: #9baab8;
      margin: 0;
      line-height: 1.65;
    }

    .tour-tooltip__actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.25rem;
    }

    .tour-btn {
      font-family: 'Fira Code', monospace;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      padding: 6px 14px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.15s, color 0.15s;
    }

    .tour-btn--primary {
      background: rgba(102, 252, 241, 0.1);
      border-color: rgba(102, 252, 241, 0.35);
      color: #66fcf1;

      &:hover { background: rgba(102, 252, 241, 0.18); }
    }

    .tour-btn--secondary {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.2);
      color: #9ba3af;

      &:hover { color: #ffffff; border-color: rgba(255,255,255,0.4); }
    }
  `],
})
export class TourComponent implements OnDestroy {
  readonly steps = input.required<TourStep[]>();
  // Optional localStorage key — if set, tour won't auto-show after completion
  readonly storageKey = input<string>('');

  readonly completed = output<void>();
  readonly skipped = output<void>();

  protected readonly isVisible = signal(false);
  private readonly currentIndex = signal(0);

  protected readonly currentStep = computed(() => this.steps()[this.currentIndex()]);
  protected readonly isFirst = computed(() => this.currentIndex() === 0);
  protected readonly isLast = computed(() => this.currentIndex() === this.steps().length - 1);
  protected readonly progress = computed(
    () => `Step ${this.currentIndex() + 1} of ${this.steps().length}`
  );

  protected readonly spotlight = signal<SpotlightRect>({ top: 0, left: 0, width: 0, height: 0 });
  protected readonly tooltipPos = signal<TooltipPos>({ top: -9999, left: -9999, transformOrigin: 'top left' });

  private readonly resizeObserver: ResizeObserver;

  constructor() {
    effect(() => {
      const step = this.currentStep();
      if (!this.isVisible() || !step) return;
      // rAF ensures the target is rendered (matters for @if blocks)
      requestAnimationFrame(() => this.reposition(step));
    });

    this.resizeObserver = new ResizeObserver(() => {
      const step = this.currentStep();
      if (this.isVisible() && step) this.reposition(step);
    });
    this.resizeObserver.observe(document.documentElement);
  }

  public start(): void {
    this.currentIndex.set(0);
    this.isVisible.set(true);
  }

  protected next(): void {
    this.currentIndex.update(i => i + 1);
  }

  protected prev(): void {
    this.currentIndex.update(i => i - 1);
  }

  protected skip(): void {
    this.close();
    this.skipped.emit();
  }

  protected neverShow(): void {
    this.close();
    this.skipped.emit();
    if (this.storageKey()) {
      localStorage.setItem(this.storageKey(), 'done');
    }
  }

  protected finish(): void {
    this.close();
    this.completed.emit();
    if (this.storageKey()) {
      localStorage.setItem(this.storageKey(), 'done');
    }
  }

  protected onBackdropClick(): void {
    // clicking outside does nothing — user must use Next/Skip
  }

  private close(): void {
    this.isVisible.set(false);
  }

  private reposition(step: TourStep): void {
    const target = document.querySelector(step.targetSelector);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const TOOLTIP_H = 230;

    this.spotlight.set({
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    });

    // Always use top+left (never bottom/right CSS) so clamping is straightforward
    const cx = rect.left + rect.width / 2;
    const clampedLeft = Math.max(12, Math.min(cx - TOOLTIP_WIDTH / 2, vw - TOOLTIP_WIDTH - 12));

    let top: number;
    let left: number = clampedLeft;

    switch (step.tooltipPosition) {
      case 'bottom':
      case 'top': {
        const belowTop = rect.bottom + PADDING + TOOLTIP_GAP;
        const aboveTop = rect.top - PADDING - TOOLTIP_GAP - TOOLTIP_H;
        const fitBelow = belowTop + TOOLTIP_H <= vh - 12;
        const fitAbove = aboveTop >= 12;

        if (step.tooltipPosition === 'bottom' && fitBelow) {
          top = belowTop;
        } else if (fitAbove) {
          top = aboveTop;
        } else if (fitBelow) {
          top = belowTop;
        } else {
          // Neither fits — place in middle of viewport
          top = Math.round((vh - TOOLTIP_H) / 2);
        }
        break;
      }
      case 'right': {
        const rightLeft = rect.right + PADDING + TOOLTIP_GAP;
        left = rightLeft + TOOLTIP_WIDTH > vw - 12
          ? Math.max(12, rect.left - PADDING - TOOLTIP_GAP - TOOLTIP_WIDTH)
          : rightLeft;
        top = Math.round(rect.top + rect.height / 2 - TOOLTIP_H / 2);
        break;
      }
      case 'left': {
        const leftLeft = rect.left - PADDING - TOOLTIP_GAP - TOOLTIP_WIDTH;
        left = leftLeft < 12
          ? rect.right + PADDING + TOOLTIP_GAP
          : leftLeft;
        top = Math.round(rect.top + rect.height / 2 - TOOLTIP_H / 2);
        break;
      }
    }

    // Hard clamp — tooltip must always be fully inside the viewport
    top = Math.max(12, Math.min(top!, vh - TOOLTIP_H - 12));
    left = Math.max(12, Math.min(left, vw - TOOLTIP_WIDTH - 12));

    this.tooltipPos.set({ top, left, transformOrigin: 'top left' });
  }

  public ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }
}
