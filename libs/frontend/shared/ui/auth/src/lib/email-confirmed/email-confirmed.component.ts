import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'lib-email-confirmed',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        @if (status() === 'loading') {
          <p class="loading">Confirming your email...</p>
        }
        @if (status() === 'success') {
          <h1 class="title">// email confirmed</h1>
          <p class="success-msg">Your account is now active.</p>
          <a routerLink="/login" class="btn-primary">go to login</a>
        }
        @if (status() === 'error') {
          <h1 class="title error-title">// error</h1>
          <p class="error-msg">{{ errorMessage() }}</p>
          <a routerLink="/login" class="btn-primary">back to login</a>
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
      text-align: center;
    }
    .title {
      font-family: 'Fira Code', monospace;
      color: #66fcf1;
      font-size: 1.4rem;
      margin: 0 0 1.5rem;
      font-weight: 400;
    }
    .error-title { color: #ff007f; }
    .loading {
      font-family: 'Fira Code', monospace;
      color: #888;
      font-size: 0.9rem;
    }
    .success-msg {
      font-family: 'Fira Code', monospace;
      color: #c5c6c7;
      margin: 0 0 1.5rem;
    }
    .error-msg {
      font-family: 'Fira Code', monospace;
      color: #ff007f;
      font-size: 0.85rem;
      margin: 0 0 1.5rem;
    }
    .btn-primary {
      display: inline-block;
      padding: 0.7rem 1.5rem;
      background: rgba(102, 252, 241, 0.1);
      border: 1px solid #66fcf1;
      border-radius: 4px;
      color: #66fcf1;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s ease;
    }
    .btn-primary:hover { background: rgba(102, 252, 241, 0.2); }
  `],
})
export class EmailConfirmedComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  public readonly status = signal<'loading' | 'success' | 'error'>('loading');
  public readonly errorMessage = signal<string>('');

  public ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.http
      .get<{ message: string }>('/api/auth/user/confirm-email', { params: { token } })
      .subscribe({
        next: () => this.status.set('success'),
        error: (err: { error?: { message?: string } }) => {
          this.status.set('error');
          this.errorMessage.set(err?.error?.message ?? 'Confirmation failed. The link may be expired.');
        },
      });
  }
}
