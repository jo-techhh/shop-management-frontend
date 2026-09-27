import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page bg-grid-subtle">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Retail Analytics & Operational Reports</h1>
          <p class="page-subtitle">Multi-outlet financial performance, volume distribution, and category revenue share.</p>
        </div>
        <div class="date-range font-mono">
          <span>Range: <strong>Sep 20, 2026 – Sep 27, 2026</strong></span>
        </div>
      </div>

      <!-- Analytics Grid -->
      <div class="analytics-grid">
        <!-- Widget 1: Revenue Stream Grid Bar Chart -->
        <div class="grid-card widget-large">
          <div class="widget-header">
            <div>
              <h3 class="widget-title">Daily Revenue Stream</h3>
              <p class="widget-sub">Aggregated daily sales across all store terminals</p>
            </div>
            <span class="badge badge-success">+18.5% YoY</span>
          </div>

          <div class="bar-chart-container bg-grid-dots">
            <div class="bar-column">
              <div class="bar" style="height: 60%"></div>
              <span class="bar-label font-mono">Mon</span>
            </div>
            <div class="bar-column">
              <div class="bar" style="height: 75%"></div>
              <span class="bar-label font-mono">Tue</span>
            </div>
            <div class="bar-column">
              <div class="bar" style="height: 45%"></div>
              <span class="bar-label font-mono">Wed</span>
            </div>
            <div class="bar-column">
              <div class="bar" style="height: 85%"></div>
              <span class="bar-label font-mono">Thu</span>
            </div>
            <div class="bar-column">
              <div class="bar" style="height: 90%"></div>
              <span class="bar-label font-mono">Fri</span>
            </div>
            <div class="bar-column">
              <div class="bar highlight" style="height: 100%"></div>
              <span class="bar-label font-mono">Sat</span>
            </div>
            <div class="bar-column">
              <div class="bar" style="height: 65%"></div>
              <span class="bar-label font-mono">Sun</span>
            </div>
          </div>
        </div>

        <!-- Widget 2: Category Breakdown -->
        <div class="grid-card widget-medium">
          <div class="widget-header">
            <div>
              <h3 class="widget-title">Category Revenue Share</h3>
              <p class="widget-sub">Product vertical contribution</p>
            </div>
          </div>
          <div class="category-breakdown">
            <div class="cat-progress-row">
              <div class="cat-info">
                <span>Keyboards & Hardware</span>
                <strong class="font-mono">48%</strong>
              </div>
              <div class="progress-track"><div class="progress-bar p-primary" style="width: 48%"></div></div>
            </div>
            <div class="cat-progress-row">
              <div class="cat-info">
                <span>Audio Monitors & Cans</span>
                <strong class="font-mono">24%</strong>
              </div>
              <div class="progress-track"><div class="progress-bar p-success" style="width: 24%"></div></div>
            </div>
            <div class="cat-progress-row">
              <div class="cat-info">
                <span>Apparel & Desk Mats</span>
                <strong class="font-mono">16%</strong>
              </div>
              <div class="progress-track"><div class="progress-bar p-warning" style="width: 16%"></div></div>
            </div>
            <div class="cat-progress-row">
              <div class="cat-info">
                <span>Accessories & Cables</span>
                <strong class="font-mono">12%</strong>
              </div>
              <div class="progress-track"><div class="progress-bar p-info" style="width: 12%"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Table: Outlet Performance -->
      <div class="grid-card table-wrapper">
        <div class="grid-header">
          <h3 class="card-title">Outlet Sales Breakdown</h3>
          <span class="font-mono text-muted">Weekly aggregate ledger</span>
        </div>
        <table class="grid-table">
          <thead>
            <tr>
              <th>Outlet Name</th>
              <th>Location</th>
              <th>Gross Revenue</th>
              <th>Orders Count</th>
              <th>Avg Order Value</th>
              <th>Performance Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong class="outlet-col-name">Main Flagship Store</strong></td>
              <td><span class="font-mono text-muted">Bengaluru</span></td>
              <td><strong class="font-mono">₹482,900.00</strong></td>
              <td><span class="font-mono">1,420</span></td>
              <td><span class="font-mono">₹340.07</span></td>
              <td><span class="badge badge-success">Top Performing</span></td>
            </tr>
            <tr>
              <td><strong class="outlet-col-name">Koramangala</strong></td>
              <td><span class="font-mono text-muted">Bengaluru</span></td>
              <td><strong class="font-mono">₹218,450.00</strong></td>
              <td><span class="font-mono">840</span></td>
              <td><span class="font-mono">₹260.05</span></td>
              <td><span class="badge badge-success">On Target</span></td>
            </tr>
            <tr>
              <td><strong class="outlet-col-name">Trivandrum</strong></td>
              <td><span class="font-mono text-muted">Kerala</span></td>
              <td><strong class="font-mono">₹154,200.00</strong></td>
              <td><span class="font-mono">512</span></td>
              <td><span class="font-mono">₹301.17</span></td>
              <td><span class="badge badge-neutral">Stable</span></td>
            </tr>
            <tr>
              <td><strong class="outlet-col-name">Nagercoil</strong></td>
              <td><span class="font-mono text-muted">Tamil Nadu</span></td>
              <td><strong class="font-mono">₹98,500.00</strong></td>
              <td><span class="font-mono">310</span></td>
              <td><span class="font-mono">₹317.74</span></td>
              <td><span class="badge badge-warning">Growth Area</span></td>
            </tr>
            <tr>
              <td><strong class="outlet-col-name">Central Warehouses</strong></td>
              <td><span class="font-mono text-muted">Logistics Hub</span></td>
              <td><strong class="font-mono">₹0.00 (Fulfillment)</strong></td>
              <td><span class="font-mono">3,280 dispatches</span></td>
              <td><span class="font-mono">—</span></td>
              <td><span class="badge badge-primary">Operational Hub</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-height: calc(100vh - 56px);
    }

    .page-header {
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
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.15rem;
    }

    .date-range {
      font-size: 0.75rem;
      color: var(--text-muted);
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-md);
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .widget-large, .widget-medium {
      padding: 1.15rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .widget-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .widget-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 0.1rem;
    }

    .bar-chart-container {
      height: 180px;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      padding: 1rem 0.5rem;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }

    .bar-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      height: 100%;
      justify-content: flex-end;
      width: 38px;
    }

    .bar {
      width: 20px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 3px 3px 0 0;
      transition: height 0.3s ease;
    }

    .bar.highlight {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }

    .bar-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .category-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .cat-progress-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .cat-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-main);
    }

    .progress-track {
      height: 5px;
      background-color: var(--bg-secondary);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar { height: 100%; border-radius: 3px; }
    .p-primary { background-color: var(--color-primary); }
    .p-success { background-color: var(--color-success); }
    .p-warning { background-color: var(--color-warning); }
    .p-info { background-color: var(--color-info); }

    .card-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .outlet-col-name {
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.8125rem;
    }

    @media (max-width: 1024px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent {}
