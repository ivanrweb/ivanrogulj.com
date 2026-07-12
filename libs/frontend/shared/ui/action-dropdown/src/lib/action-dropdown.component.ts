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

export interface ActionDropdownItem {
  id: string;
  name: string;
}

export interface ActionDropdownSection {
  label?: string;
  items: ActionDropdownItem[];
  /** Show a delete button per item. Defaults to true. */
  deletable?: boolean;
}

@Component({
  selector: 'lib-action-dropdown',
  standalone: true,
  template: `
    <div class="dropdown-wrapper" [class.open]="isOpen()">
      <button
        class="dropdown-trigger"
        [class.has-selection]="selectedId() !== null && selectedId() !== ''"
        (click)="toggleOpen()"
      >
        <span class="dropdown-trigger-text">{{ selectedName() || placeholder() }}</span>
        <span class="dropdown-arrow">▾</span>
      </button>

      @if (isOpen()) {
        <div class="dropdown-panel">
          @if (isEmpty()) {
            <div class="dropdown-empty">{{ emptyText() }}</div>
          } @else {
            @for (section of sections(); track $index) {
              @if (section.label) {
                <div class="dropdown-section-label">{{ section.label }}</div>
              }
              @for (item of section.items; track item.id) {
                <div
                  class="dropdown-item"
                  [class.selected]="item.id === selectedId()"
                >
                  <span class="dropdown-item-name" (click)="onSelect(item)">{{ item.name }}</span>
                  @if (section.deletable !== false) {
                    <button
                      class="dropdown-delete-btn"
                      (click)="onDelete(item.id, $event)"
                    >×</button>
                  }
                </div>
              }
            }
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }

      .dropdown-wrapper {
        position: relative;
      }

      .dropdown-trigger {
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
        min-width: 160px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        transition: border-color 0.2s;
        white-space: nowrap;

        &:hover {
          border-color: #555;
        }

        &.has-selection {
          color: #66fcf1;
          border-color: rgba(102, 252, 241, 0.4);
        }
      }

      .dropdown-trigger-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }

      .dropdown-arrow {
        font-size: 0.65rem;
        opacity: 0.6;
        flex-shrink: 0;
      }

      .dropdown-panel {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        min-width: 220px;
        max-height: 480px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        z-index: 1002;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(69, 162, 158, 0.2) transparent;

        &::-webkit-scrollbar {
          width: 3px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(69, 162, 158, 0.15);
          border-radius: 2px;
          transition: background 0.5s ease;
        }

        &:hover::-webkit-scrollbar-thumb {
          background: rgba(69, 162, 158, 0.6);
          transition: background 0.15s ease;
        }
      }

      .dropdown-section-label {
        padding: 6px 14px 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #45a29e;
        border-top: 1px solid #333;

        &:first-child {
          border-top: none;
        }
      }

      .dropdown-empty {
        padding: 10px 14px;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        color: #888;
        font-style: italic;
      }

      .dropdown-item {
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

      .dropdown-item-name {
        flex: 1;
        padding: 8px 14px;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #c5c6c7;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
          color: #66fcf1;
        }

        .selected & {
          color: #66fcf1;
        }
      }

      .dropdown-delete-btn {
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

      @media (max-width: 640px) {
        .dropdown-panel {
          left: 0;
          right: 0;
          width: auto;
          min-width: 0;
        }
      }
    `,
  ],
})
export class ActionDropdownComponent {
  private readonly eRef = inject(ElementRef);

  public sections = input<ActionDropdownSection[]>([]);
  public selectedId = input<string | null>(null);
  public placeholder = input<string>('— select —');
  public emptyText = input<string>('no items saved');

  public selected = output<ActionDropdownItem>();
  public deleted = output<string>();

  public isOpen = signal<boolean>(false);

  public selectedName = computed<string>(() => {
    const id = this.selectedId();
    if (!id) return '';
    for (const section of this.sections()) {
      const item = section.items.find((i) => i.id === id);
      if (item) return item.name;
    }
    return '';
  });

  public isEmpty = computed<boolean>(() =>
    this.sections().every((s) => s.items.length === 0)
  );

  public toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  public onSelect(item: ActionDropdownItem): void {
    this.selected.emit(item);
    this.isOpen.set(false);
  }

  public onDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.deleted.emit(id);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  public onClickOut(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
