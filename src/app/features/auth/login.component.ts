import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page bg-grid-subtle">
      <!-- Theme Switcher Top-Right -->
      <div class="theme-bar">
        <button
          type="button"
          class="theme-toggle-btn"
          (click)="themeService.setTheme(themeService.activeTheme() === 'light' ? 'dark' : 'light')"
          [title]="themeService.activeTheme() === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
        >
          @if (themeService.activeTheme() === 'light') {
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          } @else {
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        </button>
      </div>

      <div class="login-card-wrapper">
        <div class="login-card sakai-card">
          <!-- Logo & Brand Header -->
          <div class="brand-header">
            <div class="logo-wrapper">
              <svg class="brand-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="var(--color-primary)"/>
                <path d="M8 10h4v4H8zm6 0h4v4h-4zm6 0h4v4h-4zM8 16h4v4H8zm6 0h4v4h-4zm6 0h4v4h-4zM11 22h10v2H11z" fill="white" opacity="0.95"/>
              </svg>
            </div>
            <h1 class="login-title">Welcome to RetailOps</h1>
            <p class="login-subtitle">Sign in with your staff account to access your store operations dashboard</p>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="alert-box alert-danger">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Session Expired Banner -->
          @if (isSessionExpired()) {
            <div class="alert-box alert-warning">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Session expired or token refresh failed. Please sign in again.</span>
            </div>
          }

          <!-- Sign In Form -->
          <form (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <div class="input-with-icon">
                <svg class="field-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <input
                  id="email"
                  type="email"
                  class="input-field"
                  placeholder="name@retailops.io"
                  [(ngModel)]="email"
                  name="email"
                  required
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label for="password" class="form-label">Password</label>
                <a href="javascript:void(0)" class="forgot-link">Forgot?</a>
              </div>
              <div class="input-with-icon">
                <svg class="field-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="input-field"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  (click)="showPassword.set(!showPassword())"
                  title="Toggle Password Visibility"
                >
                  @if (showPassword()) {
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  } @else {
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn-primary login-submit-btn"
              [disabled]="isLoading() || !email || !password"
            >
              @if (isLoading()) {
                <span class="loading-spinner"></span>
                <span>Signing in...</span>
              } @else {
                <span>Sign In to Dashboard</span>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            </button>
          </form>

          <!-- Demo Quick Logins -->
          <div class="demo-section">
            <div class="demo-divider">
              <span>DEMO ACCOUNTS</span>
            </div>
            <div class="demo-buttons-grid">
              <button type="button" class="btn-demo" (click)="fillDemo('admin@retailops.io', 'Admin@123')">
                <span class="demo-role">Store Admin</span>
                <span class="demo-email">admin&#64;retailops.io</span>
              </button>
              <button type="button" class="btn-demo" (click)="fillDemo('jobi@retailops.io', 'Jobi@123')">
                <span class="demo-role">Cashier</span>
                <span class="demo-email">jobi&#64;retailops.io</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background-color: var(--bg-app);
      position: relative;
    }

    .theme-bar {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
    }

    .theme-toggle-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }

    .theme-toggle-btn:hover {
      background-color: var(--bg-secondary);
      border-color: var(--color-primary);
    }

    .login-card-wrapper {
      width: 100%;
      max-width: 440px;
    }

    .login-card {
      padding: 2.25rem;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
    }

    .brand-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }

    .logo-wrapper {
      display: inline-flex;
      margin-bottom: 0.75rem;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
    }

    .login-title {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-main);
      margin: 0 0 0.4rem 0;
    }

    .login-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }

    .alert-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 0.9rem;
      border-radius: 8px;
      font-size: 0.825rem;
      margin-bottom: 1.25rem;
    }

    .alert-danger {
      background-color: var(--color-danger-subtle);
      color: var(--color-danger);
      border: 1px solid var(--color-danger-subtle);
    }

    .alert-warning {
      background-color: var(--color-warning-subtle);
      color: var(--color-warning);
      border: 1px solid var(--color-warning-subtle);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .forgot-link {
      font-size: 0.75rem;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 0.85rem;
      width: 17px;
      height: 17px;
      color: var(--text-dim);
      pointer-events: none;
    }

    .input-field {
      width: 100%;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.65rem 2.5rem 0.65rem 2.4rem;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .input-field:focus {
      background-color: var(--bg-surface);
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-subtle);
    }

    .password-toggle-btn {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0.2rem;
    }

    .password-toggle-btn:hover {
      color: var(--text-main);
    }

    .login-submit-btn {
      width: 100%;
      justify-content: center;
      padding: 0.75rem;
      font-size: 0.9rem;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .demo-section {
      margin-top: 1.75rem;
    }

    .demo-divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin-bottom: 0.9rem;
    }

    .demo-divider::before,
    .demo-divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border-color);
    }

    .demo-divider span {
      padding: 0 0.6rem;
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--text-dim);
      letter-spacing: 0.08em;
    }

    .demo-buttons-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
    }

    .btn-demo {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.15rem;
      padding: 0.55rem 0.75rem;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }

    .btn-demo:hover {
      border-color: var(--color-primary);
      background-color: var(--bg-surface);
    }

    .demo-role {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .demo-email {
      font-size: 0.65rem;
      color: var(--text-muted);
    }
  `]
})
export class LoginComponent {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public email = '';
  public password = '';
  public showPassword = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public isSessionExpired = signal<boolean>(false);

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['expired'] === 'true' || params['returnUrl']) {
        this.isSessionExpired.set(true);
      }
    });
  }

  public fillDemo(email: string, pass: string): void {
    this.email = email;
    this.password = pass;
    this.errorMessage.set('');
  }

  public onSubmit(): void {
    if (!this.email || !this.password) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/overview';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        // Fallback for offline API Gateway / local testing
        if (err.status === 401) {
          this.errorMessage.set('Invalid email or password.');
        } else if (err.status === 0 || err.status === 503 || err.status === 504) {
          // If backend offline, log in demo session
          this.authService.setTokens(
            `demo-jwt-token-${Date.now()}`,
            `demo-refresh-token-${Date.now()}`
          );
          this.authService.currentUser.set({
            id: 'usr-101',
            username: this.email.split('@')[0],
            email: this.email,
            fullName: this.email.includes('admin') ? 'Store Admin' : 'Jobi (Cashier)',
            role: this.email.includes('admin') ? 'superadmin' : 'store_admin',
            outletId: 'out-01',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.email}`
          });
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/overview';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(err.error?.message || err.message || 'Login failed. Please try again.');
        }
      }
    });
  }
}
