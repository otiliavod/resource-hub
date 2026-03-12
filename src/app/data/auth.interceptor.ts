import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null | undefined>(undefined);

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    const isAuthCall =
      req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/refresh');

    const authReq =
      token && !isAuthCall
        ? req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
        : req;

    return next.handle(authReq).pipe(
      catchError((err: unknown) => {
        if (!(err instanceof HttpErrorResponse)) {
          return throwError(() => err);
        }

        if (err.status !== 401 || isAuthCall) {
          return throwError(() => err);
        }

        if (this.isRefreshing) {
          return this.refreshTokenSubject.pipe(
            filter((value) => value !== undefined),
            take(1),
            switchMap((newToken) => {
              if (!newToken) {
                return throwError(() => err);
              }

              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });

              return next.handle(retryReq);
            }),
          );
        }

        this.isRefreshing = true;
        this.refreshTokenSubject.next(undefined);

        return this.auth.refresh().pipe(
          switchMap((newToken) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(newToken);

            if (!newToken) {
              return throwError(() => err);
            }

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });

            return next.handle(retryReq);
          }),
          catchError((refreshError) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(null);
            this.auth.clear();
            return throwError(() => refreshError);
          }),
        );
      }),
    );
  }
}
