import { LucideCalculator, LucideCheck, LucideChevronDown, LucideLogOut, LucideMoon, LucideSettings, LucideSun } from '@lucide/angular';
import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService, Outlet } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideCalculator, LucideCheck, LucideChevronDown, LucideLogOut, LucideMoon, LucideSettings, LucideSun],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  private router = inject(Router);

  public isOutletMenuOpen = signal<boolean>(false);
  public isProfileMenuOpen = signal<boolean>(false);


  public toggleOutletMenu(event: Event): void {
    event.stopPropagation();
    this.isOutletMenuOpen.update(open => !open);
    if (this.isOutletMenuOpen()) {
      this.isProfileMenuOpen.set(false);
    }
  }

  public toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen.update(open => !open);
    if (this.isProfileMenuOpen()) {
      this.isOutletMenuOpen.set(false);
    }
  }

  public onSelectOutlet(outlet: Outlet, event: Event): void {
    event.stopPropagation();
    this.authService.setOutlet(outlet);
    this.isOutletMenuOpen.set(false);
  }

  @HostListener('document:click')
  public closeMenuOnOutsideClick(): void {
    this.isOutletMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
  }

  public goTo(path: string): void {
    this.isProfileMenuOpen.set(false);
    this.router.navigate([path]);
  }

  public logout(): void {
    this.isProfileMenuOpen.set(false);
    this.authService.logout();
  }

  public toggleTheme(): void {
    const current = this.themeService.activeTheme();
    this.themeService.setTheme(current === 'light' ? 'dark' : 'light');
  }
}
