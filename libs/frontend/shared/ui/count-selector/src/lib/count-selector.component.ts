import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-count-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="control-wrapper">
      @if (label) {
      <label class="label">{{ label }}</label>
      }

      <div class="digital-container">
        <button
          class="step-btn"
          [class.disabled]="value <= min"
          (click)="decrement()"
        >
          -
        </button>

        <div class="screen">
          <i [class]="'icon-fad-digital' + value"></i>
          <i [class]="'icon-fad-digital' + value + ' glow'"></i>
        </div>

        <button
          class="step-btn"
          [class.disabled]="value >= max"
          (click)="increment()"
        >
          +
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        user-select: none;
      }
      .control-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .label {
        font-size: 10px;
        color: #888;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .digital-container {
        display: flex;
        align-items: center;
        background: #1a1a1a;
        padding: 4px;
        border-radius: 6px;
        border: 1px solid #333;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
        gap: 6px;
      }
      .screen {
        position: relative;
        width: 36px;
        height: 40px;
        background: #0a0a0a;
        border: 1px solid #222;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
      i[class^='icon-fad-digital'] {
        font-style: normal;
        font-size: 28px;
        color: #ff3333;
        line-height: 1;
        z-index: 2;
      }
      .glow {
        position: absolute;
        filter: blur(5px);
        opacity: 0.6;
        z-index: 1;
      }
      .step-btn {
        background: #333;
        border: 1px solid #444;
        color: #ccc;
        width: 24px;
        height: 24px;
        border-radius: 3px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        padding: 0;
        transition: all 0.1s;
      }
      .step-btn:hover:not(.disabled) {
        background: #444;
        border-color: #666;
        color: #fff;
      }
      .step-btn:active:not(.disabled) {
        background: #222;
        transform: translateY(1px);
      }
      .step-btn.disabled {
        opacity: 0.3;
        cursor: default;
        background: #222;
        border-color: #222;
        color: #555;
      }
    `,
  ],
})
export class CountSelectorComponent {
  @Input() public label = '';
  @Input() public value = 1;
  @Input() public min = 0;
  @Input() public max = 9;

  @Output() public valueChange = new EventEmitter<number>();

  public increment(): void {
    if (this.value < this.max) {
      this.update(this.value + 1);
    }
  }

  public decrement(): void {
    if (this.value > this.min) {
      this.update(this.value - 1);
    }
  }

  private update(newVal: number): void {
    this.value = newVal;
    this.valueChange.emit(this.value);
  }
}
