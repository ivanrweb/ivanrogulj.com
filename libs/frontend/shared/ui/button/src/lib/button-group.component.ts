import { Component } from '@angular/core';

/**
 * Container for a group of toggle buttons.
 * Provides the dark pill background with consistent spacing.
 *
 * Usage:
 *   <lib-btn-group>
 *     <button libBtn variant="toggle" [active]="mode === 'a'" (click)="mode = 'a'">A</button>
 *     <button libBtn variant="toggle" [active]="mode === 'b'" (click)="mode = 'b'">B</button>
 *   </lib-btn-group>
 */
@Component({
  selector: 'lib-btn-group',
  standalone: true,
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: flex;
        gap: 3px;
        background: #0b0c10;
        padding: 4px;
        border-radius: 6px;
        border: 1px solid #333;
      }
    `,
  ],
})
export class BtnGroupComponent {}
