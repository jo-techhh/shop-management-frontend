import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';
import { AuthService, Outlet } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <!-- Search Component (Global Command Style) -->
      <div class="search-container">
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          class="header-search"
          placeholder="Search products, SKUs, transactions... (Ctrl + K)"
          [value]="catalogService.searchQuery()"
          (input)="onSearchInput($event)"
        />
        <div class="shortcut-badges">
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </div>
      </div>

      <div class="header-actions">
        <!-- Active Outlet Indicator -->
        <div class="outlet-dropdown">
          <span class="store-dot"></span>
          <svg class="outlet-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m4 0v10" />
          </svg>
          <select class="outlet-select" (change)="onOutletChange($event)">
            @for (outlet of authService.availableOutlets(); track outlet.id) {
              <option [value]="outlet.id" [selected]="outlet.id === authService.currentOutlet().id">
                {{ outlet.name }} ({{ outlet.code }})
              </option>
            }
          </select>
        </div>

        <!-- Theme Switcher: ☀ Light | ◐ System | ☾ Dark -->
        <div class="theme-toggle">
          <button
            type="button"
            class="theme-btn"
            [class.active]="themeService.themeMode() === 'light'"
            (click)="themeService.setTheme('light')"
            title="Light Mode (☀)"
          >
            ☀
          </button>
          <button
            type="button"
            class="theme-btn"
            [class.active]="themeService.themeMode() === 'system'"
            (click)="themeService.setTheme('system')"
            title="System Mode (◐)"
          >
            ◐
          </button>
          <button
            type="button"
            class="theme-btn"
            [class.active]="themeService.themeMode() === 'dark'"
            (click)="themeService.setTheme('dark')"
            title="Dark Mode (☾)"
          >
            ☾
          </button>
        </div>

        <!-- User Profile (Jobi | store_admin) -->
        <div class="user-profile">
          <img [src]="authService.currentUser().avatarUrl" alt="Avatar" class="avatar" />
          <div class="user-info">
            <span class="user-name">{{ authService.currentUser().fullName }}</span>
            <span class="user-role">{{ authService.currentUser().role }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 56px;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .search-container {
      position: relative;
      width: 420px;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .header-search {
      width: 100%;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.4rem 4.5rem 0.4rem 2.25rem;
      border-radius: var(--radius-sm);
      font-size: 0.825rem;
      outline: none;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .header-search:focus {
      background-color: var(--bg-surface);
      border-color: var(--color-primary);
    }

    .shortcut-badges {
      position: absolute;
      right: 0.6rem;
      display: flex;
      gap: 0.2rem;
      pointer-events: none;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .outlet-dropdown {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
    }

    .store-dot {
      width: 6px;
      height: 6px;
      background-color: var(--color-success);
      border-radius: 50%;
    }

    .outlet-icon {
      width: 15px;
      height: 15px;
      color: var(--color-primary);
    }

    .outlet-select {
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 0.8rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }

    .theme-toggle {
      display: flex;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 2px;
      border-radius: var(--radius-sm);
      gap: 2px;
    }

    .theme-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      width: 26px;
      height: 24px;
      border-radius: var(--radius-xs);
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .theme-btn.active {
      background-color: var(--bg-surface);
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .user-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .user-role {
      font-size: 0.675rem;
      color: var(--text-muted);
      font-family: monospace;
    }
  `]
})
export class HeaderComponent {
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  public catalogService = inject(CatalogService);

  public onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.catalogService.searchQuery.set(val);
  }

  public onOutletChange(event: Event): void {
    const targetId = (event.target as HTMLSelectElement).value;
    const outlet = this.authService.availableOutlets().find(o => o.id === targetId);
    if (outlet) {
      this.authService.setOutlet(outlet);
    }
  }
}
