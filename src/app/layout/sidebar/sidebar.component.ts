import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sakai-sidebar">
      <!-- Brand Logo — sits flush with the header -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg class="brand-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="var(--color-primary)"/>
            <path d="M8 10h4v4H8zm6 0h4v4h-4zm6 0h4v4h-4zM8 16h4v4H8zm6 0h4v4h-4zm6 0h4v4h-4zM11 22h10v2H11z" fill="white" opacity="0.95"/>
          </svg>
          <div class="brand-wordmark">
            <span class="brand-name-main">Retail</span><span class="brand-name-accent">Ops</span>
          </div>
        </div>
        <span class="brand-version">v2</span>
      </div>

      <div class="sidebar-nav">
        <!-- HOME SECTION -->
        <div class="nav-section-title">HOME</div>
        <a routerLink="/overview" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </a>

        <!-- SALES & POS SECTION -->
        <div class="nav-section-title">OPERATIONS</div>
        <a routerLink="/pos" routerLinkActive="active" class="nav-item pos-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>POS Terminal</span>
          <span class="badge badge-primary font-mono">FAST</span>
        </a>

        <a routerLink="/orders" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Sales Orders</span>
        </a>

        <!-- MERCHANDISE MANAGEMENT -->
        <div class="nav-section-title">MERCHANDISE</div>
        <a routerLink="/products" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Product Catalog</span>
        </a>

        <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span>Inventory Ledger</span>
          @if (inventoryService.lowStockAlertsCount() > 0) {
            <span class="badge badge-warning font-mono">{{ inventoryService.lowStockAlertsCount() }}</span>
          }
        </a>

        <a routerLink="/transfers" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Stock Transfers</span>
        </a>

        <!-- MANAGEMENT -->
        <div class="nav-section-title">MANAGEMENT</div>
        <a routerLink="/outlets" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          <span>Retail Outlets</span>
        </a>

        <a routerLink="/customers" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Customers</span>
        </a>

        <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Reports & Analytics</span>
        </a>

        <!-- SYSTEM -->
        <div class="nav-section-title">SYSTEM</div>
        <a routerLink="/events" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Saga Event Stream</span>
        </a>

        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sakai-sidebar {
      width: 220px;
      height: 100vh;
      background-color: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 50;
      overflow: hidden;
    }

    /* Brand Header — same height as topbar */
    .sidebar-brand {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.55rem;
    }

    .brand-icon {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      flex-shrink: 0;
    }

    .brand-wordmark {
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
    }

    .brand-name-main {
      color: var(--text-main);
    }

    .brand-name-accent {
      color: var(--color-primary);
    }

    .brand-version {
      font-size: 0.6rem;
      font-weight: 700;
      background: var(--color-primary-subtle);
      color: var(--color-primary);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      letter-spacing: 0.03em;
    }

    .sidebar-nav {
      padding: 0.75rem 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.625rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      margin: 0.85rem 0.5rem 0.2rem 0.5rem;
    }

    .nav-section-title:first-child {
      margin-top: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.75rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.8375rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all 0.15s ease;
    }

    .nav-item:hover {
      color: var(--text-main);
      background-color: var(--bg-secondary);
    }

    .nav-item.active {
      color: var(--color-primary);
      background-color: var(--color-primary-subtle);
      font-weight: 700;
    }

    .nav-item.active .nav-icon {
      color: var(--color-primary);
    }

    .nav-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: var(--text-muted);
      transition: color 0.15s ease;
    }

    .nav-item.active .nav-icon {
      color: var(--color-primary);
    }

    .nav-item .badge {
      margin-left: auto;
    }
  `]
})
export class SidebarComponent {
  public inventoryService = inject(InventoryService);
}
