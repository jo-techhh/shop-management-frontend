import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Cannot reach the server. Check your connection and that the backend is running.';
    const body = error.error;
    const detail = body?.detail ?? body?.message ?? body?.error;
    if (Array.isArray(detail)) return detail.map((d: { loc?: string[]; msg?: string }) => [d.loc?.filter(p => p !== 'body').join('.'), d.msg].filter(Boolean).join(': ')).join('; ');
    if (typeof detail === 'string') return detail;
    return error.message || `Request failed (HTTP ${error.status}).`;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  public readonly isConnected = signal<boolean | null>(null);
  public readonly revision = signal(0);

  private request<T>(method: string, endpoint: string, body?: unknown): Observable<T> {
    return this.http.request<T | { data: T }>(method, `${this.baseUrl}${endpoint}`, { body }).pipe(
      map(response => response && typeof response === 'object' && 'data' in response ? response.data : response as T),
      tap(() => { this.isConnected.set(true); if (method !== 'GET') this.revision.update(value => value + 1); }),
      catchError(error => { this.isConnected.set(false); return throwError(() => error); })
    );
  }
  get<T>(endpoint: string): Observable<T> { return this.request<T>('GET', endpoint); }
  post<T>(endpoint: string, body: unknown): Observable<T> { return this.request<T>('POST', endpoint, body); }
  postIdempotent<T>(endpoint: string, body: unknown, key: string): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { headers: { 'Idempotency-Key': key } });
  }
  put<T>(endpoint: string, body: unknown): Observable<T> { return this.request<T>('PUT', endpoint, body); }
  patch<T>(endpoint: string, body: unknown): Observable<T> { return this.request<T>('PATCH', endpoint, body); }
  delete<T>(endpoint: string): Observable<T> { return this.request<T>('DELETE', endpoint); }
}
