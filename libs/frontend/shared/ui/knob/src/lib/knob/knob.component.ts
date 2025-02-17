import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-knob',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knob.component.html',
  styleUrl: './knob.component.scss',
})
export class KnobComponent {
  @Input()
  public minValue = 0;

  @Input()
  public maxValue = 100;

  @Input()
  public label = '';

  @Input()
  public amount = 0;

  @Input()
  public measureUnit?: string;

  private _value = 0;

  @Input()
  public set value(val: number) {
    this._value = val;
    this.rotation = this.mapValueToRotation(this._value);
  }

  public get value(): number {
    return this._value;
  }

  @Output()
  public valueChange = new EventEmitter<number>();

  public rotation = 135; // Default position

  private isDragging = false;
  private startY: number | null = null;
  private startRotation: number | null = null;
  private screenHeight: number = window.innerHeight;
  private minY: number = this.screenHeight * 0.25;
  private maxY: number = this.screenHeight * 0.75;

  public startDragging(event: MouseEvent): void {
    this.isDragging = true;
    this.startY = event.clientY;
    this.startRotation = this.rotation;
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.stopDragging.bind(this));
    event.preventDefault();
  }

  public stopDragging = (): void => {
    this.isDragging = false;
    this.startY = null;
    this.startRotation = null;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.stopDragging);
  };

  public onMouseMove = (event: MouseEvent): void => {
    if (this.isDragging && this.startY !== null && this.startRotation !== null) {
      const clampedY = Math.max(this.minY, Math.min(this.maxY, event.clientY));
      const percentage = (clampedY - this.minY) / (this.maxY - this.minY);
      const deltaRotation = (1 - percentage) * 270 - 135;
      this.rotation = this.startRotation + deltaRotation;
      this.rotation = Math.max(0, Math.min(270, this.rotation));

      // Update value and emit
      this._value = this.mapRotationToValue(this.rotation);
      this.valueChange.emit(this._value);
    }
  };

  private mapRotationToValue(rotation: number): number {
    return this.minValue + ((rotation / 270) * (this.maxValue - this.minValue));
  }

  private mapValueToRotation(value: number): number {
    return ((value - this.minValue) / (this.maxValue - this.minValue)) * 270;
  }
}
