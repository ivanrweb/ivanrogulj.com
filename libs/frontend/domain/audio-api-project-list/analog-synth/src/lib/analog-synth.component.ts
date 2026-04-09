import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
import { AudioContextService } from '../service/audio-context.service'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { FilterComponent } from '@ivanrogulj.com/filter'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { GainComponent } from '@ivanrogulj.com/gain';
import { AnalogSynthViewModel } from '../viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { OscilloscopeComponent } from '@ivanrogulj.com/oscilloscope'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { TextareaComponent } from '@ivanrogulj.com/textarea';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { EffectsRackComponent } from '@ivanrogulj.com/effects-rack'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { NoiseGeneratorComponent } from '@ivanrogulj.com/noise'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { LfoRackComponent } from '@ivanrogulj.com/lfo-unit';
import { MidiService } from '../service/midi.service'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';
import { Router } from '@angular/router';
import { PatchApiService, PatchSummary } from '../service/patch-api.service';

@Component({
  selector: 'lib-analog-synth',
  standalone: true,
  imports: [
    CommonModule,
    OscillatorComponent,
    FilterComponent,
    GainComponent,
    FormsModule,
    OscilloscopeComponent,
    TextareaComponent,
    EffectsRackComponent,
    NoiseGeneratorComponent,
    LfoRackComponent,
    KeyValuePipe,
  ],
  providers: [AudioContextService],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="synth-dashboard">
      <div class="synth-header">
        <div class="header-left">
          <h3 class="synth-title">OHM-1</h3>

          @if (authService.currentUser()) {
          <div class="preset-dropdown-wrapper" #presetDropdownEl>
            <button
              class="preset-dropdown-trigger"
              [class.has-selection]="selectedPresetId"
              (click)="showPresetDropdown = !showPresetDropdown"
            >
              {{ selectedPresetName || '— presets —' }}
              <span class="dropdown-arrow">▾</span>
            </button>

            @if (showPresetDropdown) {
            <div class="preset-dropdown-panel">
              @if (myPresets.length === 0) {
              <div class="preset-dropdown-empty">no presets saved</div>
              } @for (p of myPresets; track p.id) {
              <div
                class="preset-dropdown-item"
                [class.selected]="p.id === selectedPresetId"
              >
                <span
                  class="preset-dropdown-name"
                  (click)="onPresetSelect(p.id, p.name, p.isPublic)"
                  >{{ p.name }}</span
                >
                <button
                  class="preset-delete-btn"
                  (click)="onConfirmDelete(p.id, p.name, $event)"
                >
                  ×
                </button>
              </div>
              }
            </div>
            }
          </div>
          }

          <button class="btn-save-preset" (click)="onSaveButtonClick()">
            SAVE AS NEW
          </button>

          @if (selectedPresetId) {
          <button class="btn-edit-preset" (click)="showEditDialog = true">
            EDIT
          </button>
          } @if (showSaveDialog) {
          <div class="save-dialog-backdrop" (click)="showSaveDialog = false">
            <div class="save-dialog" (click)="$event.stopPropagation()">
              <h4>Save Preset</h4>
              <input
                type="text"
                [(ngModel)]="newPresetName"
                placeholder="preset name"
              />
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="newPresetIsPublic" />
                make public
              </label>
              <div class="dialog-actions">
                <button (click)="showSaveDialog = false">cancel</button>
                <button (click)="onSavePreset()">save</button>
              </div>
            </div>
          </div>
          } @if (showEditDialog) {
          <div class="save-dialog-backdrop" (click)="showEditDialog = false">
            <div class="save-dialog" (click)="$event.stopPropagation()">
              <h4>Update Preset</h4>
              <p class="edit-dialog-msg">
                Preset <strong>{{ selectedPresetName }}</strong> will be updated
                with the current state. Proceed?
              </p>
              <div class="dialog-actions">
                <button (click)="showEditDialog = false">No</button>
                <button (click)="onUpdatePreset()">Yes</button>
              </div>
            </div>
          </div>
          } @if (showDeleteDialog) {
          <div class="save-dialog-backdrop" (click)="showDeleteDialog = false">
            <div class="save-dialog" (click)="$event.stopPropagation()">
              <h4>Delete Preset</h4>
              <p class="edit-dialog-msg">
                Are you sure you want to delete
                <strong>{{ pendingDeleteName }}</strong
                >?
              </p>
              <div class="dialog-actions">
                <button (click)="showDeleteDialog = false">No</button>
                <button class="danger" (click)="onDeletePreset()">Yes</button>
              </div>
            </div>
          </div>
          }
        </div>

        <div class="header-right">
          @if (midiService.connectedInputs().length > 0) {
          <div
            class="midi-device-list"
            (click)="showMidiDropdown = !showMidiDropdown"
          >
            <span class="midi-device-label">MIDI IN</span>
            <span class="midi-device-chip">{{
              midiService.connectedInputs()[0].name
            }}</span>
            @if (midiService.connectedInputs().length > 1) {
            <span class="midi-device-extra"
              >+{{ midiService.connectedInputs().length - 1 }}</span
            >
            } @if (showMidiDropdown) {
            <div class="midi-device-dropdown">
              @for (input of midiService.connectedInputs(); track input.id) {
              <div class="midi-device-dropdown-item">{{ input.name }}</div>
              }
            </div>
            }
          </div>
          }

          <div class="midi-btn-wrapper">
            <button
              class="btn-midi"
              (click)="analogSynthViewModel.toggleMidiLearn()"
              [class.active]="vm.learnMode"
            >
              <span class="led" [class.on]="vm.learnMode"></span>
              {{ 'MIDI LEARN' }}
            </button>

            @if (vm.learnMode) {
            <div class="midi-tooltip">
              Double click on UI knob/button with mouse first, then assign the
              physical knob on your MIDI interface to it by rotating/pressing
              it.
            </div>
            }
          </div>

          <div class="midi-btn-wrapper">
            <button
              class="btn-midi"
              (click)="showMidiMapper = !showMidiMapper"
              [class.active]="showMidiMapper"
            >
              <span
                class="led"
                [class.on-yellow]="(vm.mappedParams | keyvalue).length > 0"
              ></span>
              MIDI MAP
            </button>

            @if (showMidiMapper) {
            <div class="midi-mapper-panel">
              <div class="midi-mapper-header">
                <span>MIDI MAPPINGS</span>
                <button class="close-btn" (click)="showMidiMapper = false">
                  ✕
                </button>
              </div>
              @if ((vm.mappedParams | keyvalue).length === 0) {
              <div class="no-mappings">No active mappings</div>
              } @else {
              <table class="mapper-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Control</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (entry of vm.mappedParams | keyvalue; track entry.key;
                  let i = $index) { @if (entry.value) {
                  <tr [class.even]="i % 2 === 0">
                    <td class="row-num">{{ i + 1 }}</td>
                    <td class="param-name">
                      {{ getKnobLabel(entry.key) }}
                    </td>
                    <td class="unmap-cell">
                      <button
                        class="unmap-btn"
                        (click)="
                          analogSynthViewModel.unmapParam($any(entry.key))
                        "
                      >
                        UNMAP
                      </button>
                    </td>
                  </tr>
                  } }
                </tbody>
              </table>
              }
            </div>
            }
          </div>

          <lib-textarea />
        </div>
      </div>

      <div class="module-grid">
        <div class="synth-module source-module">
          <h4 class="module-label">OSCILLATOR</h4>
          <div class="module-content">
            <lib-oscillator />
          </div>
        </div>

        <div class="synth-module utility-module">
          <h4 class="module-label">UTILITY</h4>

          <div class="module-content utility-content">
            <div class="utility-controls">
              <div class="control-group">
                <label class="control-label">VOICING</label>
                <div class="voicing-toggle-wrapper">
                  <i
                    class="icon-lg"
                    [class.icon-fad-squareswitch-on]="vm.isPolyphonic"
                    [class.icon-fad-squareswitch-off]="!vm.isPolyphonic"
                    (click)="analogSynthViewModel.togglePolyphony()"
                  ></i>
                  <span class="voicing-text">{{
                    vm.isPolyphonic ? 'POLY' : 'MONO'
                  }}</span>
                </div>
              </div>

              <lib-noise-generator />
            </div>

            <div class="utility-scope">
              <lib-oscilloscope />
            </div>
          </div>
        </div>

        <div class="synth-module filter-module">
          <h4 class="module-label">FILTER</h4>
          <div class="module-content">
            <lib-filter />
          </div>
        </div>

        <div class="synth-module amp-module">
          <h4 class="module-label">AMPLIFIER</h4>
          <div class="module-content">
            <lib-gain />
          </div>
        </div>

        <div class="synth-module lfo-module">
          <h4 class="module-label">LFO & SEQUENCER</h4>
          <div class="module-content">
            <lib-lfo-rack />
          </div>
        </div>

        <div class="synth-module fx-module">
          <h4 class="module-label">EFFECTS RACK</h4>
          <div class="module-content">
            <lib-effects-rack />
          </div>
        </div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      :host {
        display: block;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        background-color: #0b0c10;
        border-radius: 10px;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
      }

      .synth-dashboard {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .synth-header {
        background: #1f2833;
        padding: 15px 20px;
        border-radius: 8px;
        border: 1px solid #333;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        position: relative;
        z-index: 1000;
      }

      .header-left,
      .header-right {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .synth-title {
        margin: 0;
        font-family: 'Fira Code', monospace;
        font-weight: 700;
        letter-spacing: 2px;
        color: #66fcf1;
        font-size: 1.2rem;
        text-transform: uppercase;
      }

      .midi-device-list {
        display: flex;
        align-items: center;
        gap: 6px;
        position: relative;
        cursor: pointer;
        user-select: none;
      }

      .midi-device-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 1.5px;
        white-space: nowrap;
      }

      .midi-device-chip {
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        color: #66fcf1;
        background: rgba(102, 252, 241, 0.08);
        border: 1px solid rgba(102, 252, 241, 0.25);
        border-radius: 4px;
        padding: 3px 8px;
        white-space: nowrap;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .midi-device-extra {
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        color: #888;
        white-space: nowrap;
      }

      .midi-device-dropdown {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        z-index: 100;
        min-width: 180px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }

      .midi-device-dropdown-item {
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #c5c6c7;
        padding: 8px 12px;
        border-bottom: 1px solid #2a3545;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:last-child {
          border-bottom: none;
        }
      }

      .midi-btn-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .btn-midi {
        background: #0b0c10;
        border: 1px solid #333;
        color: #c5c6c7;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 1px;
        transition: all 0.2s;
        height: 33px;
        box-sizing: border-box;
      }

      .btn-midi:hover {
        background: #1f2833;
        border-color: #555;
      }

      .btn-midi.active {
        background: rgba(255, 0, 127, 0.1);
        border-color: #ff007f;
        color: #ff007f;
      }

      .led {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #440000;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .led.on {
        background: #ff007f;
        box-shadow: 0 0 6px #ff007f;
      }

      .led.on-yellow {
        background: #66fcf1;
        box-shadow: 0 0 6px #66fcf1;
      }

      .midi-mapper-panel {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        min-width: 320px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
        z-index: 1200;
        overflow: hidden;
      }

      .midi-mapper-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #0b0c10;
        border-bottom: 1px solid #333;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .close-btn {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 0 4px;
        line-height: 1;
      }

      .close-btn:hover {
        color: #c5c6c7;
      }

      .no-mappings {
        padding: 16px 12px;
        font-size: 0.75rem;
        color: #555;
        text-align: center;
        font-family: 'Fira Code', monospace;
      }

      .mapper-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.75rem;
        font-family: 'Fira Code', monospace;
      }

      .mapper-table th {
        padding: 6px 12px;
        color: #888;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-align: left;
        background: #0b0c10;
        border-bottom: 1px solid #333;
      }

      .mapper-table tr {
        background: #1f2833;
      }

      .mapper-table tr.even {
        background: rgba(102, 252, 241, 0.03);
      }

      .mapper-table td {
        padding: 7px 12px;
        color: #c5c6c7;
        border-bottom: 1px solid #333;
      }

      .row-num {
        color: #555;
        width: 30px;
      }

      .unmap-cell {
        text-align: right;
      }

      .unmap-btn {
        background: #0b0c10;
        border: 1px solid rgba(255, 0, 127, 0.35);
        color: #ff007f;
        padding: 3px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        transition: all 0.15s;
      }

      .unmap-btn:hover {
        background: rgba(255, 0, 127, 0.1);
        border-color: #ff007f;
      }

      .midi-tooltip {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: 250px;
        background: #1f2833;
        border: 1px solid #66fcf1;
        color: #66fcf1;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        text-align: left;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        z-index: 1100;
        pointer-events: none;
        animation: fadeIn 0.2s ease-out;
      }

      .module-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }

      .synth-module {
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: visible;
      }

      .module-label {
        margin: 0;
        padding: 8px 0;
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        width: 100%;
        text-align: center;
        background: #0b0c10;
        border-bottom: 1px solid #333;
        border-radius: 6px 6px 0 0;
      }

      .module-content {
        padding: 15px;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .utility-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        width: 100%;
        height: 100%;
        padding: 15px;
        box-sizing: border-box;
      }

      .utility-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        gap: 20px;
      }

      .utility-scope {
        width: 100%;
        height: 60px;
        background: #000;
        border: 1px solid #333;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
      }

      .utility-scope ::ng-deep canvas {
        width: 100% !important;
        height: 100% !important;
      }

      .control-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .control-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        color: #888;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .voicing-toggle-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .voicing-text {
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        color: #c5c6c7;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        transform: translateY(-4px);
        width: 35px;
        display: inline-block;
        text-align: left;
      }

      .icon-lg {
        color: #c5c6c7;
        font-size: 2.4rem;
        cursor: pointer;
        display: inline-block;
        margin-top: -15px;
        margin-bottom: -15px;
        transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .fx-module {
        grid-column: 1 / -1;
      }

      .lfo-module {
        grid-column: 1 / -1;
        overflow: visible;
        position: relative;
        z-index: 10;
      }

      .lfo-module .module-content {
        overflow: visible;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .preset-dropdown-wrapper {
        position: relative;
      }

      .preset-dropdown-trigger {
        background: #0b0c10;
        border: 1px solid #333;
        color: #c5c6c7;
        padding: 5px 10px;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        height: 33px;
        min-width: 150px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        transition: border-color 0.2s;

        &:hover {
          border-color: #555;
        }

        &.has-selection {
          color: #66fcf1;
          border-color: rgba(102, 252, 241, 0.4);
        }

        .dropdown-arrow {
          font-size: 0.65rem;
          opacity: 0.6;
        }
      }

      .preset-dropdown-panel {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        min-width: 220px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        z-index: 1002;
        overflow: hidden;
        animation: fadeIn 0.15s ease-out;
      }

      .preset-dropdown-empty {
        padding: 10px 14px;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        color: #888;
      }

      .preset-dropdown-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 6px 0 0;
        transition: background 0.15s;

        &:nth-child(odd) {
          background: #1a2230;
        }

        &:nth-child(even) {
          background: #1f2833;
        }

        &:hover {
          background: rgba(102, 252, 241, 0.05);
        }

        &.selected {
          background: rgba(102, 252, 241, 0.06);
        }
      }

      .preset-dropdown-name {
        flex: 1;
        padding: 8px 14px;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #c5c6c7;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .selected & {
          color: #66fcf1;
        }
      }

      .preset-delete-btn {
        background: transparent;
        border: 1px solid rgba(255, 0, 127, 0.35);
        color: #ff007f;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        border-radius: 3px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        transition: all 0.15s;

        &:hover {
          background: rgba(255, 0, 127, 0.1);
          border-color: #ff007f;
        }
      }

      .btn-save-preset {
        background: #0b0c10;
        border: 1px solid rgba(102, 252, 241, 0.4);
        color: #66fcf1;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 1px;
        transition: all 0.2s;
        height: 33px;
        box-sizing: border-box;

        &:hover {
          background: rgba(102, 252, 241, 0.08);
          border-color: #66fcf1;
        }
      }

      .btn-edit-preset {
        background: #0b0c10;
        border: 1px solid rgba(102, 252, 241, 0.4);
        color: #66fcf1;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 1px;
        transition: all 0.2s;
        height: 33px;
        box-sizing: border-box;

        &:hover {
          background: rgba(102, 252, 241, 0.08);
          border-color: #66fcf1;
        }
      }

      .edit-dialog-msg {
        margin: 0;
        font-family: 'Fira Code', monospace;
        font-size: 0.78rem;
        color: #c5c6c7;
        line-height: 1.5;

        strong {
          color: #66fcf1;
        }
      }

      .save-dialog-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .save-dialog {
        background: #1f2833;
        border: 1px solid #66fcf1;
        border-radius: 8px;
        padding: 24px;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
        animation: fadeIn 0.2s ease-out;

        h4 {
          margin: 0;
          font-family: 'Fira Code', monospace;
          font-size: 0.9rem;
          font-weight: 700;
          color: #66fcf1;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        input[type='text'] {
          background: #0b0c10;
          border: 1px solid #333;
          color: #c5c6c7;
          padding: 8px 10px;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
          font-size: 0.8rem;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;

          &::placeholder {
            color: #555;
          }

          &:focus {
            border-color: #66fcf1;
          }
        }
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #c5c6c7;
        cursor: pointer;

        input[type='checkbox'] {
          accent-color: #66fcf1;
          width: 14px;
          height: 14px;
          cursor: pointer;
        }
      }

      .dialog-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;

        button {
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

          &:hover {
            border-color: #555;
            color: #fff;
          }

          &:last-child {
            border-color: rgba(102, 252, 241, 0.4);
            color: #66fcf1;

            &:hover {
              background: rgba(102, 252, 241, 0.08);
              border-color: #66fcf1;
            }
          }

          &.danger {
            border-color: rgba(255, 0, 127, 0.4);
            color: #ff007f;

            &:hover {
              background: rgba(255, 0, 127, 0.08);
              border-color: #ff007f;
            }
          }
        }
      }
    `,
  ],
})
export class AnalogSynthComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('oscilloscope', { static: false })
  public oscilloscopeCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('presetDropdownEl', { static: false })
  public presetDropdownEl!: ElementRef<HTMLElement>;

  public analogSynthViewModel = inject(AnalogSynthViewModel);
  public midiService = inject(MidiService);
  public authService = inject(AuthService);
  private readonly patchApiService = inject(PatchApiService);
  private readonly router = inject(Router);

  public readonly oscillatorCount = [1, 2, 3, 4, 5, 6, 7, 8];

  public showMidiMapper = false;
  public showMidiDropdown = false;
  public showSaveDialog = false;
  public showEditDialog = false;
  public showDeleteDialog = false;
  public showPresetDropdown = false;
  public newPresetName = '';
  public newPresetIsPublic = false;
  public myPresets: PatchSummary[] = [];
  public selectedPresetId = '';
  public selectedPresetName = '';
  public selectedPresetIsPublic = false;
  public pendingDeleteId = '';
  public pendingDeleteName = '';

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (
      this.showPresetDropdown &&
      this.presetDropdownEl &&
      !this.presetDropdownEl.nativeElement.contains(event.target as Node)
    ) {
      this.showPresetDropdown = false;
    }
  }

  protected readonly knobLabels: Record<AnalogSynthApi.Knob, string> = {
    [AnalogSynthApi.Knob.ATTACK]: 'Amp Attack',
    [AnalogSynthApi.Knob.DECAY]: 'Amp Decay',
    [AnalogSynthApi.Knob.SUSTAIN]: 'Amp Sustain',
    [AnalogSynthApi.Knob.RELEASE]: 'Amp Release',
    [AnalogSynthApi.Knob.FILTER_ATTACK]: 'Filter Attack',
    [AnalogSynthApi.Knob.FILTER_DECAY]: 'Filter Decay',
    [AnalogSynthApi.Knob.FILTER_SUSTAIN]: 'Filter Sustain',
    [AnalogSynthApi.Knob.FILTER_RELEASE]: 'Filter Release',
    [AnalogSynthApi.Knob.OSCILLATOR_COUNT]: 'Oscillator Count',
    [AnalogSynthApi.Knob.DETUNE_OSCILLATORS_AMOUNT]: 'Detune',
    [AnalogSynthApi.Knob.MASTER_GAIN]: 'Master Volume',
    [AnalogSynthApi.Knob.FILTER_FREQUENCY]: 'Filter Cutoff',
    [AnalogSynthApi.Knob.FILTER_RESONANCE]: 'Filter Resonance',
    [AnalogSynthApi.Knob.FILTER_ENVELOPE_AMOUNT]: 'Filter Env Amt',
    [AnalogSynthApi.Knob.DISTORTION_AMOUNT]: 'Distortion Amount',
    [AnalogSynthApi.Knob.DISTORTION_TONE]: 'Distortion Tone',
    [AnalogSynthApi.Knob.DISTORTION_MIX]: 'Distortion Mix',
    [AnalogSynthApi.Knob.REVERB_MIX]: 'Reverb Mix',
    [AnalogSynthApi.Knob.REVERB_DECAY]: 'Reverb Decay',
    [AnalogSynthApi.Knob.DELAY_TIME]: 'Delay Time',
    [AnalogSynthApi.Knob.DELAY_FEEDBACK]: 'Delay Feedback',
    [AnalogSynthApi.Knob.DELAY_MIX]: 'Delay Mix',
    [AnalogSynthApi.Knob.CHORUS_RATE]: 'Chorus Rate',
    [AnalogSynthApi.Knob.CHORUS_DEPTH]: 'Chorus Depth',
    [AnalogSynthApi.Knob.CHORUS_MIX]: 'Chorus Mix',
    [AnalogSynthApi.Knob.LFO1_RATE]: 'LFO 1 Rate',
    [AnalogSynthApi.Knob.LFO1_DEPTH]: 'LFO 1 Depth',
    [AnalogSynthApi.Knob.LFO2_RATE]: 'LFO 2 Rate',
    [AnalogSynthApi.Knob.LFO2_DEPTH]: 'LFO 2 Depth',
  };

  public ngOnInit(): void {
    this.analogSynthViewModel.startAudioContext();
    if (this.authService.currentUser()) {
      this.patchApiService.getMyPresets().subscribe((presets) => {
        this.myPresets = presets;
      });
    }
  }

  public ngAfterViewInit(): void {
    if (this.oscilloscopeCanvas) {
      this.analogSynthViewModel.initializeOscilloscope(this.oscilloscopeCanvas);
    }
  }

  public ngOnDestroy(): void {
    this.analogSynthViewModel.destroyAudioContext();
  }

  protected readonly AnalogSynthApi = AnalogSynthApi;

  public onSaveButtonClick(): void {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showSaveDialog = true;
  }

  public onSavePreset(): void {
    if (!this.newPresetName.trim()) return;
    const name = this.newPresetName.trim();
    const isPublic = this.newPresetIsPublic;
    this.patchApiService.savePreset(name, isPublic).subscribe((result) => {
      this.myPresets = [
        ...this.myPresets,
        {
          id: result.id,
          name: result.name,
          isPublic,
          createdAt: new Date().toISOString(),
        },
      ];
      this.selectedPresetId = result.id;
      this.selectedPresetName = result.name;
      this.selectedPresetIsPublic = isPublic;
      this.showSaveDialog = false;
      this.newPresetName = '';
      this.newPresetIsPublic = false;
    });
  }

  public onPresetSelect(id: string, name: string, isPublic: boolean): void {
    this.selectedPresetId = id;
    this.selectedPresetName = name;
    this.selectedPresetIsPublic = isPublic;
    this.showPresetDropdown = false;
    this.patchApiService.loadPreset(id).subscribe();
  }

  public onConfirmDelete(id: string, name: string, event: Event): void {
    event.stopPropagation();
    this.pendingDeleteId = id;
    this.pendingDeleteName = name;
    this.showPresetDropdown = false;
    this.showDeleteDialog = true;
  }

  public onDeletePreset(): void {
    this.showDeleteDialog = false;
    this.patchApiService.deletePreset(this.pendingDeleteId).subscribe(() => {
      this.myPresets = this.myPresets.filter(
        (p) => p.id !== this.pendingDeleteId
      );
      if (this.selectedPresetId === this.pendingDeleteId) {
        this.selectedPresetId = '';
        this.selectedPresetName = '';
        this.selectedPresetIsPublic = false;
      }
      this.pendingDeleteId = '';
      this.pendingDeleteName = '';
    });
  }

  public onUpdatePreset(): void {
    this.showEditDialog = false;
    this.patchApiService
      .updatePreset(
        this.selectedPresetId,
        this.selectedPresetName,
        this.selectedPresetIsPublic
      )
      .subscribe({
        next: () =>
          console.log(
            '[Preset] Updated successfully:',
            this.selectedPresetName
          ),
        error: (err) => console.error('[Preset] Update failed:', err),
      });
  }

  public getKnobLabel(key: string): string {
    return this.knobLabels[key as AnalogSynthApi.Knob] ?? key;
  }
}
