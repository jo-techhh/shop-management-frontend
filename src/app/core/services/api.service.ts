import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  correlation_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = 'http://localhost:8000/api/v1';

  public isConnected = signal<boolean>(true);

  private getHeaders(): HttpHeaders {
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token');
    }

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Correlation-ID': `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  public get<T>(endpoint: string, fallbackMock?: T): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(fallbackMock as T);
    }

    return this.http.get<any>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError((err: HttpErrorResponse) => {
        this.isConnected.set(false);
        if (fallbackMock !== undefined) {
          return of(fallbackMock);
        }
        throw err;
      })
    );
  }

  public post<T>(endpoint: string, body: any, fallbackMock?: T): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(fallbackMock as T);
    }

    return this.http.post<any>(`${this.baseUrl}${endpoint}`, body, { headers: this.getHeaders() }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError((err: HttpErrorResponse) => {
        this.isConnected.set(false);
        if (fallbackMock !== undefined) {
          return of(fallbackMock);
        }
        throw err;
      })
    );
  }

  public put<T>(endpoint: string, body: any, fallbackMock?: T): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(fallbackMock as T);
    }

    return this.http.put<any>(`${this.baseUrl}${endpoint}`, body, { headers: this.getHeaders() }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError((err: HttpErrorResponse) => {
        this.isConnected.set(false);
        if (fallbackMock !== undefined) {
          return of(fallbackMock);
        }
        throw err;
      })
    );
  }

  public delete<T>(endpoint: string, fallbackMock?: T): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(fallbackMock as T);
    }

    return this.http.delete<any>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError((err: HttpErrorResponse) => {
        this.isConnected.set(false);
        if (fallbackMock !== undefined) {
          return of(fallbackMock);
        }
        throw err;
      })
    );
  }
}
