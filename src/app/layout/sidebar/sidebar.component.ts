import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-icon">◈</span>
        <span class="brand-name">RETAIL</span>
        <span class="brand-tag">OPS</span>
      </div>

      <nav class="nav-list">
        <a routerLink="/overview" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Overview</span>
        </a>

        <a routerLink="/pos" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>POS</span>
          <span class="speed-badge">FAST</span>
        </a>

        <a routerLink="/products" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Products</span>
        </a>

        <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span>Inventory</span>
          @if (inventoryService.lowStockAlertsCount() > 0) {
            <span class="alert-count">{{ inventoryService.lowStockAlertsCount() }}</span>
          }
        </a>

        <a routerLink="/transfers" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Transfers</span>
        </a>

        <a routerLink="/orders" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Orders</span>
        </a>

        <a routerLink="/customers" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Customers</span>
        </a>

        <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Reports</span>
        </a>

        <a routerLink="/outlets" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m4 0v10" />
          </svg>
          <span>Outlets</span>
        </a>

        <a routerLink="/events" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Events</span>
        </a>

        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="system-status">
          <span class="status-dot"></span>
          <span>System Healthy</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px;
      height: 100vh;
      background-color: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .brand {
      height: 56px;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      border-bottom: 1px solid var(--border-color);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .brand-icon {
      color: var(--color-primary);
      font-size: 1.15rem;
    }

    .brand-name {
      font-size: 0.95rem;
      color: var(--text-main);
      font-weight: 700;
    }

    .brand-tag {
      font-size: 0.65rem;
      color: var(--text-muted);
      background: var(--bg-secondary);
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-xs);
      border: 1px solid var(--border-color);
      font-family: monospace;
    }

    .nav-list {
      padding: 0.75rem 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.75rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.825rem;
      font-weight: 500;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
      position: relative;
    }

    .nav-item:hover {
      color: var(--text-main);
      background-color: var(--bg-secondary);
    }

    .nav-item.active {
      color: var(--color-primary);
      background-color: var(--color-primary-subtle);
      font-weight: 600;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 25%;
      bottom: 25%;
      width: 3px;
      background-color: var(--color-primary);
      border-radius: 0 3px 3px 0;
    }

    .nav-item.active .nav-icon {
      color: var(--color-primary);
    }

    .nav-icon {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
      color: var(--text-muted);
      transition: color 0.15s ease;
    }

    .speed-badge {
      margin-left: auto;
      font-size: 0.625rem;
      font-weight: 700;
      background-color: var(--color-primary);
      color: var(--text-inverse);
      padding: 0.08rem 0.3rem;
      border-radius: 3px;
    }

    .alert-count {
      margin-left: auto;
      font-size: 0.675rem;
      font-weight: 600;
      background-color: var(--color-warning-subtle);
      color: var(--color-warning);
      padding: 0.1rem 0.4rem;
      border-radius: 9999px;
      border: 1px solid var(--color-warning-subtle);
    }

    .sidebar-footer {
      padding: 0.875rem 1.25rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.725rem;
    }

    .system-status {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--text-muted);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background-color: var(--color-success);
      border-radius: 50%;
    }
  `]
})
export class SidebarComponent {
  public inventoryService = inject(InventoryService);
}
