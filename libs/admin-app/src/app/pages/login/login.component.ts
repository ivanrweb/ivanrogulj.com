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
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      .login-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #0b0c10;
        font-family: 'Inter', sans-serif;
      }
      .login-card {
        background: #1f2833;
        padding: 2.5rem;
        border-radius: 8px;
        width: 100%;
        max-width: 400px;
        border: 1px solid #333;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      }
      h1 {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        margin: 0 0 2rem;
        font-size: 1.5rem;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .field {
        margin-bottom: 1.25rem;
      }
      label {
        display: block;
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      input {
        width: 100%;
        padding: 0.75rem;
        background: #0b0c10;
        border: 1px solid #333;
        border-radius: 4px;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        box-sizing: border-box;
        &:focus {
          outline: none;
          border-color: #45a29e;
        }
      }
      .error {
        color: #f87171;
        font-size: 0.875rem;
        margin-bottom: 1rem;
        font-family: 'Fira Code', monospace;
      }
      button {
        width: 100%;
        padding: 0.875rem;
        background: rgba(102, 252, 241, 0.1);
        color: #66fcf1;
        border: 1px solid #45a29e;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.2s;
        &:hover:not(:disabled) {
          background: rgba(102, 252, 241, 0.2);
          border-color: #66fcf1;
        }
        &:disabled {
          opacity: 0.5;
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
