import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { GuitarPedalsViewModel } from '../viewmodel/guitar-pedals.viewmodel';
import { PedalboardComponent } from './pedalboard/pedalboard.component';

@Component({
  selector: 'lib-guitar-pedals',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent, PedalboardComponent],
  template: `
    @if (vm.vm$ | async; as state) {
      <div class="guitar-pedals-page">
        <div class="page-header">
          <h2 class="page-title">Guitar Pedals</h2>
          <p class="page-subtitle">Real-time guitar effects via Web Audio API</p>
        </div>

        <div class="controls-bar">
          <div class="input-select-group">
            <label class="control-label">Audio Input</label>
            <select
              class="device-select"
              [ngModel]="state.selectedInput"
              (ngModelChange)="vm.selectInput($event)"
            >
              <option [ngValue]="null">Default input</option>
              @for (device of state.availableInputs; track device.deviceId) {
                <option [ngValue]="device.deviceId">
                  {{ device.label || 'Input ' + $index }}
                </option>
              }
            </select>
          </div>

          <button
            class="start-btn"
            [class.running]="state.isRunning"
            (click)="state.isRunning ? vm.stop() : vm.start(state.selectedInput)"
          >
            {{ state.isRunning ? '■ Stop' : '▶ Start' }}
          </button>

          @if (state.isRunning) {
            <div class="gain-controls">
              <lib-knob
                label="Input"
                [minValue]="0"
                [maxValue]="200"
                [measureUnit]="'%'"
                [value]="state.inputGain * 100"
                (valueChange)="vm.setInputGain($event / 100)"
              />
              <lib-knob
                label="Master"
                [minValue]="0"
                [maxValue]="100"
                [measureUnit]="'%'"
                [value]="state.masterVolume * 100"
                (valueChange)="vm.setMasterVolume($event / 100)"
              />
            </div>
          }
        </div>

        @if (state.isRunning) {
          <div class="board-wrapper">
            <lib-pedalboard />
          </div>
          <div class="drag-hint">
            <span>Drag pedals to reorder • Click LED to bypass</span>
          </div>
        } @else {
          <div class="idle-state">
            <div class="idle-icon">🎸</div>
            <p>Select your audio input and press Start to begin</p>
            @if (state.availableInputs.length === 0) {
              <p class="hint">
                Click Start — the browser will ask for microphone permission
              </p>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .guitar-pedals-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
        min-height: 100vh;
        background: #111;
        color: #fff;
        font-family: monospace;
      }

      .page-header {
        border-bottom: 1px solid #333;
        padding-bottom: 16px;
      }

      .page-title {
        margin: 0 0 4px;
        font-size: 1.5rem;
        font-weight: bold;
        color: #fff;
        letter-spacing: 1px;
      }

      .page-subtitle {
        margin: 0;
        color: #666;
        font-size: 0.85rem;
      }

      .controls-bar {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }

      .input-select-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .control-label {
        font-size: 0.7rem;
        color: #888;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .device-select {
        background: #222;
        border: 1px solid #444;
        border-radius: 4px;
        color: #fff;
        padding: 6px 10px;
        font-size: 0.85rem;
        font-family: monospace;
        min-width: 220px;
        cursor: pointer;
      }

      .device-select:focus {
        outline: 1px solid #ffcc00;
      }

      .start-btn {
        padding: 8px 20px;
        border-radius: 6px;
        border: 1px solid #555;
        background: #2a2a2a;
        color: #fff;
        font-size: 0.9rem;
        font-family: monospace;
        cursor: pointer;
        letter-spacing: 1px;
        transition: all 0.2s;
      }

      .start-btn:hover {
        background: #333;
        border-color: #888;
      }

      .start-btn.running {
        background: #3a1a1a;
        border-color: #e74c3c;
        color: #e74c3c;
      }

      .start-btn.running:hover {
        background: #4a2020;
      }

      .gain-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .board-wrapper {
        overflow-x: auto;
        padding-bottom: 8px;
      }

      .drag-hint {
        text-align: center;
        color: #444;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
      }

      .idle-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 60px 20px;
        color: #555;
        text-align: center;
      }

      .idle-icon {
        font-size: 3rem;
      }

      .idle-state p {
        margin: 0;
        font-size: 0.9rem;
      }

      .hint {
        color: #444;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class GuitarPedalsComponent implements OnInit {
  public readonly vm = inject(GuitarPedalsViewModel);

  public ngOnInit(): void {
    this.vm.loadInputs();
  }
}
