import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page bg-grid-subtle">
      <!-- Dashboard Header -->
      <div class="welcome-banner">
        <div>
          <h1 class="page-title">Good morning, {{ authService.currentUser().fullName }}</h1>
          <p class="page-subtitle">Here's what's happening across your outlets today.</p>
        </div>
        <div class="banner-actions">
          <a routerLink="/pos" class="btn-primary">
            <span>+ Open POS Register</span>
          </a>
        </div>
      </div>

      <!-- 4 Primary KPI Cards -->
      <div class="metrics-grid">
        <div class="grid-card metric-card">
          <div class="metric-header">
            <span class="metric-label">Sales Revenue</span>
            <span class="badge badge-success">+14.2%</span>
          </div>
          <div class="metric-value">₹82.4K</div>
          <div class="metric-footer">vs ₹72.1K yesterday</div>
        </div>

        <div class="grid-card metric-card">
          <div class="metric-header">
            <span class="metric-label">Completed Orders</span>
            <span class="badge badge-primary">+8.4%</span>
          </div>
          <div class="metric-value">284</div>
          <div class="metric-footer">24 orders processing</div>
        </div>

        <div class="grid-card metric-card">
          <div class="metric-header">
            <span class="metric-label">Active Stock Ledger</span>
            <span class="badge badge-neutral">4 Outlets</span>
          </div>
          <div class="metric-value">12,842</div>
          <div class="metric-footer">{{ inventoryService.lowStockAlertsCount() }} item low stock</div>
        </div>

        <div class="grid-card metric-card">
          <div class="metric-header">
            <span class="metric-label">Active Cash Register</span>
            <span class="badge badge-success">Online</span>
          </div>
          <div class="metric-value">Terminal 01</div>
          <div class="metric-footer">Float ₹5,000 | Cash ₹18,450</div>
        </div>
      </div>

      <!-- Middle Content: Sales Chart + Technical Recent Events -->
      <div class="content-grid">
        <!-- Sales Overview Chart -->
        <div class="grid-card chart-card">
          <div class="card-title-bar">
            <div>
              <h2 class="card-title">Sales Overview</h2>
              <p class="card-sub">Real-time revenue stream across active retail terminals</p>
            </div>
            <div class="time-tabs">
              <button class="time-tab active">Today</button>
              <button class="time-tab">Week</button>
              <button class="time-tab">Month</button>
            </div>
          </div>

          <div class="chart-container bg-grid-dots">
            <svg viewBox="0 0 600 200" class="chart-svg">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.20"/>
                  <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <!-- Grid Lines -->
              <line x1="0" y1="40" x2="600" y2="40" stroke="var(--border-subtle)" stroke-dasharray="3 3" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border-subtle)" stroke-dasharray="3 3" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="var(--border-subtle)" stroke-dasharray="3 3" />

              <!-- Path Area -->
              <path d="M 0,150 Q 100,120 180,135 T 320,55 T 460,85 T 600,25 L 600,195 L 0,195 Z" fill="url(#chartGradient)" />
              <!-- Path Line -->
              <path d="M 0,150 Q 100,120 180,135 T 320,55 T 460,85 T 600,25" fill="none" stroke="var(--color-primary)" stroke-width="2" />

              <!-- Data Points -->
              <circle cx="180" cy="135" r="3.5" fill="var(--bg-surface)" stroke="var(--color-primary)" stroke-width="2" />
              <circle cx="320" cy="55" r="3.5" fill="var(--bg-surface)" stroke="var(--color-primary)" stroke-width="2" />
              <circle cx="600" cy="25" r="3.5" fill="var(--bg-surface)" stroke="var(--color-primary)" stroke-width="2" />
            </svg>
            <div class="chart-labels">
              <span>08:00 AM</span>
              <span>10:00 AM</span>
              <span>12:00 PM</span>
              <span>02:00 PM</span>
              <span>04:00 PM</span>
              <span>NOW</span>
            </div>
          </div>
        </div>

        <!-- Technical Recent Events Widget -->
        <div class="grid-card events-card">
          <div class="card-title-bar">
            <div>
              <h2 class="card-title">Recent Events</h2>
              <p class="card-sub">Event-driven stream activity</p>
            </div>
            <a routerLink="/events" class="link-more">View All →</a>
          </div>

          <div class="events-list">
            <!-- Event 1: Success -->
            <div class="event-item">
              <span class="event-dot success"></span>
              <div class="event-body">
                <div class="event-head">
                  <span class="event-title">Order ORD-2026-849201</span>
                  <span class="event-meta">6:00 PM · <code class="srv-tag">billing-service</code></span>
                </div>
                <div class="event-desc">Checkout saga completed successfully</div>
              </div>
            </div>

            <!-- Event 2: Information / Blue -->
            <div class="event-item">
              <span class="event-dot info"></span>
              <div class="event-body">
                <div class="event-head">
                  <span class="event-title">Stock reservation</span>
                  <span class="event-meta">5:58 PM · <code class="srv-tag">inventory-service</code></span>
                </div>
                <div class="event-desc">SKU KB-SW-BRN · 1 unit reserved</div>
              </div>
            </div>

            <!-- Event 3: Information / Blue -->
            <div class="event-item">
              <span class="event-dot info"></span>
              <div class="event-body">
                <div class="event-head">
                  <span class="event-title">Stock transfer</span>
                  <span class="event-meta">3:45 PM · <code class="srv-tag">inventory-service</code></span>
                </div>
                <div class="event-desc">Main Flagship → Koramangala (35 pcs)</div>
              </div>
            </div>

            <!-- Event 4: Warning / Amber -->
            <div class="event-item">
              <span class="event-dot warning"></span>
              <div class="event-body">
                <div class="event-head">
                  <span class="event-title">Low-stock alert</span>
                  <span class="event-meta">1:10 PM · <code class="srv-tag">inventory-service</code></span>
                </div>
                <div class="event-desc">SKU TEE-WHT-M · 5 remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-height: calc(100vh - 56px);
    }

    .welcome-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-top: 0.15rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .metric-card {
      padding: 1rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .metric-footer {
      font-size: 0.725rem;
      color: var(--text-muted);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .chart-card, .events-card {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
    }

    .card-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .card-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .card-sub {
      font-size: 0.725rem;
      color: var(--text-muted);
    }

    .time-tabs {
      display: flex;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 2px;
    }

    .time-tab {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.725rem;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-xs);
      cursor: pointer;
    }

    .time-tab.active {
      background: var(--bg-surface);
      color: var(--text-main);
      font-weight: 600;
      box-shadow: var(--shadow-sm);
    }

    .chart-container {
      width: 100%;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.5rem;
    }

    .chart-svg {
      width: 100%;
      height: 175px;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.675rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      padding: 0 0.25rem;
    }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .event-item {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
    }

    .event-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      margin-top: 0.35rem;
      flex-shrink: 0;
    }

    .event-dot.success { background-color: var(--color-success); }
    .event-dot.info { background-color: var(--color-info); }
    .event-dot.warning { background-color: var(--color-warning); }
    .event-dot.failure { background-color: var(--color-danger); }

    .event-body {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      flex: 1;
    }

    .event-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }

    .event-title {
      font-weight: 600;
      color: var(--text-main);
    }

    .event-meta {
      font-size: 0.675rem;
      color: var(--text-muted);
    }

    .srv-tag {
      font-family: monospace;
      background-color: var(--bg-secondary);
      padding: 0.05rem 0.3rem;
      border-radius: 3px;
    }

    .event-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .link-more {
      font-size: 0.75rem;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 500;
    }
  `]
})
export class DashboardComponent {
  public authService = inject(AuthService);
  public eventService = inject(EventService);
  public inventoryService = inject(InventoryService);
}
