import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    const isAuthCall = req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/register');

    const authReq = token && !isAuthCall ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((err: unknown) => {
        if (!(err instanceof HttpErrorResponse)) return throwError(() => err);
        if (err.status !== 401 || isAuthCall || this.isRefreshing) return throwError(() => err);

        this.isRefreshing = true;
        return this.auth.refresh().pipe(
          switchMap((newToken) => {
            this.isRefreshing = false;
            if (!newToken) return throwError(() => err);

            const retry = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next.handle(retry);
          }),
          catchError((e) => {
            this.isRefreshing = false;
            return throwError(() => e);
          }),
        );
      }),
    );
  }
}
