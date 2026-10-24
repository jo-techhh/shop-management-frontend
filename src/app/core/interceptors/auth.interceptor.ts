import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService, TokenResponse } from '../services/auth.service';

let refreshRequest: Observable<TokenResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  if (request.headers.has('X-Skip-Interceptor')) return next(request.clone({ headers: request.headers.delete('X-Skip-Interceptor') }));
  const isAuth = request.url.includes('/auth/login') || request.url.includes('/auth/refresh');
  const token = auth.getAccessToken();
  const headers: Record<string, string> = { 'X-Correlation-ID': crypto.randomUUID() };
  if (token && !isAuth) headers['Authorization'] = `Bearer ${token}`;
  const authenticated = request.clone({ setHeaders: headers });
  return next(authenticated).pipe(catchError(error => {
    if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuth) return throwError(() => error);
    if (!auth.getRefreshToken()) { auth.logout(); return throwError(() => error); }
    refreshRequest ??= auth.refreshToken().pipe(
      catchError(refreshError => { auth.logout(); return throwError(() => refreshError); }),
      finalize(() => { refreshRequest = null; }), shareReplay({ bufferSize: 1, refCount: false })
    );
    return refreshRequest.pipe(switchMap(tokens => next(authenticated.clone({ setHeaders: { Authorization: `Bearer ${tokens.access_token}` } }))));
  }));
};
