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
      }

      /* General button styling */
      .ai-prompt-button,
      .generate-button {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: background-color 0.2s ease-in-out;
      }

      /* Primary button styling */
      .ai-prompt-button {
        background-color: #343a40;
        color: white;
      }

      .ai-prompt-button:hover {
        background-color: #5a6268;
      }

      /* Box containing textarea and generate button */
      .ai-prompt-box {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      /* Textarea styling */
      .ai-textarea {
        width: 100%;
        min-height: 100px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 14px;
        resize: vertical;
        transition: border-color 0.2s ease-in-out;
      }

      /* Generate button styling */
      .generate-button {
        background-color: #343a40;
        color: white;
      }

      .generate-button:hover {
        background-color: #5a6268;
      }
    `,
  ],
})
export class TextareaComponent {
  public patchAIDescription = '';

  public analogSynthViewModel = inject(AnalogSynthViewModel);
}
