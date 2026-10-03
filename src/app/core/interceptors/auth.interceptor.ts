import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

// Concurrency mutex and queued requests subject
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
  const authService = inject(AuthService);

  // If header requests skip (e.g. refresh call itself), bypass interceptor
  if (req.headers.has('X-Skip-Interceptor')) {
    const cleanHeaders = req.headers.delete('X-Skip-Interceptor');
    return next(req.clone({ headers: cleanHeaders }));
  }

  // Check if this is an authentication endpoint
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  // Attach access token and correlation ID if available
  const token = authService.getAccessToken();
  let authReq = req;

  let headersConfig: Record<string, string> = {};
  if (!req.headers.has('X-Correlation-ID')) {
    headersConfig['X-Correlation-ID'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
  if (token && !req.headers.has('Authorization') && !isAuthEndpoint) {
    headersConfig['Authorization'] = `Bearer ${token}`;
  }

  if (Object.keys(headersConfig).length > 0) {
    authReq = req.clone({ setHeaders: headersConfig });
  }

  return next(authReq).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // If 401 occurred on login or refresh endpoint, fail immediately and redirect to login
        if (isAuthEndpoint) {
          authService.clearTokens();
          authService.redirectToLogin();
          return throwError(() => error);
        }

        // If no refresh token exists, redirect to login
        const refreshToken = authService.getRefreshToken();
        if (!refreshToken) {
          authService.clearTokens();
          authService.redirectToLogin();
          return throwError(() => error);
        }

        // Handle token refresh with concurrency locking
        return handle401Error(authReq, next, authService);
      }

      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenResponse) => {
        isRefreshing = false;
        const newAccessToken = tokenResponse.access_token;
        refreshTokenSubject.next(newAccessToken);

        // Retry original request with newly issued access token
        return next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          })
        );
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // If refresh fails, clear tokens and redirect to login
        authService.clearTokens();
        authService.redirectToLogin();
        return throwError(() => refreshError);
      })
    );
  } else {
    // If refresh is already in flight, queue waiting requests until new token is emitted
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((newAccessToken) => {
        return next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          })
        );
      })
    );
  }
}
