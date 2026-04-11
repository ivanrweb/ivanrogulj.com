import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { SelectComponent, SelectOption } from '@ivanrogulj.com/select';
import { AnalogSynthViewModel } from '../viewmodel/analog-synth.viewmodel';
import { SamplerViewModel } from '../viewmodel/sampler.viewmodel';
import { SAMPLER_PRESETS } from '../config/sampler-presets.config';

@Component({
  selector: 'lib-source-module',
  standalone: true,
  imports: [AsyncPipe, OscillatorComponent, SelectComponent],
  template: `
    @if (vm$ | async; as vm) {
    <div class="source-container">
      <div class="mode-toggle">
        <button
          class="mode-btn"
          [class.active]="vm.sourceMode === 'oscillator'"
          (click)="setMode('oscillator')"
        >
          OSC
        </button>
        <button
          class="mode-btn"
          [class.active]="vm.sourceMode === 'sampler'"
          (click)="setMode('sampler')"
        >
          SAMPLER
        </button>
      </div>

      @if (vm.sourceMode === 'oscillator') {
      <lib-oscillator />
      } @else {
      <div class="sampler-panel">
        <label class="sampler-label">PRESET</label>
        <lib-select
          [options]="presetOptions"
          [value]="(samplerPreset$ | async) ?? ''"
          (valueChange)="onPresetChange($event)"
        />

        @if (samplerLoading$ | async) {
        <div class="loading-bar">
          <div class="loading-fill"></div>
        </div>
        <span class="loading-text">loading samples...</span>
        } @else if (samplerLoaded$ | async) {
        <span class="ready-text">ready</span>
        }
      </div>
      }
    </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .source-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        gap: 12px;
      }

      .mode-toggle {
        display: flex;
        gap: 0;
        border: 1px solid #333;
        border-radius: 4px;
        overflow: hidden;
        width: 100%;
      }

      .mode-btn {
        flex: 1;
        background: #0b0c10;
        color: #888;
        border: none;
        padding: 5px 0;
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 1px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }

      .mode-btn + .mode-btn {
        border-left: 1px solid #333;
      }

      .mode-btn.active {
        background: rgba(102, 252, 241, 0.1);
        color: #66fcf1;
      }

      .mode-btn:hover:not(.active) {
        background: #1f2833;
        color: #c5c6c7;
      }

      .sampler-panel {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        gap: 8px;
      }

      .sampler-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .loading-bar {
        width: 100%;
        height: 3px;
        background: #1f2833;
        border-radius: 2px;
        overflow: hidden;
      }

      .loading-fill {
        height: 100%;
        width: 60%;
        background: #66fcf1;
        border-radius: 2px;
        animation: loading-sweep 1.2s ease-in-out infinite;
      }

      @keyframes loading-sweep {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }

      .loading-text {
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        color: #888;
        letter-spacing: 1px;
      }

      .ready-text {
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        color: #66fcf1;
        letter-spacing: 1px;
      }
    `,
  ],
})
export class SourceModuleComponent {
  protected readonly analogSynthViewModel = inject(AnalogSynthViewModel);
  protected readonly samplerViewModel = inject(SamplerViewModel);

  public readonly vm$ = this.analogSynthViewModel.vm$.pipe(
    map((vm) => ({ sourceMode: vm.sourceMode }))
  );

  public readonly samplerPreset$ = this.samplerViewModel.selectedPreset$;
  public readonly samplerLoading$ = this.samplerViewModel.loading$;
  public readonly samplerLoaded$ = this.samplerViewModel.loaded$;

  public readonly presetOptions: SelectOption[] = Object.entries(SAMPLER_PRESETS).map(
    ([value, config]) => ({ value, label: config.label })
  );

  public setMode(mode: 'oscillator' | 'sampler'): void {
    this.analogSynthViewModel.setSourceMode(mode);
  }

  public onPresetChange(presetId: string): void {
    this.samplerViewModel.selectPreset(presetId);
  }
}
