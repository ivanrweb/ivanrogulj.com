import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

const TOKEN_KEY = 'user_token';
const BASE_URL = '/api/auth/user';

interface JwtPayload {
  sub: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  exp: number;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  public readonly currentUser = signal<{ email: string; firstName: string | null; lastName: string | null } | null>(this.loadUserFromStorage());

  private loadUserFromStorage(): { email: string; firstName: string | null; lastName: string | null } | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const payload = parseJwt(token);
    if (!payload || payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return { email: payload.email, firstName: payload.firstName ?? null, lastName: payload.lastName ?? null };
  }

  public register(email: string, password: string, firstName: string, lastName: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${BASE_URL}/register`, { email, password, firstName, lastName });
  }

  public login(email: string, password: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${BASE_URL}/login`, { email, password }).pipe(
      tap((res) => this.setToken(res.access_token)),
    );
  }

  public setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    const payload = parseJwt(token);
    this.currentUser.set(payload ? { email: payload.email, firstName: payload.firstName ?? null, lastName: payload.lastName ?? null } : null);
  }

  public logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  public getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  public googleLogin(): void {
    window.location.href = '/api/auth/google';
  }
}
