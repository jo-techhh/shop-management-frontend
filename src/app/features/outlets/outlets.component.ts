import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, Outlet } from '../../core/services/auth.service';

@Component({
  selector: 'app-outlets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="outlets-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Retail Outlets & Warehouses</h1>
          <p class="page-subtitle">Multi-outlet location matrix, active registers, and stock indicators.</p>
        </div>
        <button class="btn-primary">+ Register New Outlet</button>
      </div>

      <div class="outlets-grid">
        @for (outlet of authService.availableOutlets(); track outlet.id) {
          <div class="grid-card outlet-card" [class.active-selected]="outlet.id === authService.currentOutlet().id">
            <div class="card-header">
              <div class="outlet-title">
                <span class="store-icon">{{ outlet.code.startsWith('WH') ? '🏭' : '🏪' }}</span>
                <div>
                  <h3 class="store-name">{{ outlet.name }}</h3>
                  <span class="store-code">{{ outlet.code }} • {{ outlet.city }}</span>
                </div>
              </div>
              <span class="badge badge-success">{{ outlet.status }}</span>
            </div>

            <!-- Store Key Metrics -->
            <div class="outlet-stats-row">
              <div class="stat-col">
                <span class="stat-lbl">Today's Sales</span>
                <strong class="stat-val">{{ outlet.todaySales }}</strong>
              </div>
              <div class="stat-col">
                <span class="stat-lbl">Ledger Stock</span>
                <strong class="stat-val">{{ outlet.stockCount | number }} pcs</strong>
              </div>
              <div class="stat-col">
                <span class="stat-lbl">Low Stock Alerts</span>
                <span class="badge" [class.badge-warning]="outlet.lowStockCount > 0" [class.badge-neutral]="outlet.lowStockCount === 0">
                  {{ outlet.lowStockCount }} items
                </span>
              </div>
            </div>

            <!-- Active Registers -->
            <div class="registers-section">
              <span class="section-label">Active Registers / Terminals</span>
              <div class="register-pill">
                <span class="status-dot"></span>
                <span>{{ outlet.openRegisters }} Active Register(s)</span>
                <span class="cashier-name">Operational</span>
              </div>
            </div>

            <div class="card-footer">
              <button
                class="btn-secondary"
                [disabled]="outlet.id === authService.currentOutlet().id"
                (click)="authService.setOutlet(outlet)"
              >
                {{ outlet.id === authService.currentOutlet().id ? '✓ Currently Viewing' : 'Switch To Store' }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .outlets-page {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
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
    }

    .page-subtitle {
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    .outlets-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .outlet-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .outlet-card.active-selected {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 1px var(--color-primary-subtle);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .outlet-title {
      display: flex;
      gap: 0.65rem;
      align-items: center;
    }

    .store-icon {
      font-size: 1.25rem;
      background: var(--bg-secondary);
      padding: 0.35rem;
      border-radius: var(--radius-sm);
    }

    .store-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .store-code {
      font-size: 0.725rem;
      color: var(--text-muted);
    }

    .outlet-stats-row {
      display: flex;
      justify-content: space-between;
      background-color: var(--bg-secondary);
      border-radius: var(--radius-sm);
      padding: 0.65rem 0.875rem;
    }

    .stat-col {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .stat-lbl {
      font-size: 0.675rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .stat-val {
      font-size: 0.875rem;
      color: var(--text-main);
    }

    .registers-section {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .section-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .register-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--bg-secondary);
      padding: 0.45rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background-color: var(--color-success);
      border-radius: 50%;
    }

    .cashier-name {
      margin-left: auto;
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .card-footer {
      margin-top: auto;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class OutletsComponent {
  public authService = inject(AuthService);
}
