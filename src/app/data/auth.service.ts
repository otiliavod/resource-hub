import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, RefreshResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessTokenKey = 'rh_access_token';
  accessToken$ = new BehaviorSubject<string | null>(this.getAccessToken());

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>('/api/auth/login', payload, { withCredentials: true }).pipe(
      tap((res) => {
        localStorage.setItem(this.accessTokenKey, res.accessToken);
        this.accessToken$.next(res.accessToken);
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  register(payload: RegisterRequest) {
    return this.http.post<LoginResponse>('/api/auth/register', payload, { withCredentials: true }).pipe(
      tap((res) => {
        localStorage.setItem(this.accessTokenKey, res.accessToken);
        this.accessToken$.next(res.accessToken);
      }),
      map(() => true),
      catchError(() => of(false)),
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
  }

  me() {
    return this.http.get<{ id: string; fullName: string; email: string; role: string }>('/api/auth/me', {
      withCredentials: true,
    });
  }
}
