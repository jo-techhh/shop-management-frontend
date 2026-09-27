import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OrderRecord {
  id: string;
  orderNumber: string;
  dateTime: string;
  outletName: string;
  cashierName: string;
  paymentMethod: 'CASH' | 'CARD' | 'UPI';
  totalAmount: number;
  status: 'completed' | 'cancelled' | 'pending';
  sagaTraceId: string;
  sagaSteps: {
    title: string;
    service: string;
    status: 'success' | 'failed' | 'compensated';
    time: string;
  }[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-page bg-grid-subtle">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Sales Orders & Saga Receipts</h1>
          <p class="page-subtitle">Historical point-of-sale transactions and distributed saga audit trails.</p>
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="table-toolbar">
        <div class="search-input-box">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            class="input-field search-box"
            placeholder="Search order ref, cashier, outlet..."
            [(ngModel)]="searchQuery"
          />
        </div>

        <div class="status-filters">
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedStatus() === 'all'"
            (click)="selectedStatus.set('all')"
          >All Orders</button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedStatus() === 'completed'"
            (click)="selectedStatus.set('completed')"
          >Completed</button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedStatus() === 'cancelled'"
            (click)="selectedStatus.set('cancelled')"
          >Compensated / Cancelled</button>
        </div>
      </div>

      <!-- Clean Orders Table -->
      <div class="grid-card table-wrapper">
        <table class="grid-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Date & Time</th>
              <th>Outlet</th>
              <th>Cashier</th>
              <th>Payment Method</th>
              <th>Total Amount</th>
              <th>Saga Status</th>
              <th style="text-align: right;">Saga Trace</th>
            </tr>
          </thead>
          <tbody>
            @for (order of filteredOrders(); track order.id) {
              <tr class="order-table-row" (click)="openSagaDetail(order)">
                <td><code class="order-ref font-mono">{{ order.orderNumber }}</code></td>
                <td><span class="text-muted font-mono">{{ order.dateTime }}</span></td>
                <td><span>{{ order.outletName }}</span></td>
                <td><span class="cashier-tag">{{ order.cashierName }}</span></td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="{
                      'badge-primary': order.paymentMethod === 'CARD',
                      'badge-success': order.paymentMethod === 'CASH',
                      'badge-warning': order.paymentMethod === 'UPI'
                    }"
                  >{{ order.paymentMethod }}</span>
                </td>
                <td><strong class="total-price font-mono">₹{{ order.totalAmount | number:'1.2-2' }}</strong></td>
                <td>
                  @if (order.status === 'completed') {
                    <span class="badge badge-success">Completed</span>
                  } @else if (order.status === 'cancelled') {
                    <span class="badge badge-danger">Rollback / Cancelled</span>
                  } @else {
                    <span class="badge badge-warning">Processing</span>
                  }
                </td>
                <td style="text-align: right;">
                  <button class="btn-ghost trace-btn" (click)="openSagaDetail(order); $event.stopPropagation()">
                    View Saga
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8">
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="empty-state-title">No orders match filter criteria</span>
                    <span class="empty-state-desc">Try clearing the search query or selecting a different status filter.</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- 10. Architecture Order Saga Drawer / Modal -->
      @if (activeOrderModal()) {
        <div class="modal-overlay" (click)="activeOrderModal.set(null)">
          <div class="saga-dialog" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <div>
                <span class="dialog-title font-mono">{{ activeOrderModal()?.orderNumber }}</span>
                <span class="dialog-sub font-mono">Correlation ID: {{ activeOrderModal()?.sagaTraceId }}</span>
              </div>
              <button class="close-x" (click)="activeOrderModal.set(null)">✕</button>
            </div>

            <div class="dialog-body">
              <div class="order-meta-banner">
                <div class="meta-item">
                  <span class="meta-k">OUTLET</span>
                  <span class="meta-v">{{ activeOrderModal()?.outletName }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-k">AMOUNT</span>
                  <span class="meta-v font-mono">₹{{ activeOrderModal()?.totalAmount | number:'1.2-2' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-k">TENDER</span>
                  <span class="meta-v font-mono">{{ activeOrderModal()?.paymentMethod }}</span>
                </div>
              </div>

              <!-- Saga Step Pipeline Diagram -->
              <div class="saga-step-list">
                <span class="saga-pipeline-label">DISTRIBUTED SAGA LIFECYCLE</span>
                @for (step of activeOrderModal()?.sagaSteps; track step.title; let last = $last) {
                  <div class="lifecycle-step">
                    <div class="step-icon-col">
                      <span
                        class="status-dot"
                        [ngClass]="{
                          'status-dot-success': step.status === 'success',
                          'status-dot-danger': step.status === 'failed',
                          'status-dot-warning': step.status === 'compensated'
                        }"
                      ></span>
                      @if (!last) {
                        <div class="step-v-line"></div>
                      }
                    </div>
                    <div class="step-text-col">
                      <div class="step-h">
                        <span class="step-title-text">{{ step.title }}</span>
                        <span class="step-ts font-mono">{{ step.time }}</span>
                      </div>
                      <span class="step-svc-tag font-mono">{{ step.service }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="dialog-footer">
              <button class="btn-secondary" (click)="activeOrderModal.set(null)">Close</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-page {
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

    .order-table-row {
      cursor: pointer;
    }

    .order-ref {
      font-size: 0.78125rem;
      background: var(--bg-secondary);
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-xs);
      font-weight: 600;
      color: var(--text-main);
    }

    .cashier-tag {
      font-size: 0.78125rem;
    }

    .total-price {
      font-size: 0.875rem;
      color: var(--text-main);
    }

    .trace-btn {
      font-size: 0.72rem;
      color: var(--color-primary);
    }

    /* SAGA DIALOG */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .saga-dialog {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      width: 440px;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dialog-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .dialog-sub {
      display: block;
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .close-x {
      background: transparent;
      border: none;
      font-size: 1rem;
      color: var(--text-muted);
      cursor: pointer;
    }

    .dialog-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-meta-banner {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0.65rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .meta-k {
      font-size: 0.625rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    .meta-v {
      font-size: 0.78125rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .saga-step-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .saga-pipeline-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .lifecycle-step {
      display: flex;
      gap: 0.75rem;
    }

    .step-icon-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 14px;
    }

    .step-icon-col .status-dot {
      margin-top: 4px;
    }

    .step-v-line {
      width: 1.5px;
      flex: 1;
      background: var(--border-color);
      margin: 4px 0;
    }

    .step-text-col {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding-bottom: 0.75rem;
      flex: 1;
    }

    .step-h {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .step-title-text {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .step-ts {
      font-size: 0.6875rem;
      color: var(--text-dim);
    }

    .step-svc-tag {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .dialog-footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class OrdersComponent {
  public searchQuery = '';
  public selectedStatus = signal<'all' | 'completed' | 'cancelled'>('all');
  public activeOrderModal = signal<OrderRecord | null>(null);

  public orders: OrderRecord[] = [
    {
      id: 'ord-1',
      orderNumber: 'ORD-2026-849201',
      dateTime: '2026-09-27 12:30:14',
      outletName: 'Main Flagship Store',
      cashierName: 'Jobi',
      paymentMethod: 'CARD',
      totalAmount: 18990.00,
      status: 'completed',
      sagaTraceId: 'trace-849201-92b0-4f',
      sagaSteps: [
        { title: 'Order Created', service: 'billing-service (Outbox saved)', status: 'success', time: '12:30:11' },
        { title: 'Stock Reserved', service: 'inventory-service (stream:orders)', status: 'success', time: '12:30:12' },
        { title: 'Payment Confirmed', service: 'billing-service (Card swipe verified)', status: 'success', time: '12:30:13' },
        { title: 'Order Completed', service: 'billing-service (Receipt issued)', status: 'success', time: '12:30:14' }
      ]
    },
    {
      id: 'ord-2',
      orderNumber: 'ORD-2026-849198',
      dateTime: '2026-09-27 11:45:02',
      outletName: 'Koramangala',
      cashierName: 'Alex',
      paymentMethod: 'CASH',
      totalAmount: 6499.00,
      status: 'completed',
      sagaTraceId: 'trace-849198-11f2-7a',
      sagaSteps: [
        { title: 'Order Created', service: 'billing-service (Outbox saved)', status: 'success', time: '11:45:00' },
        { title: 'Stock Reserved', service: 'inventory-service (stream:orders)', status: 'success', time: '11:45:01' },
        { title: 'Payment Confirmed', service: 'billing-service (Exact Cash Tender)', status: 'success', time: '11:45:01' },
        { title: 'Order Completed', service: 'billing-service (Receipt issued)', status: 'success', time: '11:45:02' }
      ]
    },
    {
      id: 'ord-3',
      orderNumber: 'ORD-2026-849195',
      dateTime: '2026-09-27 11:10:48',
      outletName: 'Main Flagship Store',
      cashierName: 'Jobi',
      paymentMethod: 'UPI',
      totalAmount: 2490.00,
      status: 'completed',
      sagaTraceId: 'trace-849195-65d1-9c',
      sagaSteps: [
        { title: 'Order Created', service: 'billing-service (Outbox saved)', status: 'success', time: '11:10:45' },
        { title: 'Stock Reserved', service: 'inventory-service (stream:orders)', status: 'success', time: '11:10:46' },
        { title: 'Payment Confirmed', service: 'billing-service (UPI Dynamic QR)', status: 'success', time: '11:10:47' },
        { title: 'Order Completed', service: 'billing-service (Receipt issued)', status: 'success', time: '11:10:48' }
      ]
    },
    {
      id: 'ord-4',
      orderNumber: 'ORD-2026-849190',
      dateTime: '2026-09-27 10:22:15',
      outletName: 'Trivandrum',
      cashierName: 'Rahul',
      paymentMethod: 'CARD',
      totalAmount: 9999.00,
      status: 'cancelled',
      sagaTraceId: 'trace-849190-33a8-1b',
      sagaSteps: [
        { title: 'Order Created', service: 'billing-service', status: 'success', time: '10:22:10' },
        { title: 'Stock Reserved', service: 'inventory-service', status: 'success', time: '10:22:11' },
        { title: 'Payment Failed', service: 'billing-service (Declined by Bank)', status: 'failed', time: '10:22:13' },
        { title: 'Stock Released', service: 'inventory-service (Compensation triggered)', status: 'compensated', time: '10:22:14' },
        { title: 'Order Cancelled', service: 'billing-service (Saga aborted)', status: 'compensated', time: '10:22:15' }
      ]
    }
  ];

  public filteredOrders = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const st = this.selectedStatus();

    return this.orders.filter(o => {
      const matchQuery = !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.outletName.toLowerCase().includes(q) ||
        o.cashierName.toLowerCase().includes(q);

      const matchStatus = st === 'all' || o.status === st;

      return matchQuery && matchStatus;
    });
  });

  public openSagaDetail(order: OrderRecord): void {
    this.activeOrderModal.set(order);
  }
}
