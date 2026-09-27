import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  
  public readonly themeMode = signal<ThemeMode>('system');
  public readonly activeTheme = signal<ActiveTheme>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('clean_grid_theme') as ThemeMode;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        this.themeMode.set(savedTheme);
      }

      this.applyTheme(this.themeMode());

      // Watch for OS theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.themeMode() === 'system') {
          this.applyTheme('system');
        }
      });
    }

    effect(() => {
      const currentMode = this.themeMode();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('clean_grid_theme', currentMode);
        this.applyTheme(currentMode);
      }
    });
  }

  public setTheme(mode: ThemeMode): void {
    this.themeMode.set(mode);
  }

  private applyTheme(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let computedTheme: ActiveTheme = 'light';
    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      computedTheme = systemDark ? 'dark' : 'light';
    } else {
      computedTheme = mode;
    }

    this.activeTheme.set(computedTheme);
    document.documentElement.setAttribute('data-theme', computedTheme);
  }
}
