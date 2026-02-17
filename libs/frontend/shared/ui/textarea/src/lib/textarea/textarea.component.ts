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
      >
        {{ vm.isPromptOpen ? 'Close AI prompt' : 'Open AI Prompt' }}
      </button>
      @if(vm.isPromptOpen){
      <div class="ai-prompt-box">
        <textarea
          [(ngModel)]="patchAIDescription"
          class="ai-textarea"
          placeholder="What kind of patch do you want?"
        ></textarea>
        <button
          (click)="analogSynthViewModel.generateAIPatch(patchAIDescription)"
          class="generate-button"
        >
          Generate new AI patch
        </button>
      </div>
      }
    </div>
    }
  `,
  styles: [
    `
      /* Container for the AI prompt */
      .ai-prompt-container {
        padding: 16px;
        font-family: Arial, sans-serif;
        color: #e0e0e0;
      }

      /* General button styling */
      .ai-prompt-button,
      .generate-button {
        padding: 10px 16px;
        border: 1px solid #444;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.2s ease-in-out;
        background-color: #2a2a2a;
        color: #e0e0e0;
      }

      /* Primary button styling */
      .ai-prompt-button:hover,
      .generate-button:hover {
        background-color: #444;
        border-color: #666;
        color: #fff;
      }

      /* Box containing textarea and generate button */
      .ai-prompt-box {
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        animation: fadeIn 0.3s ease;
      }

      /* Textarea styling */
      .ai-textarea {
        width: 100%;
        min-height: 100px;
        padding: 10px;
        background: #121212;
        border: 1px solid #333;
        color: #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        resize: vertical;
        transition: border-color 0.2s ease-in-out;
        box-sizing: border-box;
      }

      .ai-textarea:focus {
        outline: none;
        border-color: #666;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
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
