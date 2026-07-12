import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PatchApiService } from '@ivanrogulj.com/analog-synth';
import { AuthService } from '@ivanrogulj.com/auth';
import { AuthTooltipComponent } from '@ivanrogulj.com/auth-tooltip';

@Component({
  selector: 'lib-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthTooltipComponent],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="ai-prompt-container">
      @if (authService.currentUser()) {
        <button
          (click)="analogSynthViewModel.togglePrompt()"
          class="ai-prompt-button"
          [class.active]="vm.isPromptOpen"
          [disabled]="isLoading"
        >
          {{ vm.isPromptOpen ? 'CLOSE AI PROMPT' : 'OPEN AI PROMPT' }}
        </button>
      } @else {
        <lib-auth-tooltip>
          <button class="ai-prompt-button" [disabled]="true">
            OPEN AI PROMPT
          </button>
        </lib-auth-tooltip>
      }

      @if(vm.isPromptOpen){
      <div class="ai-prompt-popup">
        <textarea
          [(ngModel)]="patchAIDescription"
          class="ai-textarea"
          placeholder="What kind of patch do you want?"
          [disabled]="isLoading"
        ></textarea>

        @if (errorMessage) {
          <div class="error-message">{{ errorMessage }}</div>
        }

        <button
          (click)="generate()"
          class="generate-button"
          [disabled]="isLoading || !patchAIDescription.trim()"
        >
          @if (isLoading) {
            <span class="spinner"></span>
            GENERATING...
          } @else {
            GENERATE NEW AI PATCH
          }
        </button>
      </div>
      }
    </div>
    }

    @if (isLoading) {
      <div class="page-overlay"></div>
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

      .ai-prompt-button:hover:not(:disabled) {
        background: #1f2833;
        border-color: #555;
      }

      .ai-prompt-button.active {
        background: rgba(255, 0, 127, 0.1);
        border-color: #ff007f;
        color: #ff007f;
      }

      .ai-prompt-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ai-prompt-popup {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 400px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        z-index: 1001;
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation: fadeIn 0.2s ease-out;
      }

      .ai-textarea {
        width: 100%;
        min-height: 150px;
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

      .ai-textarea:disabled {
        opacity: 0.5;
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
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .generate-button:hover:not(:disabled) {
        background: rgba(102, 252, 241, 0.1);
        border-color: #66fcf1;
        color: #66fcf1;
      }

      .generate-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .error-message {
        background: rgba(255, 0, 0, 0.1);
        border: 1px solid #ff4444;
        color: #ff4444;
        padding: 8px 10px;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
      }

      .spinner {
        width: 12px;
        height: 12px;
        border: 2px solid #333;
        border-top-color: #66fcf1;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        flex-shrink: 0;
      }

      .page-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 1000;
        cursor: wait;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 640px) {
        .ai-prompt-button {
          width: 100%;
          min-width: 0;
        }

        .ai-prompt-popup {
          position: static;
          width: auto;
          margin-top: 8px;
        }
      }
    `,
  ],
})
export class TextareaComponent {
  public patchAIDescription = '';
  public isLoading = false;
  public errorMessage = '';

  public readonly analogSynthViewModel = inject(AnalogSynthViewModel);
  public readonly patchApiService = inject(PatchApiService);
  public readonly authService = inject(AuthService);

  public generate(): void {
    if (this.isLoading || !this.patchAIDescription.trim()) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.patchApiService.generateAIPatch(this.patchAIDescription).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to generate patch. Please try again.';
      },
    });
  }
}
