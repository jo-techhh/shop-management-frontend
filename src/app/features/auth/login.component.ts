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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
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
