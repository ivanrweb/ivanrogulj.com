import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-knob',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="knob-wrapper">
      <div class="knob-container" [class.learning-mode]="isLearningMode && !isPendingMapping && !isMapped" [class.pending-mapping]="isPendingMapping">
        <div class="knob-render">
          <i
            class="icon-fad-slider-round-3 knob-icon"
            [ngStyle]="{ transform: 'rotate(' + (rotation - 135) + 'deg)' }"
            (mousedown)="startDragging($event)"
          >
          </i>
        </div>
      </div>

      <div class="knob-info">
        <span class="knob-label" [class.is-mapped]="isMapped">{{ label }}</span>
        <span class="value-display"
          >{{ value | number : '1.1-1' }}
          <span class="unit">{{ measureUnit }}</span></span
        >
      </div>
    </div>
  `,
  styles: [
    `
      .knob-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        user-select: none;
        width: 4.5rem;
        font-family: 'Inter', sans-serif;
      }

      .knob-container {
        width: 3.5rem;
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: radial-gradient(circle, #1f2833 0%, #0b0c10 100%);
        border-radius: 50%;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.9),
          0 1px 0 rgba(255, 255, 255, 0.1);
        margin-bottom: 4px;

        &.learning-mode {
          border: 2px solid #ff007f;
          box-shadow: 0 0 10px #ff007f;
        }

        &.pending-mapping {
          border: 2px solid #66fcf1;
          box-shadow: 0 0 12px #66fcf1, 0 0 4px #66fcf1 inset;
          animation: knob-pending-pulse 1.2s ease-in-out infinite;
        }
      }

      .knob-render {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .knob-icon {
        display: inline-block;
        font-size: 3.2rem;
        line-height: 1;
        cursor: pointer;
        color: #d0d0d0;
        transform-origin: center center;
        width: 1em;
        height: 1em;
        text-align: center;
        filter: drop-shadow(0 4px 5px rgba(0, 0, 0, 0.6));
        transition: color 0.1s;

        &:hover {
          color: #ffffff;
        }

        &:active {
          color: #a0a0a0;
          transform: scale(0.98);
        }
      }

      .knob-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        width: 100%;
      }

      .knob-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        text-align: center;
        white-space: nowrap;
      }

      .value-display {
        font-size: 0.7rem;
        color: #66fcf1;
        font-family: 'Fira Code', monospace;
        background: rgba(0, 0, 0, 0.4);
        padding: 2px 6px;
        border-radius: 3px;
        white-space: nowrap;
        text-align: center;
        border: 1px solid #333;
        text-shadow: 0 0 5px rgba(102, 252, 241, 0.3);
      }

      .unit {
        font-size: 0.6rem;
        color: #888;
        margin-left: 2px;
      }

      .is-mapped {
        color: #c5c6c7;
      }

      @keyframes knob-pending-pulse {
        0%, 100% { box-shadow: 0 0 8px #66fcf1; }
        50% { box-shadow: 0 0 18px #66fcf1, 0 0 6px #66fcf1 inset; }
      }

      .is-mapped::after {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        background-color: #66fcf1;
        border-radius: 50%;
        margin-left: 5px;
        vertical-align: middle;
        box-shadow: 0 0 5px #66fcf1;
      }
    `,
  ],
})
export class KnobComponent {
  @Input() public minValue = 0;
  @Input() public maxValue = 100;
  @Input() public label = '';
  @Input() public measureUnit?: string;
  @Input() public isLearningMode = false;
  @Input() public isMapped = false;
  @Input() public isPendingMapping = false;

  private _value = 0;
  @Input() public set value(val: number) {
    this._value = val;
    this.rotation = this.mapValueToRotation(this._value);
  }
  public get value(): number {
    return this._value;
  }

  @Output() public valueChange = new EventEmitter<number>();
  @Output() public learn = new EventEmitter<void>();

  public rotation = 135;
  private isDragging = false;
  private startX: number | null = null;
  private startY: number | null = null;
  private startRotation: number | null = null;

  // This number is inversely proportional to knob rotation speed
  private dragRange = 300;

  public startDragging(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startRotation = this.rotation;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.stopDragging = this.stopDragging.bind(this);

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.stopDragging);
    event.preventDefault();
  }

  public stopDragging(): void {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.stopDragging);
  }

  public onMouseMove(event: MouseEvent): void {
    if (
      this.isDragging &&
      this.startX !== null &&
      this.startY !== null &&
      this.startRotation !== null
    ) {
      const deltaX = event.clientX - this.startX;
      const deltaY = this.startY - event.clientY;
      const totalDelta = deltaX + deltaY;

      const rotationStep = (totalDelta / this.dragRange) * 270;

      let newRotation = this.startRotation + rotationStep;
      newRotation = Math.max(0, Math.min(270, newRotation));

      this.rotation = newRotation;
      this._value = this.mapRotationToValue(this.rotation);
      this.valueChange.emit(this._value);
    }
  }

  private mapRotationToValue(rotation: number): number {
    return this.minValue + (rotation / 270) * (this.maxValue - this.minValue);
  }

  private mapValueToRotation(value: number): number {
    const clampedValue = Math.max(
      this.minValue,
      Math.min(this.maxValue, value)
    );
    return (
      ((clampedValue - this.minValue) / (this.maxValue - this.minValue)) * 270
    );
  }

  @HostListener('dblclick', ['$event'])
  public onDoubleClick(event: MouseEvent): void {
    if (this.isLearningMode) {
      event.preventDefault();
      this.learn.emit();
    }
  }
}
