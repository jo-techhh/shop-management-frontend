import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideMoon, LucideSun, LucideCircleAlert, LucideTriangleAlert, LucideMail, LucideLockKeyhole, LucideEyeOff, LucideEye, LucideArrowRight, LucideStore } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { errorMessage } from '../../core/services/api.service';

@Component({ selector: 'app-login', standalone: true,
  imports: [CommonModule, FormsModule, LucideMoon, LucideSun, LucideCircleAlert, LucideTriangleAlert, LucideMail, LucideLockKeyhole, LucideEyeOff, LucideEye, LucideArrowRight, LucideStore],
  templateUrl: './login.component.html', styleUrl: './login.component.css' })
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  email = ''; password = '';
  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal(this.authService.sessionError());
  readonly isSessionExpired = signal(!!this.route.snapshot.queryParams['returnUrl']);
  onSubmit(): void {
    if (!this.email || !this.password || this.isLoading()) return;
    this.isLoading.set(true); this.errorMessage.set('');
    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const target = this.route.snapshot.queryParams['returnUrl'];
        void this.router.navigateByUrl(typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/overview');
      },
      error: error => { this.isLoading.set(false); this.errorMessage.set(errorMessage(error)); }
    });
  }
}
