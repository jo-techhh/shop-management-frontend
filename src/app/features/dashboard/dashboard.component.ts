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
    <div class="sakai-dashboard bg-grid-subtle">
      <!-- Welcome Header Bar -->
      <div class="dashboard-banner">
        <div>
          <h1 class="banner-title">Welcome back, {{ authService.currentUser()?.fullName || 'Staff' }}!</h1>
          <p class="banner-sub">Here is your daily retail operations overview and real-time outlet performance.</p>
        </div>
        <div class="banner-actions">
          <a routerLink="/pos" class="btn-primary">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Open POS Register</span>
          </a>
        </div>
      </div>

      <!-- Sakai Signature 4 KPI Stat Cards -->
      <div class="sakai-stats-grid">
        <!-- Card 1: Orders -->
        <div class="sakai-card stat-card">
          <div class="stat-main">
            <div>
              <span class="stat-label">Orders</span>
              <div class="stat-value font-mono">152</div>
            </div>
            <div class="stat-icon-wrapper icon-blue">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-trend badge-success">+24 new</span>
            <span class="stat-desc">since last visit</span>
          </div>
        </div>

        <!-- Card 2: Revenue -->
        <div class="sakai-card stat-card">
          <div class="stat-main">
            <div>
              <span class="stat-label">Revenue</span>
              <div class="stat-value font-mono">₹82,400</div>
            </div>
            <div class="stat-icon-wrapper icon-green">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-trend badge-success">%52+</span>
            <span class="stat-desc">since last week</span>
          </div>
        </div>

        <!-- Card 3: Customers -->
        <div class="sakai-card stat-card">
          <div class="stat-main">
            <div>
              <span class="stat-label">Customers</span>
              <div class="stat-value font-mono">28,441</div>
            </div>
            <div class="stat-icon-wrapper icon-purple">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-trend badge-success">520</span>
            <span class="stat-desc">newly registered</span>
          </div>
        </div>

        <!-- Card 4: Inventory Items -->
        <div class="sakai-card stat-card">
          <div class="stat-main">
            <div>
              <span class="stat-label">Inventory Items</span>
              <div class="stat-value font-mono">12,842</div>
            </div>
            <div class="stat-icon-wrapper icon-orange">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-trend badge-warning">{{ inventoryService.lowStockAlertsCount() }} low</span>
            <span class="stat-desc">across 5 outlets</span>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid: Revenue Stream + Event Activity -->
      <div class="sakai-content-grid">
        <!-- Sales Overview SVG Chart Card -->
        <div class="sakai-card chart-card">
          <div class="card-header-bar">
            <div>
              <h2 class="card-heading">Sales Overview</h2>
              <p class="card-subheading">Real-time revenue stream across active retail terminals</p>
            </div>
            <div class="time-pill-group">
              <button class="time-pill active">Today</button>
              <button class="time-pill">Week</button>
              <button class="time-pill">Month</button>
            </div>
          </div>

          <div class="chart-wrapper bg-grid-dots">
            <svg viewBox="0 0 600 200" class="chart-svg">
              <defs>
                <linearGradient id="sakaiChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="40" x2="600" y2="40" stroke="var(--border-subtle)" stroke-dasharray="4 4" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border-subtle)" stroke-dasharray="4 4" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="var(--border-subtle)" stroke-dasharray="4 4" />

              <path d="M 0,150 Q 100,120 180,135 T 320,55 T 460,85 T 600,25 L 600,195 L 0,195 Z" fill="url(#sakaiChartGrad)" />
              <path d="M 0,150 Q 100,120 180,135 T 320,55 T 460,85 T 600,25" fill="none" stroke="var(--color-primary)" stroke-width="3" />

              <circle cx="180" cy="135" r="4" fill="var(--bg-surface)" stroke="var(--color-primary)" stroke-width="2.5" />
              <circle cx="320" cy="55" r="4" fill="var(--bg-surface)" stroke="var(--color-primary)" stroke-width="2.5" />
              <circle cx="600" cy="25" r="4" fill="var(--bg-surface)" stroke="var(--color-primary)" stroke-width="2.5" />
            </svg>
            <div class="chart-timestamps font-mono">
              <span>08:00 AM</span>
              <span>10:00 AM</span>
              <span>12:00 PM</span>
              <span>02:00 PM</span>
              <span>04:00 PM</span>
              <span>NOW</span>
            </div>
          </div>
        </div>

        <!-- Recent Events Activity Card -->
        <div class="sakai-card activity-card">
          <div class="card-header-bar">
            <div>
              <h2 class="card-heading">Recent Activity</h2>
              <p class="card-subheading">Operational event stream</p>
            </div>
            <a routerLink="/events" class="view-link">View All →</a>
          </div>

          <div class="activity-timeline">
            @for (evt of eventService.events().slice(0, 4); track evt.id) {
              <div class="activity-row">
                <span class="activity-dot" [class.success]="evt.status === 'success'" [class.warning]="evt.status === 'warning'"></span>
                <div class="activity-body">
                  <span class="activity-title">{{ evt.summary }}</span>
                  <span class="activity-time font-mono">{{ evt.timestamp | date:'shortTime' }} • {{ evt.service }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sakai-dashboard {
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-height: calc(100vh - 64px);
    }

    .dashboard-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .banner-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .banner-sub {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }

    /* 4 Sakai Stat Cards */
    .sakai-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .stat-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
    }

    .stat-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .stat-label {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .stat-value {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--text-main);
      margin-top: 0.25rem;
    }

    .stat-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-blue { background-color: var(--color-blue-subtle); color: var(--color-blue); }
    .icon-green { background-color: var(--color-primary-subtle); color: var(--color-primary); }
    .icon-purple { background-color: var(--color-purple-subtle); color: var(--color-purple); }
    .icon-orange { background-color: var(--color-warning-subtle); color: var(--color-warning); }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
    }

    .stat-trend {
      font-weight: 700;
    }

    .stat-desc {
      color: var(--text-muted);
    }

    /* Content Grid */
    .sakai-content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;
    }

    .chart-card, .activity-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
    }

    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .card-heading {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .card-subheading {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .time-pill-group {
      display: flex;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 2px;
    }

    .time-pill {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-xs);
      cursor: pointer;
      font-weight: 500;
    }

    .time-pill.active {
      background: var(--bg-surface);
      color: var(--text-main);
      font-weight: 700;
      box-shadow: var(--shadow-xs);
    }

    .chart-wrapper {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.75rem;
    }

    .chart-svg {
      width: 100%;
      height: 180px;
    }

    .chart-timestamps {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .activity-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background-color: var(--color-primary);
      margin-top: 0.35rem;
      flex-shrink: 0;
    }

    .activity-dot.success { background-color: var(--color-success); }
    .activity-dot.warning { background-color: var(--color-warning); }

    .activity-body {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .activity-title {
      font-size: 0.85rem;
      color: var(--text-main);
      line-height: 1.3;
    }

    .activity-time {
      font-size: 0.725rem;
      color: var(--text-muted);
    }

    .view-link {
      font-size: 0.8rem;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class DashboardComponent {
  public authService = inject(AuthService);
  public eventService = inject(EventService);
  public inventoryService = inject(InventoryService);
}
