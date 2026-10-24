import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { defer, firstValueFrom, from, switchMap, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { errorMessage } from './api.service';

export interface Outlet {
  id: string; name: string; code: string; address: string | null; phone: string | null;
  tax_number: string | null; receipt_footer: string | null; is_active: boolean;
}
export interface User {
  id: string; email: string; fullName: string; role: string; outletId: string | null;
  permissions: string[]; isSuperuser: boolean;
}
interface UserDto {
  id: string; email: string; full_name: string; outlet_id: string | null;
  is_superuser: boolean; permissions: string[]; roles: { name: string }[]; outlet: Outlet | null;
}
export interface TokenResponse { access_token: string; refresh_token: string; }
export interface LoginCredentials { email: string; password: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private sessionPromise: Promise<boolean> | null = null;
  private readonly selectedOutletId = signal<string | null>(this.browser ? localStorage.getItem('selected_outlet_id') : null);
  public readonly currentUser = signal<User | null>(null);
  public readonly availableOutlets = signal<Outlet[]>([]);
  public readonly outletError = signal('');
  public readonly sessionError = signal('');
  public readonly outletsLoading = signal(false);
  public readonly currentOutlet = computed(() => this.availableOutlets().find(o => o.id === this.selectedOutletId()) ?? null);
  public readonly isAuthenticated = computed(() => this.currentUser() !== null);

  getAccessToken(): string | null { return this.browser ? localStorage.getItem('access_token') : null; }
  getRefreshToken(): string | null { return this.browser ? localStorage.getItem('refresh_token') : null; }
  setTokens(access: string, refresh?: string): void {
    if (!this.browser) return;
    localStorage.setItem('access_token', access);
    localStorage.removeItem('token');
    if (refresh) localStorage.setItem('refresh_token', refresh);
  }
  clearTokens(): void {
    if (this.browser) for (const key of ['token', 'access_token', 'refresh_token', 'selected_outlet_id']) localStorage.removeItem(key);
    this.currentUser.set(null); this.availableOutlets.set([]); this.selectedOutletId.set(null); this.sessionPromise = null;
  }
  hasPermission(permission: string): boolean {
    const user = this.currentUser(); return !!user && (user.isSuperuser || user.permissions.includes(permission));
  }
  async ensureSession(force = false): Promise<boolean> {
    if (!this.browser || !this.getAccessToken()) return false;
    if (force) this.sessionPromise = null;
    this.sessionPromise ??= this.restoreSession();
    return this.sessionPromise;
  }
  private async restoreSession(): Promise<boolean> {
    try {
      const dto = await firstValueFrom(this.http.get<UserDto>(`${this.baseUrl}/auth/me`));
      this.currentUser.set({ id: dto.id, email: dto.email, fullName: dto.full_name,
        role: dto.roles.map(r => r.name).join(', '), outletId: dto.outlet_id,
        permissions: dto.permissions, isSuperuser: dto.is_superuser });
      await this.loadOutlets(dto.outlet);
      return true;
    } catch (error) {
      this.sessionError.set(errorMessage(error));
      this.clearTokens();
      throw error;
    }
  }
  async loadOutlets(assigned?: Outlet | null): Promise<void> {
    this.outletsLoading.set(true); this.outletError.set('');
    try {
      const outlets = this.hasPermission('outlet:read')
        ? await firstValueFrom(this.http.get<Outlet[]>(`${this.baseUrl}/outlets`))
        : assigned ? [assigned] : this.availableOutlets().filter(o => o.id === this.currentUser()?.outletId);
      this.availableOutlets.set(outlets);
      const selectable = this.currentUser()?.isSuperuser ? outlets : outlets.filter(o => o.id === this.currentUser()?.outletId);
      const selected = selectable.find(o => o.id === this.selectedOutletId()) ?? selectable.find(o => o.id === this.currentUser()?.outletId) ?? selectable[0];
      if (selected) this.setOutlet(selected); else this.selectedOutletId.set(null);
    } catch (error) {
      this.availableOutlets.set([]); this.selectedOutletId.set(null); this.outletError.set(errorMessage(error));
    } finally { this.outletsLoading.set(false); }
  }
  setOutlet(outlet: Outlet): void {
    if (!this.availableOutlets().some(o => o.id === outlet.id)) return;
    if (!this.currentUser()?.isSuperuser && outlet.id !== this.currentUser()?.outletId) return;
    this.selectedOutletId.set(outlet.id);
    if (this.browser) localStorage.setItem('selected_outlet_id', outlet.id);
  }
  login(credentials: LoginCredentials) {
    this.sessionError.set('');
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(tokens => this.setTokens(tokens.access_token, tokens.refresh_token)),
      switchMap(() => from(this.ensureSession(true)))
    );
  }
  refreshToken() {
    return defer(() => {
      const refresh_token = this.getRefreshToken();
      if (!refresh_token) throw new Error('Your session has expired. Please sign in again.');
      return this.http.post<TokenResponse>(`${this.baseUrl}/auth/refresh`, { refresh_token },
        { headers: { 'X-Skip-Interceptor': 'true' } }).pipe(tap(tokens => this.setTokens(tokens.access_token, tokens.refresh_token)));
    });
  }
  logout(): void { this.clearTokens(); this.redirectToLogin(); }
  redirectToLogin(): void { if (this.browser) void this.router.navigate(['/login']); }
}
