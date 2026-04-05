import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="ai-prompt-container">
      <button
        (click)="analogSynthViewModel.togglePrompt()"
        class="ai-prompt-button"
        [class.active]="vm.isPromptOpen"
      >
        {{ vm.isPromptOpen ? 'CLOSE AI PROMPT' : 'OPEN AI PROMPT' }}
      </button>

      @if(vm.isPromptOpen){
      <div class="ai-prompt-popup">
        <textarea
          [(ngModel)]="patchAIDescription"
          class="ai-textarea"
          placeholder="What kind of patch do you want?"
        ></textarea>
        <button
          (click)="analogSynthViewModel.generateAIPatch(patchAIDescription)"
          class="generate-button"
        >
          GENERATE NEW AI PATCH
        </button>
      </div>
      }
    </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ai-prompt-container {
        position: relative;
      }

      .ai-prompt-button {
        background: #0b0c10;
        border: 1px solid #333;
        color: #c5c6c7;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 1px;
        transition: all 0.2s;
        white-space: nowrap;
        height: 33px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 150px;
        box-sizing: border-box;
      }

      .ai-prompt-button:hover {
        background: #1f2833;
        border-color: #555;
      }

      .ai-prompt-button.active {
        background: rgba(255, 0, 127, 0.1);
        border-color: #ff007f;
        color: #ff007f;
      }

      .ai-prompt-popup {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 300px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation: fadeIn 0.2s ease-out;
      }

      .ai-textarea {
        width: 100%;
        min-height: 120px;
        padding: 10px;
        background: #0b0c10;
        border: 1px solid #333;
        color: #c5c6c7;
        border-radius: 6px;
        font-family: 'Fira Code', monospace;
        font-size: 13px;
        resize: vertical;
        box-sizing: border-box;
      }

      .generate-button {
        background: #0b0c10;
        border: 1px solid #333;
        color: #c5c6c7;
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 1px;
        transition: all 0.2s;
      }

      .generate-button:hover {
        background: rgba(102, 252, 241, 0.1);
        border-color: #66fcf1;
        color: #66fcf1;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class TextareaComponent {
  public patchAIDescription = '';
  public analogSynthViewModel = inject(AnalogSynthViewModel);
}
