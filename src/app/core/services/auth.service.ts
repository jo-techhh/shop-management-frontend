import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'store_admin' | 'cashier';
  outletId: string;
  avatarUrl?: string;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  city: string;
  status: 'active' | 'maintenance' | 'operational';
  todaySales: string;
  stockCount: number;
  openRegisters: number;
  lowStockCount: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = 'http://localhost:8000/api/v1';

  public readonly currentUser = signal<User | null>(null);

  public readonly availableOutlets = signal<Outlet[]>([
    {
      id: 'out-01',
      name: 'Main Flagship Store',
      code: 'MFS-BLR',
      city: 'Bengaluru',
      status: 'active',
      todaySales: '₹82,400',
      stockCount: 5420,
      openRegisters: 2,
      lowStockCount: 2
    },
    {
      id: 'out-02',
      name: 'Koramangala',
      code: 'KOR-BLR',
      city: 'Bengaluru',
      status: 'active',
      todaySales: '₹34,120',
      stockCount: 2890,
      openRegisters: 1,
      lowStockCount: 1
    },
    {
      id: 'out-03',
      name: 'Trivandrum',
      code: 'TRV-KER',
      city: 'Kerala',
      status: 'active',
      todaySales: '₹28,900',
      stockCount: 2150,
      openRegisters: 1,
      lowStockCount: 0
    },
    {
      id: 'out-04',
      name: 'Nagercoil',
      code: 'NC-TN',
      city: 'Tamil Nadu',
      status: 'active',
      todaySales: '₹19,450',
      stockCount: 1382,
      openRegisters: 1,
      lowStockCount: 0
    },
    {
      id: 'out-05',
      name: 'Warehouses',
      code: 'WH-HUB',
      city: 'Central Hub',
      status: 'operational',
      todaySales: '₹0 (Logistics)',
      stockCount: 18400,
      openRegisters: 0,
      lowStockCount: 3
    }
  ]);

  public readonly currentOutlet = signal<Outlet>(this.availableOutlets()[0]);

  public readonly isAuthenticated = computed(() => !!this.currentUser() || !!this.getAccessToken());

  constructor() {
    this.initUserSession();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  public getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  }

  public getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('refresh_token');
  }

  public setTokens(accessToken: string, refreshToken?: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  public clearTokens(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private initUserSession(): void {
    if (!this.isBrowser()) return;

    const token = this.getAccessToken();
    if (token) {
      this.checkCurrentUser();
    } else {
      // Set default demo user if token absent for instant preview or allow login
      this.currentUser.set({
        id: 'usr-101',
        username: 'jobi',
        email: 'jobi@retailops.io',
        fullName: 'Jobi',
        role: 'store_admin',
        outletId: 'out-01',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jobi'
      });
    }
  }

  public checkCurrentUser(): void {
    const token = this.getAccessToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<any>(`${this.baseUrl}/auth/me`, { headers }).subscribe({
      next: (res) => {
        const user = res.data !== undefined ? res.data : res;
        if (user && user.id) {
          this.currentUser.set({
            id: user.id,
            username: user.email ? user.email.split('@')[0] : 'user',
            email: user.email,
            fullName: user.full_name || 'Retail User',
            role: user.is_superuser ? 'superadmin' : 'store_admin',
            outletId: user.outlet_id || 'out-01',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name || 'User'}`
          });
        }
      },
      error: (err) => {
        // Interceptor will handle 401 refresh/redirect
      }
    });
  }

  public login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        this.setTokens(res.access_token, res.refresh_token);
        this.checkCurrentUser();
      })
    );
  }

  public refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.redirectToLogin();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<TokenResponse>(
      `${this.baseUrl}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: new HttpHeaders({ 'X-Skip-Interceptor': 'true' }) }
    ).pipe(
      tap((res) => {
        this.setTokens(res.access_token, res.refresh_token);
      }),
      catchError((err) => {
        this.clearTokens();
        this.currentUser.set(null);
        this.redirectToLogin();
        return throwError(() => err);
      })
    );
  }

  public setOutlet(outlet: Outlet): void {
    this.currentOutlet.set(outlet);
  }

  public logout(): void {
    this.clearTokens();
    this.currentUser.set(null);
    this.redirectToLogin();
  }

  public redirectToLogin(): void {
    if (this.isBrowser()) {
      this.router.navigate(['/login']);
    }
  }
}
