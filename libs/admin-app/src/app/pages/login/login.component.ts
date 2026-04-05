import { Component, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

interface LoginState {
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  providers: [ComponentStore],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <h1>Admin Login</h1>
        <form (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              [(ngModel)]="username"
              name="username"
              autocomplete="username"
              required
            />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              autocomplete="current-password"
              required
            />
          </div>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <button type="submit" [disabled]="loading()">
            @if (loading()) { Logging in... } @else { Login }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #1a1a2e;
      }
      .login-card {
        background: #16213e;
        padding: 2.5rem;
        border-radius: 12px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }
      h1 {
        color: #e2e8f0;
        margin-bottom: 2rem;
        font-size: 1.5rem;
        text-align: center;
      }
      .field {
        margin-bottom: 1.25rem;
      }
      label {
        display: block;
        color: #94a3b8;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }
      input {
        width: 100%;
        padding: 0.75rem;
        background: #0f3460;
        border: 1px solid #334155;
        border-radius: 8px;
        color: #e2e8f0;
        font-size: 1rem;
        box-sizing: border-box;
        &:focus {
          outline: none;
          border-color: #6366f1;
        }
      }
      .error {
        color: #f87171;
        font-size: 0.875rem;
        margin-bottom: 1rem;
      }
      button {
        width: 100%;
        padding: 0.875rem;
        background: #6366f1;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        &:hover:not(:disabled) {
          background: #4f46e5;
        }
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private readonly store = new ComponentStore<LoginState>({
    loading: false,
    error: null,
  });
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  public username = '';
  public password = '';

  public readonly loading = this.store.selectSignal(s => s.loading);
  public readonly error = this.store.selectSignal(s => s.error);

  public onSubmit(): void {
    this.store.patchState({ loading: true, error: null });
    this.http
      .post<{ access_token: string }>(
        'http://localhost:3000/api/auth/login',
        {
          username: this.username,
          password: this.password,
        },
      )
      .pipe(
        tap(res => {
          localStorage.setItem('admin_token', res.access_token);
          this.router.navigate(['/dashboard']);
        }),
        catchError(err => {
          this.store.patchState({
            loading: false,
            error: err?.error?.message ?? 'Invalid credentials',
          });
          return EMPTY;
        }),
      )
      .subscribe(() => this.store.patchState({ loading: false }));
  }
}
