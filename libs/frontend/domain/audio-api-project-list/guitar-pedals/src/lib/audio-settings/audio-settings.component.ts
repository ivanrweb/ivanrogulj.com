import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectComponent, SelectOption } from '@ivanrogulj.com/select';
import {
  GuitarPedalsViewModel,
  LatencyMode,
} from '../../viewmodel/guitar-pedals.viewmodel';

@Component({
  selector: 'lib-audio-settings',
  standalone: true,
  imports: [CommonModule, SelectComponent],
  template: `
    <div class="settings-wrapper">
      <button
        class="settings-btn"
        [class.open]="isOpen()"
        (click)="toggle()"
        title="Audio Settings"
        #triggerBtn
      >
        ⚙
      </button>

      @if (isOpen()) {
      <div class="popover" #popover>
        <div class="popover-header">Audio Settings</div>

        <div class="setting-row">
          <span class="setting-label">Latency Mode</span>
          <lib-select
            [options]="latencyModeOptions"
            [value]="state().latencyMode"
            (valueChange)="onLatencyModeChange($event)"
          />
        </div>

        <div class="setting-row">
          <span class="setting-label">Sample Rate</span>
          <lib-select
            [options]="sampleRateOptions"
            [value]="sampleRateStr()"
            (valueChange)="onSampleRateChange($event)"
          />
        </div>

        @if (state().latencyInfo; as info) {
        <div class="latency-section">
          <div class="latency-row">
            <span class="latency-label">Processing</span>
            <span class="latency-value-sm"
              >{{ info.baseMs.toFixed(1) }} ms</span
            >
          </div>
          <div class="latency-row">
            <span class="latency-label">OS / hardware</span>
            <span class="latency-value-sm latency-fixed"
              >{{ info.outputMs.toFixed(1) }} ms</span
            >
          </div>
          <div class="latency-row latency-total-row">
            <span class="latency-label">Total (measured)</span>
            <span class="latency-value">{{ info.totalMs.toFixed(1) }} ms</span>
          </div>
          <div class="latency-note">
            OS/hardware overhead is a browser limit — can't go lower
          </div>
        </div>
        } @else {
        <div class="latency-row latency-row-empty">
          <span class="latency-label latency-hint"
            >Start to measure actual latency</span
          >
        </div>
        }

        <div class="note">Sample rate & latency mode apply on next Start</div>
        <div class="note">
          For minimum latency, reduce buffer in your audio interface controls
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .settings-wrapper {
        position: relative;
      }

      .settings-btn {
        padding: 6px 10px;
        border-radius: 4px;
        border: 1px solid #555;
        background: #2a2a2a;
        color: #999;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        line-height: 1;
      }

      .settings-btn:hover,
      .settings-btn.open {
        background: #333;
        border-color: #aaa;
        color: #d0d0d0;
      }

      .popover {
        position: absolute;
        top: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        background: #1e1e1e;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 14px 16px;
        min-width: 260px;
        z-index: 100;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
      }

      .popover-header {
        font-size: 0.7rem;
        font-weight: bold;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #888;
        margin-bottom: 12px;
      }

      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .setting-label {
        font-size: 0.7rem;
        color: #888;
        letter-spacing: 0.5px;
        white-space: nowrap;
      }

      .latency-section {
        border-top: 1px solid #333;
        margin-top: 10px;
        padding-top: 10px;
      }

      .latency-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 22px;
      }

      .latency-row-empty {
        border-top: 1px solid #333;
        margin-top: 10px;
        padding-top: 10px;
      }

      .latency-total-row {
        border-top: 1px solid #2a2a2a;
        margin-top: 4px;
        padding-top: 4px;
      }

      .latency-hint {
        color: #555;
        font-style: italic;
      }

      .latency-note {
        font-size: 0.6rem;
        color: #444;
        margin-top: 4px;
        text-align: right;
      }

      .latency-value {
        font-size: 0.8rem;
        font-weight: bold;
        color: #ffcc00;
        letter-spacing: 0.5px;
      }

      .latency-value-sm {
        font-size: 0.75rem;
        color: #888;
        letter-spacing: 0.5px;
      }

      .latency-fixed {
        color: #666;
      }

      .note {
        margin-top: 6px;
        font-size: 0.62rem;
        color: #555;
        text-align: center;
        letter-spacing: 0.3px;
      }
    `,
  ],
})
export class AudioSettingsComponent {
  private readonly vm = inject(GuitarPedalsViewModel);

  @ViewChild('triggerBtn') private triggerBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('popover') private popoverEl?: ElementRef<HTMLDivElement>;

  public readonly isOpen = signal(false);

  public readonly state = toSignal(this.vm.vm$, { requireSync: true });

  public readonly latencyModeOptions: SelectOption[] = [
    { label: 'Interactive (lower latency)', value: 'interactive' },
    { label: 'Balanced (medium latency)', value: 'balanced' },
    { label: 'Playback (higher latency)', value: 'playback' },
  ];

  public readonly sampleRateOptions: SelectOption[] = [
    { label: '44100 Hz', value: '44100' },
    { label: '48000 Hz', value: '48000' },
    { label: '96000 Hz', value: '96000' },
  ];

  public readonly sampleRateStr = (): string => String(this.state().sampleRate);

  public toggle(): void {
    this.isOpen.update((v) => !v);
  }

  public onLatencyModeChange(value: string): void {
    this.vm.setLatencyMode(value as LatencyMode);
  }

  public onSampleRateChange(value: string): void {
    this.vm.setSampleRate(Number(value));
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node;
    if (
      !this.triggerBtn.nativeElement.contains(target) &&
      !this.popoverEl?.nativeElement.contains(target)
    ) {
      this.isOpen.set(false);
    }
  }
}
