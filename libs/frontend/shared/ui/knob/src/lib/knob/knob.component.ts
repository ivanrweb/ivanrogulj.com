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
      <div class="knob-container" [class.learning-mode]="isLearningMode">
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
        <span [class.is-mapped]="isMapped">{{ label }}</span>
        <span class="value-display"
          >{{ value | number : '1.1-1' }} {{ measureUnit }}</span
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
      }

      .knob-container {
        width: 4rem;
        height: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &.learning-mode {
          border: 2px solid #2978ff;
          box-shadow: 0 0 12px #2978ff;
          border-radius: 50%;
        }
      }

      .knob-render {
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .knob-icon {
        display: inline-block;
        font-size: 3rem;
        line-height: 1;
        cursor: pointer;
        color: #333;
        transform-origin: center center;

        width: 1em;
        height: 1em;
        text-align: center;

        transition: transform 0.1s linear;

        &:active {
          color: #111;
        }
      }

      .knob-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.75rem;
        margin-top: 4px;
      }

      .is-mapped::after {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #2978ff;
        border-radius: 50%;
        margin-left: 0.4em;
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
