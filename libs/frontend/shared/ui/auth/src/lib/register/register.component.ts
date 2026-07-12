import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../auth.service';

interface RegisterState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

@Component({
  selector: 'lib-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIcon],
  providers: [ComponentStore],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <h1 class="title">Register</h1>

        @if (success()) {
          <div class="success-box">
            <p class="success-msg">Registration successful!</p>
            <p class="success-sub">Check your email for a confirmation link before logging in.</p>
            <a routerLink="/login" class="btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:1.2rem;">go to login</a>
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()">
            <div class="field-row">
              <div class="field">
                <label for="firstName">first name</label>
                <input id="firstName" type="text" [(ngModel)]="firstName" name="firstName" required autocomplete="given-name" />
              </div>
              <div class="field">
                <label for="lastName">last name</label>
                <input id="lastName" type="text" [(ngModel)]="lastName" name="lastName" required autocomplete="family-name" />
              </div>
            </div>
            <div class="field">
              <label for="email">email</label>
              <input id="email" type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
            </div>
            <div class="field">
              <label for="password">password</label>
              <input id="password" type="password" [(ngModel)]="password" name="password" required autocomplete="new-password" />
            </div>
            <div class="field">
              <label for="confirm">confirm password</label>
              <input id="confirm" type="password" [(ngModel)]="confirmPassword" name="confirm" required autocomplete="new-password" />
            </div>
            @if (error()) {
              <p class="error">{{ error() }}</p>
            }
            <button type="submit" class="btn-primary" [disabled]="loading()">
              @if (loading()) { creating account... } @else { register }
            </button>
          </form>

          <div class="divider"><span>or</span></div>

          <button class="btn-google" (click)="googleLogin()" type="button">
            <ng-icon name="phosphorGoogleLogoBold" size="1.3rem"></ng-icon> register with Google
          </button>

          <p class="alt-link">Already have an account? <a routerLink="/login">login</a></p>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0b0c10;
      padding: 2rem;
    }
    .auth-card {
      background: #1f2833;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-sizing: border-box;
    }
    .title {
      font-family: 'Fira Code', monospace;
      color: #66fcf1;
      font-size: 1.4rem;
      margin: 0 0 2rem;
      font-weight: 400;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1.2rem;
    }
    label {
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      color: #888;
      letter-spacing: 0.5px;
    }
    input {
      background: #0b0c10;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 0.6rem 0.8rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      color: #c5c6c7;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
      width: 100%;
    }
    input:focus { border-color: #66fcf1; }
    @media (max-width: 640px) {
      input { font-size: 16px; }
    }
    .error {
      font-family: 'Fira Code', monospace;
      font-size: 0.82rem;
      color: #ff007f;
      margin: 0 0 1rem;
    }
    .btn-primary {
      width: 100%;
      padding: 0.7rem;
      background: rgba(102, 252, 241, 0.1);
      border: 1px solid #66fcf1;
      border-radius: 4px;
      color: #66fcf1;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: background 0.2s ease;
      margin-top: 0.5rem;
    }
    .btn-primary:hover:not(:disabled) { background: rgba(102, 252, 241, 0.2); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
    }
    .success-box { text-align: center; }
    .success-msg {
      font-family: 'Fira Code', monospace;
      color: #66fcf1;
      font-size: 1rem;
      margin: 0 0 0.5rem;
    }
    .success-sub {
      font-family: 'Fira Code', monospace;
      color: #888;
      font-size: 0.85rem;
      margin: 0;
    }
    .alt-link {
      font-family: 'Fira Code', monospace;
      font-size: 0.82rem;
      color: #888;
      text-align: center;
      margin: 1.5rem 0 0;
    }
    .alt-link a { color: #66fcf1; text-decoration: none; }
    .alt-link a:hover { text-decoration: underline; }
    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-top: 1px solid #333;
    }
    .divider span {
      font-family: 'Fira Code', monospace;
      font-size: 0.75rem;
      color: #555;
    }
    .btn-google {
      width: 100%;
      padding: 0.7rem;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      color: #333;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      transition: background 0.2s ease;

      ng-icon {
        color: #4285f4;
        display: flex;
        align-items: center;
      }
    }
    .btn-google:hover { background: #f5f5f5; }
  `],
})
export class RegisterComponent {
  private readonly store = new ComponentStore<RegisterState>({ loading: false, error: null, success: false });
  private readonly authService = inject(AuthService);

  public firstName = '';
  public lastName = '';
  public email = '';
  public password = '';
  public confirmPassword = '';
  public readonly loading = this.store.selectSignal((s) => s.loading);
  public readonly error = this.store.selectSignal((s) => s.error);
  public readonly success = this.store.selectSignal((s) => s.success);

  public googleLogin(): void {
    this.authService.googleLogin();
  }

  public onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.store.patchState({ error: 'Passwords do not match.' });
      return;
    }
    this.store.patchState({ loading: true, error: null });
    this.authService
      .register(this.email, this.password, this.firstName, this.lastName)
      .pipe(
        tap(() => {
          this.store.patchState({ loading: false, success: true });
        }),
        catchError((err: { error?: { message?: string } }) => {
          this.store.patchState({
            loading: false,
            error: err?.error?.message ?? 'Registration failed. Please try again.',
          });
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
