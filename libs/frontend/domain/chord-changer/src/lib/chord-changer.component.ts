import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChordChangerService } from '../service/chord-changer.service';

@Component({
  selector: 'lib-chord-changer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="changer-dashboard">
      <div class="changer-header">
        <h3 class="changer-title">CHORD CHANGER</h3>

        <div class="transpose-controls">
          <span class="control-label">TRANSPOSE</span>
          <div class="btn-group">
            @for (step of negativeSteps; track step) {
            <button
              class="btn-step"
              [class.active]="currentOffset() === step"
              (click)="setOffset(step)"
            >
              {{ step }}
            </button>
            }
            <button
              class="btn-step btn-zero"
              [class.active]="currentOffset() === 0"
              (click)="setOffset(0)"
            >
              0
            </button>
            @for (step of positiveSteps; track step) {
            <button
              class="btn-step"
              [class.active]="currentOffset() === step"
              (click)="setOffset(step)"
            >
              +{{ step }}
            </button>
            }
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="editor-section">
          <label class="section-label">SONG LYRICS & CHORDS</label>
          <textarea
            class="chord-textarea"
            [ngModel]="inputText()"
            (ngModelChange)="inputText.set($event)"
            placeholder="Paste your song here..."
          >
          </textarea>
        </div>

        <div class="output-section">
          <label class="section-label"
            >TRANSPOSED OUTPUT ({{
              currentOffset() > 0 ? '+' + currentOffset() : currentOffset()
            }})</label
          >
          <div class="transposed-output">
            <pre>{{ analysis().transposedText }}</pre>
          </div>
        </div>
      </div>

      <div class="analysis-footer">
        <div class="analysis-card key-card">
          <span class="card-title">PROBABLE KEYS</span>
          <div class="prob-list">
            @for (key of analysis().probableKeys; track key.name) {
            <div class="prob-row">
              <span class="prob-name">{{ key.name }}</span>
              <span class="prob-val">{{ key.probability }}%</span>
            </div>
            } @if (analysis().probableKeys.length === 0) {
            <span class="empty-text">N/A</span>
            }
          </div>
        </div>

        <div class="analysis-card flex-grow">
          <span class="card-title">CURRENT CHORDS</span>
          <div class="pill-container">
            @for (chord of analysis().uniqueChords; track chord) {
            <span class="chord-pill">{{ chord }}</span>
            } @if (analysis().uniqueChords.length === 0) {
            <span class="empty-text">No chords detected</span>
            }
          </div>
        </div>

        <div class="analysis-card flex-grow">
          <span class="card-title">PROGRESSION (BASED ON TOP KEY)</span>
          <div class="pill-container">
            @for (numeral of analysis().progression; track numeral) {
            <span class="progression-pill">{{ numeral }}</span>
            } @if (analysis().progression.length === 0) {
            <span class="empty-text">-</span>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        background-color: #121212;
        border-radius: 10px;
        border: 1px solid #333;
        color: #e0e0e0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .changer-dashboard {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .changer-header {
        background: #1a1a1a;
        padding: 15px 20px;
        border-radius: 8px;
        border: 1px solid #333;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .changer-title {
        margin: 0;
        font-weight: 900;
        letter-spacing: 2px;
        color: #888;
        font-size: 1.2rem;
        text-transform: uppercase;
      }

      .transpose-controls {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .control-label {
        font-size: 0.75rem;
        color: #888;
        font-weight: bold;
        letter-spacing: 1px;
      }

      .btn-group {
        display: flex;
        gap: 4px;
        background: #0a0a0a;
        padding: 4px;
        border-radius: 6px;
        border: 1px solid #333;
      }

      .btn-step {
        background: #222;
        border: 1px solid #333;
        color: #aaa;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.8rem;
        transition: all 0.2s;
        min-width: 36px;
        text-align: center;
      }

      .btn-step:hover {
        background: #333;
        color: #fff;
      }

      .btn-step.active {
        background: #ffcc00;
        color: #000;
        border-color: #d4a000;
        box-shadow: 0 0 8px rgba(255, 204, 0, 0.4);
      }

      .btn-zero {
        margin: 0 4px;
      }

      .main-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        min-height: 400px;
      }

      .section-label {
        display: block;
        font-size: 0.7rem;
        font-weight: bold;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        margin-bottom: 8px;
        padding-left: 4px;
      }

      .editor-section,
      .output-section {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .chord-textarea {
        flex-grow: 1;
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 6px;
        color: #d0d0d0;
        padding: 15px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.95rem;
        line-height: 1.5;
        resize: none;
        outline: none;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: border-color 0.2s;
        white-space: pre;
      }

      .chord-textarea:focus {
        border-color: #555;
      }

      .transposed-output {
        flex-grow: 1;
        background: #0a0a0a;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 15px;
        overflow-y: auto;
      }

      .transposed-output pre {
        margin: 0;
        color: #ffcc00;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.95rem;
        line-height: 1.5;
        white-space: pre-wrap;
      }

      .analysis-footer {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .analysis-card {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 12px 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .key-card {
        min-width: 150px;
      }

      .prob-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .prob-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #2a2a2a;
        padding: 4px 10px;
        border-radius: 4px;
      }

      .prob-name {
        color: #ff3333;
        font-weight: bold;
        font-size: 0.9rem;
      }

      .prob-val {
        color: #888;
        font-size: 0.8rem;
      }

      .flex-grow {
        flex-grow: 1;
      }

      .card-title {
        font-size: 0.65rem;
        color: #888;
        font-weight: bold;
        letter-spacing: 1px;
      }

      .pill-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .chord-pill {
        background: #2a2a2a;
        border: 1px solid #444;
        color: #ffcc00;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: bold;
        font-family: 'Courier New', Courier, monospace;
      }

      .progression-pill {
        background: #1a1a1a;
        border: 1px solid #555;
        color: #00ccff;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: bold;
      }

      .empty-text {
        font-size: 0.8rem;
        color: #555;
        font-style: italic;
      }
    `,
  ],
})
export class ChordChangerComponent {
  private changerService = inject(ChordChangerService);

  public negativeSteps = [-6, -5, -4, -3, -2, -1];
  public positiveSteps = [1, 2, 3, 4, 5, 6];

  public inputText = signal<string>('');
  public currentOffset = signal<number>(0);

  public analysis = computed(() => {
    return this.changerService.processText(
      this.inputText(),
      this.currentOffset()
    );
  });

  public setOffset(step: number): void {
    this.currentOffset.set(step);
  }
}
