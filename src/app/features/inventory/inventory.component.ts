import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, StockItem } from '../../core/services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-page bg-grid-subtle">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Multi-Outlet Inventory Ledger</h1>
          <p class="page-subtitle">Available units, reserved checkout locks, and low-stock replenishment.</p>
        </div>
        <button class="btn-secondary" (click)="fetchFreshData()">
          <svg class="refresh-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Sync Ledger</span>
        </button>
      </div>

      <!-- Quick Health Stats -->
      <div class="health-grid">
        <div class="grid-card health-card">
          <span class="health-lbl">Normal Stock</span>
          <span class="health-val font-mono text-success">3 SKUs</span>
          <span class="health-sub">Healthy distribution</span>
        </div>
        <div class="grid-card health-card">
          <span class="health-lbl">Low Stock Alerts</span>
          <span class="health-val font-mono text-warning">
            {{ inventoryService.lowStockAlertsCount() }} SKUs
          </span>
          <span class="health-sub">Reorder recommended</span>
        </div>
        <div class="grid-card health-card">
          <span class="health-lbl">Critical / Depleted</span>
          <span class="health-val font-mono text-danger">1 SKU</span>
          <span class="health-sub">Requires replenishment</span>
        </div>
      </div>

      <!-- Table Filter Toolbar -->
      <div class="table-toolbar">
        <div class="search-input-box">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            class="input-field search-box"
            placeholder="Filter SKU, barcode, product name..."
            [(ngModel)]="searchFilter"
          />
        </div>

        <div class="status-filters">
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedStatus() === 'all'"
            (click)="selectedStatus.set('all')"
          >All</button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedStatus() === 'normal'"
            (click)="selectedStatus.set('normal')"
          >Normal</button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedStatus() === 'low'"
            (click)="selectedStatus.set('low')"
          >Low Stock</button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedStatus() === 'critical'"
            (click)="selectedStatus.set('critical')"
          >Critical</button>
        </div>
      </div>

      <!-- 13. Clean Production Table: SKU | Product | Outlet | Available | Reserved | Status | Actions -->
      <div class="grid-card table-wrapper">
        <table class="grid-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Outlet</th>
              <th>Available</th>
              <th>Reserved</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (item of filteredStockItems(); track item.id) {
              <tr>
                <td>
                  <div class="sku-cell">
                    <code class="sku-code font-mono">{{ item.sku }}</code>
                    <span class="barcode-sub font-mono">{{ item.barcode }}</span>
                  </div>
                </td>
                <td><span class="item-name">{{ item.productName }}</span></td>
                <td><span class="outlet-tag font-mono">{{ item.outletName }}</span></td>
                <td><strong class="qty-avail font-mono">{{ item.availableQuantity }}</strong></td>
                <td>
                  <span class="qty-res font-mono" [class.has-reserved]="item.reservedQuantity > 0">
                    {{ item.reservedQuantity }} reserved
                  </span>
                </td>
                <td>
                  @if (item.status === 'normal') {
                    <span class="badge badge-success">Normal</span>
                  } @else if (item.status === 'low') {
                    <span class="badge badge-warning">Low Stock</span>
                  } @else {
                    <span class="badge badge-danger">Critical</span>
                  }
                </td>
                <td style="text-align: right;">
                  <button class="btn-ghost action-btn" (click)="openAdjust(item)">Adjust</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">
                  <!-- 14. Clean Empty State -->
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span class="empty-state-title">No stock items match query</span>
                    <span class="empty-state-desc">Try clearing your search query or reset the status filter.</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Quick Adjustment Modal -->
      @if (selectedItemForAdjust()) {
        <div class="modal-overlay" (click)="selectedItemForAdjust.set(null)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <span class="modal-title">Adjust Ledger Quantity</span>
              <button class="close-x" (click)="selectedItemForAdjust.set(null)">✕</button>
            </div>
            <div class="adjust-body">
              <div class="adjust-info-box">
                <span class="adjust-pname">{{ selectedItemForAdjust()?.productName }}</span>
                <code class="font-mono text-muted">{{ selectedItemForAdjust()?.sku }} · {{ selectedItemForAdjust()?.outletName }}</code>
              </div>
              <div class="form-group">
                <label class="form-label">Physical Count On Hand</label>
                <input type="number" class="input-field" [(ngModel)]="newAdjustQty" />
                <span class="field-hint">Updates the distributed inventory service ledger.</span>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="selectedItemForAdjust.set(null)">Cancel</button>
              <button class="btn-primary" (click)="saveAdjustment()">Save Stock</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .inventory-page {
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

    .refresh-icon {
      width: 14px;
      height: 14px;
    }

    .health-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .health-card {
      padding: 0.875rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
    }

    .health-lbl {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .health-val {
      font-size: 1.35rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .health-sub {
      font-size: 0.6875rem;
      color: var(--text-dim);
    }

    .text-success { color: var(--color-success); }
    .text-warning { color: var(--color-warning); }
    .text-danger { color: var(--color-danger); }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .search-input-box {
      position: relative;
      width: 320px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-box {
      padding-left: 2.25rem;
    }

    .status-filters {
      display: flex;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 2px;
      gap: 2px;
    }

    .filter-pill {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 500;
    }

    .filter-pill.active {
      background: var(--bg-secondary);
      color: var(--text-main);
      font-weight: 600;
    }

    .sku-cell {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .sku-code {
      font-size: 0.78125rem;
      background-color: var(--bg-secondary);
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-xs);
      font-weight: 600;
      color: var(--text-main);
      width: fit-content;
    }

    .barcode-sub {
      font-size: 0.6875rem;
      color: var(--text-dim);
    }

    .item-name {
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.8125rem;
    }

    .outlet-tag {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .qty-avail {
      font-size: 0.875rem;
      color: var(--color-primary);
    }

    .qty-res {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .qty-res.has-reserved {
      color: var(--color-warning);
    }

    .action-btn {
      font-size: 0.72rem;
      color: var(--color-primary);
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .modal-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      width: 400px;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .close-x {
      background: transparent;
      border: none;
      font-size: 1rem;
      color: var(--text-muted);
      cursor: pointer;
    }

    .adjust-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .adjust-info-box {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .adjust-pname {
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.8125rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .field-hint {
      font-size: 0.6875rem;
      color: var(--text-dim);
    }

    .modal-footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class InventoryComponent {
  public inventoryService = inject(InventoryService);

  public searchFilter = '';
  public selectedStatus = signal<'all' | 'normal' | 'low' | 'critical'>('all');
  public selectedItemForAdjust = signal<StockItem | null>(null);
  public newAdjustQty = 0;

  public filteredStockItems = computed(() => {
    const q = this.searchFilter.toLowerCase().trim();
    const st = this.selectedStatus();

    return this.inventoryService.stockItems().filter(item => {
      const matchQ = !q ||
        item.sku.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.barcode.toLowerCase().includes(q);

      const matchSt = st === 'all' || item.status === st;

      return matchQ && matchSt;
    });
  });

  public fetchFreshData(): void {
    this.inventoryService.fetchInventory();
  }

  public openAdjust(item: StockItem): void {
    this.selectedItemForAdjust.set(item);
    this.newAdjustQty = item.quantityOnHand;
  }

  public saveAdjustment(): void {
    const item = this.selectedItemForAdjust();
    if (item) {
      this.inventoryService.adjustStock(item.id, this.newAdjustQty);
    }
    this.selectedItemForAdjust.set(null);
  }
}
