import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, errorMessage } from './api.service';
import { AuthService } from './auth.service';
import { CartItem, OrderDto, ReceiptDto, ShiftDto } from './pos-models';
import { DataRecord } from './workspace.service';

@Injectable({ providedIn: 'root' })
export class PosService {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly cartItems = signal<CartItem[]>([]);
  readonly activeShift = signal<ShiftDto | null>(null);
  readonly shiftLoading = signal(false);
  readonly shiftError = signal('');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly progress = signal('');
  readonly pendingOrder = signal<OrderDto | null>(null);
  readonly receipt = signal<ReceiptDto | null>(null);
  readonly customerName = signal('');
  readonly customerPhone = signal('');
  readonly discountAmount = signal(0);
  readonly taxAmount = signal(0);
  readonly subtotal = computed(() => this.cartItems().reduce((sum,item) => sum + item.quantity * item.unit_price, 0));
  readonly totalAmount = computed(() => Math.round((this.subtotal() - this.discountAmount() + this.taxAmount()) * 100) / 100);
  private scope = '';
  private generation = 0;
  private checkoutKey: string | null = null;
  private checkoutPayload: DataRecord | null = null;

  constructor() {
    effect(() => {
      const outlet = this.auth.currentOutlet(); const user = this.auth.currentUser();
      const scope = outlet && user ? user.id + ':' + outlet.id : '';
      if (scope === this.scope) return;
      this.scope = scope; this.generation++; this.cartItems.set([]); this.activeShift.set(null); this.pendingOrder.set(null); this.receipt.set(null);
      this.discountAmount.set(0); this.taxAmount.set(0); this.customerName.set(''); this.customerPhone.set(''); this.error.set(''); this.checkoutKey = null; this.checkoutPayload = null; this.busy.set(false); this.progress.set('');
      if (scope) { this.restorePending(); void this.loadShift(); }
    });
  }
  private storageKey(): string { return 'pos-pending:' + this.scope; }
  private restorePending(): void {
    if (!this.browser) return;
    const saved = localStorage.getItem(this.storageKey());
    if (!saved) return;
    try { const pending = JSON.parse(saved); this.checkoutKey = pending.key; this.pendingOrder.set(pending.order ?? null); this.cartItems.set(pending.items ?? []); this.checkoutPayload = pending.request ?? null;
      if (this.checkoutPayload) { this.discountAmount.set(this.checkoutPayload['discount_amount']); this.taxAmount.set(this.checkoutPayload['tax_amount']); this.customerName.set(this.checkoutPayload['customer_name'] ?? ''); this.customerPhone.set(this.checkoutPayload['customer_phone'] ?? ''); } }
    catch { this.error.set('The saved checkout could not be read. Review Orders before starting another sale.'); }
  }
  private savePending(): void {
    if (this.browser) localStorage.setItem(this.storageKey(), JSON.stringify({ key: this.checkoutKey, order: this.pendingOrder(), items: this.cartItems(), request: this.checkoutPayload }));
  }
  async loadShift(): Promise<void> {
    const outlet = this.auth.currentOutlet(); if (!outlet) return;
    const scope = this.scope; this.shiftLoading.set(true); this.shiftError.set('');
    try { const shift = await firstValueFrom(this.api.get<ShiftDto>('/shifts/active?outlet_id=' + outlet.id)); if (scope === this.scope) this.activeShift.set(shift); }
    catch (error) { if (scope === this.scope) { this.activeShift.set(null); if (!(error instanceof HttpErrorResponse && error.status === 404)) this.shiftError.set(errorMessage(error)); } }
    finally { if (scope === this.scope) this.shiftLoading.set(false); }
  }
  async openShift(opening_float: number): Promise<void> {
    if (!this.auth.currentOutlet()) return;
    this.shiftLoading.set(true); this.shiftError.set('');
    try { const shift = await firstValueFrom(this.api.post<ShiftDto>('/shifts/open', { outlet_id: this.auth.currentOutlet()!.id, opening_float })); this.activeShift.set(shift); }
    catch (error) { this.shiftError.set(errorMessage(error)); }
    finally { this.shiftLoading.set(false); }
  }
  async closeShift(closing_cash: number): Promise<void> {
    if (!this.activeShift() || this.pendingOrder() || this.checkoutKey) return;
    this.shiftLoading.set(true); this.shiftError.set('');
    try { await firstValueFrom(this.api.post('/shifts/' + this.activeShift()!.id + '/close', { closing_cash })); this.activeShift.set(null); }
    catch (error) { this.shiftError.set(errorMessage(error)); }
    finally { this.shiftLoading.set(false); }
  }
  addToCart(stock: DataRecord): void {
    if (this.busy() || this.checkoutKey) return;
    const items = this.cartItems(); const existing = items.find(i => i.variant_id === stock['variant_id']);
    if ((existing?.quantity ?? 0) >= stock['available_quantity']) { this.error.set('No more stock is available for this item.'); return; }
    this.error.set('');
    this.cartItems.set(existing ? items.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i)
      : [...items, { variant_id: stock['variant_id'], sku: stock['sku'], title: stock['product_name'] + ' · ' + stock['title'], unit_price: stock['retail_price'], quantity: 1 }]);
  }
  updateQuantity(id: string, quantity: number): void {
    if (this.busy() || this.checkoutKey) return;
    this.cartItems.update(items => items.map(i => i.variant_id === id ? { ...i, quantity } : i).filter(i => i.quantity > 0));
  }
  clearCart(): void {
    if (this.busy() || this.checkoutKey) return;
    this.cartItems.set([]); this.discountAmount.set(0); this.taxAmount.set(0); this.error.set('');
  }
  async cancelPending(): Promise<void> {
    const order = this.pendingOrder(); if (!order || this.busy()) return;
    this.busy.set(true); this.error.set('');
    try {
      const current = await firstValueFrom(this.api.post<OrderDto>('/pos/orders/' + order.id + '/cancel', {}));
      this.pendingOrder.set(current); this.savePending();
      if (['CANCELLED', 'STOCK_FAILED'].includes(current.status)) {
        if (this.browser) localStorage.removeItem(this.storageKey());
        this.checkoutKey = null; this.checkoutPayload = null; this.pendingOrder.set(null);
      } else this.error.set('Cancellation has been requested. Retry cancellation once stock release completes.');
    } catch (error) { this.error.set(errorMessage(error)); }
    finally { this.busy.set(false); }
  }
  isLocked(): boolean { return !!this.checkoutKey || this.busy(); }

  async checkout(paymentMode: string, transactionRef: string): Promise<void> {
    const generation = this.generation;
    const outlet = this.auth.currentOutlet(), user = this.auth.currentUser();
    if (!outlet || !user || !this.activeShift() || this.busy()) return;
    this.error.set(''); this.receipt.set(null); this.busy.set(true);
    try {
      if (paymentMode !== 'CASH' && !transactionRef.trim()) throw new Error('Enter the reference from the completed card or UPI transaction.');
      if (this.discountAmount() < 0 || this.taxAmount() < 0 || this.totalAmount() <= 0) throw new Error('Review the discount, tax, and order total.');
      if (!this.cartItems().length) throw new Error('Add at least one product.');
      if (!this.checkoutKey) this.checkoutKey = crypto.randomUUID();
      this.savePending();
      let order = this.pendingOrder();
      if (!order) {
        this.progress.set('Creating your order…');
        this.checkoutPayload ??= {
          outlet_id: outlet.id, cashier_id: user.id, shift_id: this.activeShift()!.id, items: this.cartItems(),
          customer_name: this.customerName().trim() || null, customer_phone: this.customerPhone().trim() || null,
          discount_amount: this.discountAmount(), tax_amount: this.taxAmount()
        };
        this.savePending();
        order = await firstValueFrom(this.api.postIdempotent<OrderDto>('/pos/checkout', this.checkoutPayload, this.checkoutKey));
        if (generation !== this.generation) return;
        this.pendingOrder.set(order); this.savePending();
      }
      this.progress.set('Waiting for inventory reservation…');
      for (let attempt = 0; order.status === 'PENDING' && attempt < 30; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (generation !== this.generation) return;
        order = await firstValueFrom(this.api.get<OrderDto>('/pos/orders/' + order.id));
        if (generation !== this.generation) return;
        this.pendingOrder.set(order); this.savePending();
      }
      if (order.status === 'PENDING') throw new Error('Stock reservation is still pending. Your order is saved. Retry to resume this checkout; it will not create another order.');
      if (!['STOCK_RESERVED', 'COMPLETED'].includes(order.status)) throw new Error('Order ' + order.invoice_number + ' is ' + order.status + '. Check its status in Orders.');
      if (order.status === 'STOCK_RESERVED') {
        this.progress.set('Recording payment…');
        order = await firstValueFrom(this.api.post<OrderDto>('/pos/orders/' + order.id + '/pay', { payment_mode: paymentMode, amount: order.total_amount, transaction_ref: transactionRef.trim() || null }));
        if (generation !== this.generation) return;
        this.pendingOrder.set(order); this.savePending();
      }
      if (order.status !== 'COMPLETED') throw new Error('Payment has not completed. Current status: ' + order.status);
      this.progress.set('Fetching receipt…');
      const receipt = await firstValueFrom(this.api.get<ReceiptDto>('/pos/orders/' + order.id + '/receipt'));
      if (generation !== this.generation) return;
      this.receipt.set(receipt);
      if (this.browser) localStorage.removeItem(this.storageKey());
      this.checkoutKey = null; this.checkoutPayload = null; this.pendingOrder.set(null); this.cartItems.set([]);
      this.discountAmount.set(0); this.taxAmount.set(0); this.customerName.set(''); this.customerPhone.set('');
      await this.loadShift();
    } catch (error) { if (generation === this.generation) {
      this.error.set(errorMessage(error));
      if (!this.pendingOrder() && error instanceof HttpErrorResponse && [400,401,403,404,422].includes(error.status)) {
        if (this.browser) localStorage.removeItem(this.storageKey()); this.checkoutKey = null; this.checkoutPayload = null;
      }
    } }
    finally { if (generation === this.generation) { this.busy.set(false); this.progress.set(''); } }
  }
}
