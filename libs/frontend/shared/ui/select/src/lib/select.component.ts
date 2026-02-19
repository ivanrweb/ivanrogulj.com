import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'lib-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="select-wrapper" [class.open]="isOpen()">
      <div class="select-trigger" (click)="toggleOpen()">
        <span class="selected-label">{{ selectedLabel() }}</span>
        <i class="chevron">▼</i>
      </div>

      @if (isOpen()) {
      <div class="select-dropdown">
        @for (option of options(); track option.value) {
        <div
          class="select-option"
          [class.active]="option.value === value()"
          (click)="selectOption(option)"
        >
          {{ option.label }}
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        position: relative;
      }

      .select-wrapper {
        position: relative;
        width: 100%;
        user-select: none;
      }

      .select-trigger {
        background: #0a0a0a;
        color: #d0d0d0;
        border: 1px solid #444;
        padding: 4px 8px;
        font-size: 0.75rem;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s ease;
        min-width: 80px;
        box-sizing: border-box;
      }

      .select-trigger:hover,
      .select-wrapper.open .select-trigger {
        border-color: #d0d0d0;
        background: #1a1a1a;
      }

      .chevron {
        font-size: 0.5rem;
        color: #888;
        transition: transform 0.2s ease;
      }

      .select-wrapper.open .chevron {
        transform: rotate(180deg);
      }

      .select-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: #0a0a0a;
        border: 1px solid #d0d0d0;
        border-top: none;
        z-index: 100;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }

      .select-option {
        padding: 6px 8px;
        color: #888;
        font-size: 0.75rem;
        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 1px solid #222;
      }

      .select-option:last-child {
        border-bottom: none;
      }

      .select-option:hover {
        background: #1a1a1a;
        color: #d0d0d0;
      }

      .select-option.active {
        color: #d0d0d0;
        background: #1a1a1a;
      }
    `,
  ],
})
export class SelectComponent {
  private eRef = inject(ElementRef);
  public options = input<SelectOption[]>([]);
  public value = input<string>('');

  public valueChange = output<string>();

  public isOpen = signal<boolean>(false);

  public selectedLabel = computed(() => {
    const selected = this.options().find((o) => o.value === this.value());
    return selected ? selected.label : 'SELECT';
  });

  public toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  public selectOption(option: SelectOption): void {
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  public clickOut(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
