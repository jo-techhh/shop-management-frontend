import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="transfers-page bg-grid-subtle">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Inter-Outlet Stock Transfers</h1>
          <p class="page-subtitle">Track multi-outlet freight movements, replenishment dispatches, and transit ledgers.</p>
        </div>
        <button class="btn-primary" (click)="showNewTransferModal.set(true)">
          + Initiate Stock Transfer
        </button>
      </div>

      <!-- Active Logistics Pipeline Corridor -->
      <div class="grid-card movement-canvas">
        <div class="canvas-header">
          <span class="canvas-title">Active Freight Corridor</span>
          <span class="badge badge-warning">1 Transfer In Transit</span>
        </div>
        <div class="lines-wrapper">
          <div class="node-box">
            <span class="node-dot status-dot-info"></span>
            <span class="node-name">Main Flagship Store</span>
            <span class="node-sub font-mono">MFS-BLR · Dispatch Origin</span>
          </div>

          <div class="connection-line">
            <div class="animated-pulse"></div>
            <span class="line-tag font-mono">20 units in transit · TRF-2026-001</span>
          </div>

          <div class="node-box">
            <span class="node-dot status-dot-success"></span>
            <span class="node-name">Koramangala</span>
            <span class="node-sub font-mono">KOR-BLR · Destination Store</span>
          </div>
        </div>
      </div>

      <!-- Transfers Data Table -->
      <div class="grid-card table-wrapper">
        <div class="table-card-head">
          <h3 class="table-head-title">Transfer Movement Ledger</h3>
          <span class="font-mono text-muted font-sm">{{ inventoryService.transfers().length }} records</span>
        </div>
        <table class="grid-table">
          <thead>
            <tr>
              <th>Transfer Ref #</th>
              <th>Source Outlet</th>
              <th>Destination Outlet</th>
              <th>Items & Qty</th>
              <th>Status</th>
              <th style="text-align: right;">Created At</th>
            </tr>
          </thead>
          <tbody>
            @for (trf of inventoryService.transfers(); track trf.id) {
              <tr>
                <td><code class="trf-code font-mono">{{ trf.transferNumber }}</code></td>
                <td><span class="outlet-name font-mono">{{ trf.sourceOutletName }}</span></td>
                <td><span class="outlet-name font-mono">{{ trf.destinationOutletName }}</span></td>
                <td>
                  <span class="qty-badge font-mono">{{ trf.itemsCount }} SKUs ({{ trf.totalQuantity }} pcs)</span>
                </td>
                <td>
                  @if (trf.status === 'in_transit') {
                    <span class="badge badge-warning">In Transit</span>
                  } @else if (trf.status === 'completed') {
                    <span class="badge badge-success">Completed</span>
                  } @else {
                    <span class="badge badge-neutral">Pending</span>
                  }
                </td>
                <td style="text-align: right;"><span class="time-lbl font-mono">{{ trf.createdAt | date:'short' }}</span></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">
                  <!-- 14. Useful Minimal Empty State -->
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span class="empty-state-title">No stock transfers yet</span>
                    <span class="empty-state-desc">Transfers between outlets will appear here.</span>
                    <button class="btn-primary" (click)="showNewTransferModal.set(true)">Create Transfer</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Initiate Transfer Modal -->
      @if (showNewTransferModal()) {
        <div class="modal-overlay" (click)="showNewTransferModal.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <span class="modal-title">Initiate Inter-Outlet Transfer</span>
              <button class="close-x" (click)="showNewTransferModal.set(false)">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Source Origin Outlet</label>
                <select class="input-field" [(ngModel)]="sourceOutletId">
                  @for (o of authService.availableOutlets(); track o.id) {
                    <option [value]="o.id">{{ o.name }} ({{ o.code }})</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Destination Outlet</label>
                <select class="input-field" [(ngModel)]="destOutletId">
                  @for (o of authService.availableOutlets(); track o.id) {
                    <option [value]="o.id">{{ o.name }} ({{ o.code }})</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Total Dispatch Quantity (Units)</label>
                <input type="number" class="input-field" [(ngModel)]="transferQty" />
                <span class="field-hint">Published to stream:inventory with lock reservation.</span>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="showNewTransferModal.set(false)">Cancel</button>
              <button class="btn-primary" (click)="submitTransfer()">Dispatch Transfer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .transfers-page {
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

    .movement-canvas {
      padding: 1.15rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
    }

    .canvas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .canvas-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .lines-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
      border: 1px dashed var(--border-color);
    }

    .node-box {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      width: 200px;
      position: relative;
    }

    .node-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 6.5px;
      height: 6.5px;
      border-radius: 50%;
    }

    .node-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .node-sub {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .connection-line {
      flex: 1;
      height: 2px;
      background-color: var(--color-warning);
      margin: 0 1.25rem;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .animated-pulse {
      position: absolute;
      width: 24px;
      height: 2px;
      background-color: var(--color-primary);
      animation: movePulse 2.5s infinite linear;
    }

    @keyframes movePulse {
      0% { left: 0%; opacity: 0; }
      50% { opacity: 1; }
      100% { left: 100%; opacity: 0; }
    }

    .line-tag {
      position: absolute;
      top: -22px;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--color-warning);
      background-color: var(--bg-surface);
      padding: 0.1rem 0.5rem;
      border-radius: var(--radius-xs);
      border: 1px solid var(--color-warning-border);
      white-space: nowrap;
    }

    .table-card-head {
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-head-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .font-sm {
      font-size: 0.72rem;
    }

    .trf-code {
      font-size: 0.78125rem;
      background: var(--bg-secondary);
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-xs);
      font-weight: 600;
      color: var(--text-main);
    }

    .outlet-name {
      font-size: 0.78125rem;
    }

    .qty-badge {
      font-size: 0.78125rem;
      color: var(--text-muted);
    }

    .time-lbl {
      font-size: 0.72rem;
      color: var(--text-dim);
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
      width: 440px;
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

    .modal-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
export class TransfersComponent {
  public inventoryService = inject(InventoryService);
  public authService = inject(AuthService);

  public showNewTransferModal = signal<boolean>(false);
  public sourceOutletId = 'out-01';
  public destOutletId = 'out-02';
  public transferQty = 20;

  public submitTransfer(): void {
    const src = this.authService.availableOutlets().find(o => o.id === this.sourceOutletId);
    const dest = this.authService.availableOutlets().find(o => o.id === this.destOutletId);

    this.inventoryService.createTransfer({
      sourceOutletId: this.sourceOutletId,
      sourceOutletName: src?.name || 'Source Store',
      destinationOutletId: this.destOutletId,
      destinationOutletName: dest?.name || 'Destination Store',
      itemsCount: 3,
      totalQuantity: this.transferQty
    });

    this.showNewTransferModal.set(false);
  }
}
