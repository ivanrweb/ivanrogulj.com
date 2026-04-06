import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChordChangerService } from '../service/chord-changer.service';
import { PdfExportService } from '../service/pdf-export.service';

@Component({
  selector: 'lib-chord-changer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="changer-dashboard">
      <div class="changer-header">
        <h3 class="changer-title">CHORD CHANGER</h3>

        <button class="btn-export" (click)="exportPdf()">EXPORT AS PDF</button>

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
          <textarea
            class="chord-textarea"
            [ngModel]="outputText()"
            (ngModelChange)="outputText.set($event)"
          ></textarea>
        </div>
      </div>

      <div class="analysis-footer">
        <div class="footer-left">
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
        </div>

        <div class="analysis-card">
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
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      :host {
        display: block;
        width: 100%;
        padding: 2rem;
        box-sizing: border-box;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
      }

      .changer-dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .changer-header {
        background: #1f2833;
        padding: 1.25rem 1.5rem;
        border-radius: 8px;
        border: 1px solid #333;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1.25rem;
      }

      .changer-title {
        margin: 0;
        font-family: 'Fira Code', monospace;
        font-weight: 700;
        letter-spacing: 2px;
        color: #66fcf1;
        font-size: 1.2rem;
        text-transform: uppercase;
      }

      .transpose-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .control-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        color: #888;
        font-weight: 700;
        letter-spacing: 1.5px;
      }

      .btn-group {
        display: flex;
        gap: 3px;
        background: #0b0c10;
        padding: 4px;
        border-radius: 6px;
        border: 1px solid #333;
      }

      .btn-step {
        background: #1f2833;
        border: 1px solid #333;
        color: #888;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-weight: 700;
        font-size: 0.78rem;
        transition: all 0.15s ease;
        min-width: 34px;
        text-align: center;
      }

      .btn-step:hover {
        background: #2a3545;
        color: #c5c6c7;
        border-color: #555;
      }

      .btn-step.active {
        background: rgba(102, 252, 241, 0.12);
        color: #66fcf1;
        border-color: #66fcf1;
        box-shadow: 0 0 8px rgba(102, 252, 241, 0.25);
      }

      .btn-zero {
        margin: 0 3px;
        color: #c5c6c7;
      }

      .btn-zero.active {
        background: rgba(255, 0, 127, 0.12);
        color: #ff007f;
        border-color: #ff007f;
        box-shadow: 0 0 8px rgba(255, 0, 127, 0.25);
      }

      .main-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        min-height: 400px;
      }

      @media (max-width: 768px) {
        .main-content {
          grid-template-columns: 1fr;
        }
      }

      .section-label {
        display: block;
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }

      .editor-section,
      .output-section {
        display: flex;
        flex-direction: column;
      }

      .chord-textarea {
        flex-grow: 1;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        color: #c5c6c7;
        padding: 1rem;
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        line-height: 1.6;
        resize: none;
        outline: none;
        transition: border-color 0.2s ease;
        white-space: pre;
        min-height: 300px;
      }

      .chord-textarea:focus {
        border-color: #66fcf1;
        box-shadow: 0 0 0 1px rgba(102, 252, 241, 0.15);
      }

      .chord-textarea::placeholder {
        color: #444;
      }

      .btn-export {
        background: rgba(102, 252, 241, 0.08);
        border: 1px solid #66fcf1;
        color: #66fcf1;
        padding: 6px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-weight: 700;
        font-size: 0.72rem;
        letter-spacing: 1px;
        transition: all 0.15s ease;
        white-space: nowrap;
      }

      .btn-export:hover {
        background: rgba(102, 252, 241, 0.18);
        box-shadow: 0 0 8px rgba(102, 252, 241, 0.25);
      }

      .analysis-footer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .footer-left {
        display: flex;
        gap: 1rem;
      }

      @media (max-width: 768px) {
        .analysis-footer {
          grid-template-columns: 1fr;
        }

        .footer-left {
          flex-wrap: wrap;
        }
      }

      .analysis-card {
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .key-card {
        min-width: 160px;
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
        background: rgba(102, 252, 241, 0.05);
        border: 1px solid rgba(102, 252, 241, 0.1);
        padding: 4px 10px;
        border-radius: 4px;
      }

      .prob-name {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        font-weight: 700;
        font-size: 0.9rem;
      }

      .prob-val {
        color: #888;
        font-size: 0.8rem;
      }

      .footer-left .flex-grow {
        flex-grow: 1;
      }

      .card-title {
        font-family: 'Fira Code', monospace;
        font-size: 0.62rem;
        color: #888;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .pill-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .chord-pill {
        background: rgba(255, 0, 127, 0.08);
        border: 1px solid rgba(255, 0, 127, 0.35);
        color: #ff007f;
        padding: 3px 10px;
        border-radius: 12px;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        font-weight: 700;
      }

      .progression-pill {
        background: rgba(69, 162, 158, 0.08);
        border: 1px solid rgba(69, 162, 158, 0.35);
        color: #45a29e;
        padding: 3px 10px;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        font-weight: 700;
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
  private pdfExportService = inject(PdfExportService);

  public negativeSteps = [-6, -5, -4, -3, -2, -1];
  public positiveSteps = [1, 2, 3, 4, 5, 6];

  public inputText = signal<string>('');
  public currentOffset = signal<number>(0);
  public outputText = signal<string>('');

  public analysis = computed(() =>
    this.changerService.processText(this.inputText(), this.currentOffset())
  );

  constructor() {
    effect(() => {
      this.outputText.set(this.analysis().transposedText);
    });
  }

  public setOffset(step: number): void {
    this.currentOffset.set(step);
  }

  public exportPdf(): void {
    this.pdfExportService.exportText(this.outputText());
  }
}
