import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosService } from '../../core/services/pos.service';
import { CatalogService, ProductVariant } from '../../core/services/catalog.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pos-layout">
      <!-- Left Panel: Fast Product Selector & Barcode Scan -->
      <div class="pos-main">
        <!-- POS Barcode & Filter Bar -->
        <div class="pos-topbar">
          <div class="barcode-search-box">
            <svg class="barcode-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <input
              type="text"
              class="barcode-input"
              placeholder="Scan barcode or enter SKU / product name..."
              [(ngModel)]="barcodeQuery"
              (keydown.enter)="onBarcodeSubmit()"
              autofocus
            />
          </div>

          <div class="category-tabs">
            @for (cat of categories; track cat) {
              <button
                type="button"
                class="category-tab"
                [class.active]="selectedCategory() === cat"
                (click)="selectedCategory.set(cat)"
              >
                {{ cat }}
              </button>
            }
          </div>
        </div>

        <!-- Fast Product Grid -->
        <div class="catalog-grid">
          @for (prod of filteredProducts(); track prod.id) {
            @for (variant of prod.variants; track variant.id) {
              <div class="catalog-tile" (click)="posService.addToCart(variant, prod.name)">
                <div class="tile-top">
                  <span class="tile-category font-mono">{{ prod.category }}</span>
                  <span class="tile-stock font-mono" [class.stock-low]="variant.stockQuantity <= 5">
                    {{ variant.stockQuantity }} in stock
                  </span>
                </div>
                <div class="tile-title">{{ prod.name }}</div>
                <div class="tile-bottom">
                  <span class="tile-sku font-mono">{{ variant.sku }}</span>
                  <span class="tile-price font-mono">₹{{ variant.price | number:'1.2-2' }}</span>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Right Panel: High-Speed Cashier Cart & Tender Panel -->
      <div class="pos-cart-panel">
        <div class="cart-header">
          <div class="cart-title">
            <span>Current Ticket</span>
            <span class="cart-count-pill font-mono">{{ posService.cartItems().length }}</span>
          </div>
          @if (posService.cartItems().length > 0) {
            <button class="clear-cart-btn" (click)="posService.clearCart()">Clear</button>
          }
        </div>

        <!-- Ticket Items List -->
        <div class="cart-items-container">
          @if (posService.cartItems().length === 0) {
            <div class="empty-ticket-state">
              <svg class="ticket-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span class="empty-ticket-text">Register ticket is empty</span>
              <span class="empty-ticket-sub">Scan barcodes or click products on the left</span>
            </div>
          } @else {
            <div class="cart-items-list">
              @for (item of posService.cartItems(); track item.variantId) {
                <div class="ticket-row">
                  <div class="ticket-col-info">
                    <span class="ticket-item-name">{{ item.name }}</span>
                    <span class="ticket-item-sku font-mono">{{ item.sku }} · ₹{{ item.unitPrice | number:'1.2-2' }}</span>
                  </div>
                  <div class="ticket-col-qty">
                    <button class="qty-btn" (click)="posService.updateQuantity(item.variantId, item.quantity - 1)">-</button>
                    <span class="qty-num font-mono">{{ item.quantity }}</span>
                    <button class="qty-btn" (click)="posService.updateQuantity(item.variantId, item.quantity + 1)">+</button>
                  </div>
                  <div class="ticket-col-total font-mono">
                    ₹{{ item.total | number:'1.2-2' }}
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Financial Breakdown & Tender Calculations -->
        <div class="cart-tender-footer">
          <div class="financial-row">
            <span class="fin-label">Subtotal</span>
            <span class="fin-value font-mono">₹{{ posService.subtotal() | number:'1.2-2' }}</span>
          </div>

          <!-- Discount Quick Selectors -->
          <div class="discount-row">
            <span class="fin-label">Discount</span>
            <div class="discount-pills">
              <button
                type="button"
                class="disc-pill"
                [class.active]="posService.activeDiscountPercent() === 0"
                (click)="posService.activeDiscountPercent.set(0)"
              >0%</button>
              <button
                type="button"
                class="disc-pill"
                [class.active]="posService.activeDiscountPercent() === 5"
                (click)="posService.activeDiscountPercent.set(5)"
              >5%</button>
              <button
                type="button"
                class="disc-pill"
                [class.active]="posService.activeDiscountPercent() === 10"
                (click)="posService.activeDiscountPercent.set(10)"
              >10%</button>
            </div>
          </div>

          <div class="financial-row">
            <span class="fin-label">GST Tax (18%)</span>
            <span class="fin-value font-mono">₹{{ posService.taxAmount() | number:'1.2-2' }}</span>
          </div>

          <!-- Highly Visible Grand Total -->
          <div class="grand-total-banner">
            <span class="grand-total-label">TOTAL PAYABLE</span>
            <span class="grand-total-amount font-mono">₹{{ posService.totalAmount() | number:'1.2-2' }}</span>
          </div>

          <!-- Fast Payment Tender Buttons: CASH / UPI / CARD -->
          <div class="tender-buttons-grid">
            <button
              class="pay-tender-btn tender-cash"
              [disabled]="posService.cartItems().length === 0"
              (click)="triggerPayment('cash')"
            >
              <span class="tender-btn-title">CASH</span>
              <span class="tender-btn-sub font-mono">Exact tender</span>
            </button>

            <button
              class="pay-tender-btn tender-upi"
              [disabled]="posService.cartItems().length === 0"
              (click)="triggerPayment('upi')"
            >
              <span class="tender-btn-title">UPI</span>
              <span class="tender-btn-sub font-mono">QR Dynamic</span>
            </button>

            <button
              class="pay-tender-btn tender-card"
              [disabled]="posService.cartItems().length === 0"
              (click)="triggerPayment('card')"
            >
              <span class="tender-btn-title">CARD</span>
              <span class="tender-btn-sub font-mono">POS Swipe/Tap</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 80mm ESC/POS Thermal Receipt Modal -->
      @if (showReceiptModal()) {
        <div class="modal-overlay" (click)="showReceiptModal.set(false)">
          <div class="receipt-dialog" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <span class="dialog-title font-mono">ESC/POS Thermal Receipt #ORD-{{ receiptDateNum }}</span>
              <button class="dialog-close" (click)="showReceiptModal.set(false)">✕</button>
            </div>

            <!-- Authentic 80mm Paper Texture -->
            <div class="thermal-receipt-paper font-mono">
              <div class="paper-center store-heading">RETAIL OPERATIONS PLATFORM</div>
              <div class="paper-center">{{ authService.currentOutlet().name }}</div>
              <div class="paper-center">{{ authService.currentOutlet().code }} · GSTIN: 29AABCU9603R1Z7</div>
              <div class="paper-divider">------------------------------------------</div>
              <div class="paper-between">
                <span>Date: {{ today | date:'medium' }}</span>
                <span>Reg: POS-01</span>
              </div>
              <div class="paper-between">
                <span>Cashier: {{ authService.currentUser().fullName }}</span>
                <span>Type: {{ lastPaymentMethod() | uppercase }}</span>
              </div>
              <div class="paper-divider">------------------------------------------</div>

              @for (item of lastReceiptItems(); track item.variantId) {
                <div class="paper-between">
                  <span>{{ item.quantity }}x {{ item.name }}</span>
                  <span>₹{{ item.total | number:'1.2-2' }}</span>
                </div>
              }

              <div class="paper-divider">------------------------------------------</div>
              <div class="paper-between">
                <span>Subtotal:</span>
                <span>₹{{ lastReceiptSubtotal() | number:'1.2-2' }}</span>
              </div>
              <div class="paper-between">
                <span>GST (18%):</span>
                <span>₹{{ lastReceiptTax() | number:'1.2-2' }}</span>
              </div>
              <div class="paper-between paper-total-bold">
                <span>GRAND TOTAL:</span>
                <span>₹{{ lastReceiptTotal() | number:'1.2-2' }}</span>
              </div>
              <div class="paper-divider">==========================================</div>
              <div class="paper-center">Saga Correlation ID: 849201-92b0-4f</div>
              <div class="paper-center">THANK YOU FOR YOUR VISIT!</div>
            </div>

            <div class="dialog-footer">
              <button class="btn-secondary" (click)="showReceiptModal.set(false)">Close</button>
              <button class="btn-primary" (click)="showReceiptModal.set(false)">Print Receipt</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .pos-layout {
      display: flex;
      height: calc(100vh - 56px);
      background-color: var(--bg-app);
      overflow: hidden;
    }

    .pos-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      gap: 0.75rem;
      overflow-y: auto;
    }

    .pos-topbar {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .barcode-search-box {
      position: relative;
      width: 100%;
    }

    .barcode-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }

    .barcode-input {
      width: 100%;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      outline: none;
    }

    .barcode-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-subtle);
    }

    .category-tabs {
      display: flex;
      gap: 0.35rem;
      overflow-x: auto;
    }

    .category-tab {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 0.3rem 0.65rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
    }

    .category-tab.active {
      background-color: var(--color-primary);
      color: var(--text-inverse);
      border-color: var(--color-primary);
    }

    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.65rem;
      align-content: start;
    }

    .catalog-tile {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      cursor: pointer;
      user-select: none;
    }

    .catalog-tile:hover {
      border-color: var(--color-primary);
    }

    .tile-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.6875rem;
    }

    .tile-category {
      color: var(--text-dim);
    }

    .tile-stock {
      color: var(--color-success);
    }

    .tile-stock.stock-low {
      color: var(--color-warning);
    }

    .tile-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.25;
    }

    .tile-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.25rem;
    }

    .tile-sku {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .tile-price {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    /* RIGHT CART PANEL */
    .pos-cart-panel {
      width: 360px;
      background-color: var(--bg-surface);
      border-left: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
    }

    .cart-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cart-title {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--text-main);
    }

    .cart-count-pill {
      font-size: 0.6875rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.05rem 0.35rem;
      border-radius: var(--radius-xs);
    }

    .clear-cart-btn {
      background: transparent;
      border: none;
      color: var(--color-danger);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }

    .cart-items-container {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 1rem;
    }

    .empty-ticket-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--text-dim);
      gap: 0.35rem;
    }

    .ticket-empty-icon {
      width: 36px;
      height: 36px;
      opacity: 0.35;
    }

    .empty-ticket-text {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .empty-ticket-sub {
      font-size: 0.72rem;
    }

    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ticket-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .ticket-col-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .ticket-item-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .ticket-item-sku {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .ticket-col-qty {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin: 0 0.5rem;
    }

    .qty-btn {
      width: 22px;
      height: 22px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      border-radius: var(--radius-xs);
      font-weight: 700;
      cursor: pointer;
    }

    .qty-num {
      font-size: 0.8125rem;
      width: 18px;
      text-align: center;
    }

    .ticket-col-total {
      font-size: 0.8125rem;
      font-weight: 700;
      min-width: 60px;
      text-align: right;
    }

    /* CART TENDER FOOTER */
    .cart-tender-footer {
      padding: 0.875rem 1rem;
      border-top: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .financial-row, .discount-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .discount-pills {
      display: flex;
      gap: 0.25rem;
    }

    .disc-pill {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      font-size: 0.6875rem;
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-xs);
      cursor: pointer;
    }

    .disc-pill.active {
      background: var(--color-primary);
      color: var(--text-inverse);
      border-color: var(--color-primary);
    }

    .grand-total-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.4rem;
      border-top: 1px dashed var(--border-color);
      margin-top: 0.2rem;
    }

    .grand-total-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: 0.04em;
    }

    .grand-total-amount {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-primary);
    }

    /* 3 PAYMENT BUTTONS: CASH, UPI, CARD */
    .tender-buttons-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.4rem;
      margin-top: 0.4rem;
    }

    .pay-tender-btn {
      padding: 0.55rem 0.25rem;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #FFFFFF;
      transition: opacity 0.12s ease;
    }

    .pay-tender-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pay-tender-btn:not(:disabled):hover {
      opacity: 0.9;
    }

    .tender-cash { background-color: #16A34A; }
    .tender-upi { background-color: #7C3AED; }
    .tender-card { background-color: #2563EB; }

    .tender-btn-title {
      font-size: 0.8125rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .tender-btn-sub {
      font-size: 0.5625rem;
      opacity: 0.85;
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

    .receipt-dialog {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      width: 380px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dialog-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .dialog-close {
      background: transparent;
      border: none;
      font-size: 1rem;
      color: var(--text-muted);
      cursor: pointer;
    }

    .thermal-receipt-paper {
      background: #FFFFFF;
      color: #111111;
      padding: 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.6875rem;
      line-height: 1.4;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .paper-center { text-align: center; }
    .paper-divider { text-align: center; margin: 0.25rem 0; opacity: 0.5; }
    .paper-between { display: flex; justify-content: space-between; }
    .paper-total-bold { font-weight: 800; font-size: 0.8125rem; margin-top: 0.25rem; }
    .store-heading { font-weight: 800; font-size: 0.75rem; }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class PosComponent {
  public posService = inject(PosService);
  public catalogService = inject(CatalogService);
  public authService = inject(AuthService);

  public barcodeQuery = '';
  public selectedCategory = signal<string>('All');
  public categories = ['All', 'Keyboards', 'Audio', 'Apparel', 'Accessories'];

  public showReceiptModal = signal<boolean>(false);
  public receiptDateNum = Math.floor(100000 + Math.random() * 900000);
  public today = new Date();

  public lastPaymentMethod = signal<'cash' | 'card' | 'upi'>('cash');
  public lastReceiptItems = signal<any[]>([]);
  public lastReceiptSubtotal = signal<number>(0);
  public lastReceiptTax = signal<number>(0);
  public lastReceiptTotal = signal<number>(0);

  public filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const query = this.catalogService.searchQuery().toLowerCase().trim();
    let prods = this.catalogService.products();

    if (cat !== 'All') {
      prods = prods.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }

    if (query) {
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.variants.some(v => v.sku.toLowerCase().includes(query))
      );
    }

    return prods;
  });

  public onBarcodeSubmit(): void {
    if (!this.barcodeQuery.trim()) return;
    const query = this.barcodeQuery.trim().toLowerCase();

    for (const prod of this.catalogService.products()) {
      for (const variant of prod.variants) {
        if (variant.barcode === query || variant.sku.toLowerCase() === query) {
          this.posService.addToCart(variant, prod.name);
          this.barcodeQuery = '';
          return;
        }
      }
    }
    this.barcodeQuery = '';
  }

  public triggerPayment(method: 'cash' | 'card' | 'upi'): void {
    this.lastPaymentMethod.set(method);
    this.lastReceiptItems.set([...this.posService.cartItems()]);
    this.lastReceiptSubtotal.set(this.posService.subtotal());
    this.lastReceiptTax.set(this.posService.taxAmount());
    this.lastReceiptTotal.set(this.posService.totalAmount());

    this.posService.processCheckout(method, this.posService.totalAmount());
    this.showReceiptModal.set(true);
  }
}
