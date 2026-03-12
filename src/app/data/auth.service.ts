import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';

import {
  AuthActionResult,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessTokenKey = 'rh_access_token';

  accessToken$ = new BehaviorSubject<string | null>(this.getAccessToken());
  currentUser$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(private http: HttpClient) {}

  private extractErrorMessage(error: any, fallback: string): string {
    const message = error?.error?.message;

    if (Array.isArray(message) && message.length > 0) {
      return message.join(' ');
    }

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    return fallback;
  }

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>('/api/auth/login', payload, { withCredentials: true }).pipe(
      tap((res) => {
        localStorage.setItem(this.accessTokenKey, res.accessToken);
        this.accessToken$.next(res.accessToken);
        this.currentUser$.next(res.user);
      }),
      map((): AuthActionResult => ({
        success: true,
      })),
      catchError((error) => {
        const message =
          error?.status === 401
            ? 'Invalid email or password.'
            : this.extractErrorMessage(error, 'Unable to sign in right now.');

        return of<AuthActionResult>({
          success: false,
          message,
        });
      }),
    );
  }

  register(payload: RegisterRequest) {
    return this.http.post<LoginResponse>('/api/auth/register', payload, { withCredentials: true }).pipe(
      tap((res) => {
        localStorage.setItem(this.accessTokenKey, res.accessToken);
        this.accessToken$.next(res.accessToken);
        this.currentUser$.next(res.user);
      }),
      map((): AuthActionResult => ({
        success: true,
      })),
      catchError((error) => {
        return of<AuthActionResult>({
          success: false,
          message: this.extractErrorMessage(error, 'Unable to create your account right now.'),
        });
      }),
    );
  }

  refresh() {
    return this.http.post<RefreshResponse>('/api/auth/refresh', {}, { withCredentials: true }).pipe(
      tap((res) => {
        if (res.accessToken) {
          localStorage.setItem(this.accessTokenKey, res.accessToken);
          this.accessToken$.next(res.accessToken);
        } else {
          this.clear();
        }
      }),
      map((res) => res.accessToken),
      catchError(() => {
        this.clear();
        return of(null);
      }),
    );
  }

  logout() {
    return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => this.clear()),
      catchError(() => {
        this.clear();
        return of(null);
      }),
    );
  }

  getAccessToken() {
    return localStorage.getItem(this.accessTokenKey);
  }

  clear() {
    localStorage.removeItem(this.accessTokenKey);
    this.accessToken$.next(null);
    this.currentUser$.next(null);
  }

  me(): Observable<AuthUser> {
    const cachedUser = this.currentUser$.value;

    if (cachedUser) {
      return of(cachedUser);
    }

    return this.http.get<AuthUser>('/api/auth/me', {
      withCredentials: true,
    }).pipe(
      tap((user) => this.currentUser$.next(user)),
    );
  }
}
