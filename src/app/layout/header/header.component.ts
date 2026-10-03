import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService, Outlet } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="sakai-topbar">
      <!-- Search Input — fills available horizontal space from left -->
      <div class="topbar-search">
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Search products, SKUs, barcodes, transactions..."
          [value]="catalogService.searchQuery()"
          (input)="onSearchInput($event)"
        />
        <div class="shortcut-tag">
          <kbd>⌘K</kbd>
        </div>
      </div>

      <!-- Right Controls: Custom Store Selector, Notifications, Theme, Profile -->
      <div class="topbar-right">
        <!-- Sakai Custom Styled Outlet Dropdown -->
        <div class="outlet-dropdown-wrapper">
          <button
            type="button"
            class="outlet-trigger-btn"
            [class.is-open]="isOutletMenuOpen()"
            (click)="toggleOutletMenu($event)"
            title="Switch Outlet"
          >
            <span class="status-indicator-dot"></span>
            <svg class="outlet-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m4 0v10" />
            </svg>
            <span class="outlet-label">
              <span class="outlet-title">{{ authService.currentOutlet().name }}</span>
              <span class="outlet-code-badge">{{ authService.currentOutlet().code }}</span>
            </span>
            <svg class="chevron-arrow" [class.rotated]="isOutletMenuOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Custom Animated Overlay Menu -->
          @if (isOutletMenuOpen()) {
            <div class="outlet-menu-panel" (click)="$event.stopPropagation()">
              <div class="menu-panel-header">
                <span class="panel-heading">Retail Outlets</span>
                <span class="panel-count-badge">{{ authService.availableOutlets().length }} active</span>
              </div>
              <div class="menu-outlet-list">
                @for (outlet of authService.availableOutlets(); track outlet.id) {
                  <button
                    type="button"
                    class="outlet-menu-item"
                    [class.selected]="outlet.id === authService.currentOutlet().id"
                    (click)="onSelectOutlet(outlet, $event)"
                  >
                    <div class="item-left">
                      <span class="item-status-dot" [class.dot-selected]="outlet.id === authService.currentOutlet().id"></span>
                      <div class="item-text-group">
                        <div class="item-name-row">
                          <span class="item-store-name">{{ outlet.name }}</span>
                          <span class="item-store-code">{{ outlet.code }}</span>
                        </div>
                        <span class="item-store-city">{{ outlet.city }} • {{ outlet.status | titlecase }}</span>
                      </div>
                    </div>
                    @if (outlet.id === authService.currentOutlet().id) {
                      <svg class="item-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <div class="topbar-divider"></div>

        <!-- Notifications Icon -->
        <button type="button" class="icon-button" title="Notifications">
          <svg class="topbar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="notification-badge">3</span>
        </button>

        <!-- Theme Toggle -->
        <button
          type="button"
          class="icon-button"
          (click)="toggleTheme()"
          [title]="themeService.activeTheme() === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
        >
          @if (themeService.activeTheme() === 'light') {
            <svg class="topbar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          } @else {
            <svg class="topbar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        </button>

        <div class="topbar-divider"></div>

        <!-- User Profile Dropdown Container -->
        <div class="user-profile-wrapper">
          <div
            class="user-profile"
            [class.is-open]="isProfileMenuOpen()"
            (click)="toggleProfileMenu($event)"
            title="Account Options"
          >
            <div class="avatar-ring">
              <img
                [src]="authService.currentUser()?.avatarUrl"
                alt="Avatar"
                class="profile-avatar"
                onerror="this.style.display='none'"
              />
              <span class="avatar-fallback">{{ authService.currentUser()?.fullName?.charAt(0) || 'U' }}</span>
            </div>
            <div class="profile-details">
              <span class="profile-name">{{ authService.currentUser()?.fullName || 'User' }}</span>
              <span class="profile-role">{{ authService.currentUser()?.role | titlecase }}</span>
            </div>
            <svg class="chevron-arrow" [class.rotated]="isProfileMenuOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

          <!-- Animated Profile Dropdown Menu -->
          @if (isProfileMenuOpen()) {
            <div class="profile-menu-panel" (click)="$event.stopPropagation()">
              <div class="profile-menu-header">
                <div class="menu-avatar-large">
                  <span>{{ authService.currentUser()?.fullName?.charAt(0) || 'U' }}</span>
                </div>
                <div class="menu-user-meta">
                  <span class="menu-user-name">{{ authService.currentUser()?.fullName || 'User' }}</span>
                  <span class="menu-user-email">{{ authService.currentUser()?.email }}</span>
                  <span class="menu-role-tag">{{ authService.currentUser()?.role | uppercase }}</span>
                </div>
              </div>

              <div class="profile-menu-outlet-info">
                <span class="outlet-info-label">Active Outlet</span>
                <span class="outlet-info-val">{{ authService.currentOutlet().name }} ({{ authService.currentOutlet().code }})</span>
              </div>

              <div class="menu-divider"></div>

              <div class="menu-actions-list">
                <button type="button" class="menu-action-item" (click)="goTo('/pos')">
                  <svg class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>POS Terminal</span>
                </button>

                <button type="button" class="menu-action-item" (click)="goTo('/settings')">
                  <svg class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Store Settings</span>
                </button>
              </div>

              <div class="menu-divider"></div>

              <div class="menu-footer">
                <button type="button" class="menu-logout-btn" (click)="logout()">
                  <svg class="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .sakai-topbar {
      height: 60px;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0 1.25rem;
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: var(--shadow-xs);
    }

    /* Search fills all remaining space from left edge */
    .topbar-search {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      min-width: 0;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      width: 15px;
      height: 15px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.5rem 3.5rem 0.5rem 2.3rem;
      border-radius: 8px;
      font-size: 0.825rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      font-family: inherit;
    }

    .search-input::placeholder {
      color: var(--text-dim);
    }

    .search-input:focus {
      background-color: var(--bg-surface);
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-subtle);
    }

    .shortcut-tag {
      position: absolute;
      right: 0.75rem;
      pointer-events: none;
    }

    .shortcut-tag kbd {
      font-size: 0.65rem;
      color: var(--text-dim);
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 0.1rem 0.4rem;
      font-family: inherit;
    }

    /* Right section */
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }

    .topbar-divider {
      width: 1px;
      height: 20px;
      background: var(--border-color);
      margin: 0 0.25rem;
    }

    /* ==========================================================================
       Sakai Custom Styled Outlet Dropdown
       ========================================================================== */
    .outlet-dropdown-wrapper {
      position: relative;
    }

    .outlet-trigger-btn {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.65rem 0.35rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-main);
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .outlet-trigger-btn:hover {
      background-color: var(--bg-surface);
      border-color: var(--color-primary);
    }

    .outlet-trigger-btn.is-open {
      background-color: var(--bg-surface);
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-subtle);
    }

    .status-indicator-dot {
      width: 7px;
      height: 7px;
      background-color: var(--color-success);
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px var(--color-success-subtle);
    }

    .outlet-icon {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .outlet-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .outlet-title {
      color: var(--text-main);
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .outlet-code-badge {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-dim);
      background-color: var(--bg-tertiary);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }

    .chevron-arrow {
      width: 13px;
      height: 13px;
      color: var(--text-muted);
      flex-shrink: 0;
      transition: transform 0.2s ease, color 0.2s ease;
    }

    .chevron-arrow.rotated {
      transform: rotate(180deg);
      color: var(--color-primary);
    }

    /* Custom Dropdown Overlay Menu */
    .outlet-menu-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 270px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      overflow: hidden;
      animation: menuFadeIn 0.15s ease-out;
    }

    @keyframes menuFadeIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .menu-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 0.85rem;
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }

    .panel-heading {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .panel-count-badge {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--color-success);
      background-color: var(--color-success-subtle);
      padding: 0.1rem 0.4rem;
      border-radius: 9999px;
    }

    .menu-outlet-list {
      padding: 0.35rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      max-height: 280px;
      overflow-y: auto;
    }

    .outlet-menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.55rem 0.65rem;
      border: none;
      background: transparent;
      border-radius: 7px;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: background-color 0.15s ease;
    }

    .outlet-menu-item:hover {
      background-color: var(--bg-secondary);
    }

    .outlet-menu-item.selected {
      background-color: var(--color-primary-subtle);
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .item-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--text-dim);
      flex-shrink: 0;
    }

    .item-status-dot.dot-selected {
      background-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-subtle);
    }

    .item-text-group {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .item-name-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .item-store-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .outlet-menu-item.selected .item-store-name {
      color: var(--color-primary);
      font-weight: 700;
    }

    .item-store-code {
      font-size: 0.65rem;
      font-family: monospace;
      color: var(--text-muted);
      background-color: var(--bg-secondary);
      padding: 0.05rem 0.3rem;
      border-radius: 3px;
    }

    .item-store-city {
      font-size: 0.68rem;
      color: var(--text-muted);
    }

    .item-check-icon {
      width: 15px;
      height: 15px;
      color: var(--color-primary);
      flex-shrink: 0;
    }

    /* Icon Buttons */
    .icon-button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .icon-button:hover {
      background-color: var(--bg-secondary);
      color: var(--text-main);
    }

    .topbar-icon {
      width: 17px;
      height: 17px;
    }

    .notification-badge {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 15px;
      height: 15px;
      background-color: var(--color-danger);
      color: white;
      border-radius: 50%;
      font-size: 0.55rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-surface);
    }

    /* User Profile */
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.2rem 0.45rem 0.2rem 0.3rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .user-profile:hover {
      background-color: var(--bg-secondary);
    }

    .avatar-ring {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid var(--color-primary);
      background: var(--color-primary-subtle);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    .profile-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .avatar-fallback {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--color-primary);
      position: absolute;
    }

    .profile-details {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .profile-name {
      font-size: 0.775rem;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
    }

    .profile-role {
      font-size: 0.65rem;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .user-profile-wrapper {
      position: relative;
    }

    .user-profile.is-open {
      background-color: var(--bg-secondary);
      box-shadow: 0 0 0 2px var(--color-primary-subtle);
    }

    .profile-menu-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 270px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      overflow: hidden;
      animation: menuFadeIn 0.15s ease-out;
    }

    .profile-menu-header {
      padding: 0.9rem 1rem 0.8rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }

    .menu-avatar-large {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-primary);
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: 800;
      font-size: 1.05rem;
    }

    .menu-user-meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .menu-user-name {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-user-email {
      font-size: 0.7rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-role-tag {
      align-self: flex-start;
      margin-top: 0.2rem;
      font-size: 0.6rem;
      font-weight: 800;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background-color: var(--color-primary-subtle);
      color: var(--color-primary);
      letter-spacing: 0.05em;
    }

    .profile-menu-outlet-info {
      padding: 0.55rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      background-color: var(--bg-surface);
      font-size: 0.7rem;
    }

    .outlet-info-label {
      color: var(--text-dim);
      font-size: 0.625rem;
      text-transform: uppercase;
      font-weight: 700;
    }

    .outlet-info-val {
      color: var(--text-main);
      font-weight: 600;
    }

    .menu-divider {
      height: 1px;
      background-color: var(--border-color);
      margin: 0.15rem 0;
    }

    .menu-actions-list {
      padding: 0.3rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .menu-action-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.7rem;
      width: 100%;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
      font-family: inherit;
      transition: background-color 0.12s ease;
      text-align: left;
    }

    .menu-action-item:hover {
      background-color: var(--bg-secondary);
    }

    .action-icon {
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }

    .menu-footer {
      padding: 0.35rem;
    }

    .menu-logout-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      width: 100%;
      padding: 0.55rem 0.7rem;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-danger);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    .menu-logout-btn:hover {
      background-color: var(--color-danger-subtle);
    }

    .logout-icon {
      width: 16px;
      height: 16px;
      color: var(--color-danger);
    }
  `]
})
export class HeaderComponent {
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  public catalogService = inject(CatalogService);
  private router = inject(Router);

  public isOutletMenuOpen = signal<boolean>(false);
  public isProfileMenuOpen = signal<boolean>(false);

  public onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.catalogService.searchQuery.set(val);
  }

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
