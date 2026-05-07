import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { AuthService } from '../auth.service';

interface LoginState {
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  providers: [ComponentStore],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <h1 class="title">Login</h1>

        <form (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="email">email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              autocomplete="email"
            />
          </div>
          <div class="field">
            <label for="password">password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
            />
          </div>

          @if (error()) {
          <p class="error">{{ error() }}</p>
          }

          <button type="submit" class="btn-primary" [disabled]="loading()">
            @if (loading()) { authenticating... } @else { login }
          </button>
        </form>

        <div class="divider"><span>or</span></div>

        <button class="btn-google" (click)="googleLogin()" type="button">
          <span class="google-icon">G</span> continue with Google
        </button>

        <p class="alt-link">
          No account? <a routerLink="/register">Register for free</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
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
      input:focus {
        border-color: #66fcf1;
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
      .btn-primary:hover:not(:disabled) {
        background: rgba(102, 252, 241, 0.2);
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
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
      }
      .btn-google:hover {
        background: #f5f5f5;
      }
      .google-icon {
        font-weight: 700;
        font-size: 1rem;
        color: #4285f4;
      }
      .alt-link {
        font-family: 'Fira Code', monospace;
        font-size: 0.82rem;
        color: #888;
        text-align: center;
        margin: 1.5rem 0 0;
      }
      .alt-link a {
        color: #66fcf1;
        text-decoration: none;
      }
      .alt-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private readonly store = new ComponentStore<LoginState>({
    loading: false,
    error: null,
  });
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public email = '';
  public password = '';
  public readonly loading = this.store.selectSignal((s) => s.loading);
  public readonly error = this.store.selectSignal((s) => s.error);

  public ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.setToken(token);
      this.router.navigate(['/'], { replaceUrl: true });
    }
  }

  public onSubmit(): void {
    this.store.patchState({ loading: true, error: null });
    this.authService
      .login(this.email, this.password)
      .pipe(
        tap(() => {
          this.store.patchState({ loading: false });
          this.router.navigate(['/']);
        }),
        catchError((err: { error?: { message?: string } }) => {
          this.store.patchState({
            loading: false,
            error: err?.error?.message ?? 'Invalid credentials.',
          });
          return EMPTY;
        })
      )
      .subscribe();
  }

  public googleLogin(): void {
    this.authService.googleLogin();
  }
}
