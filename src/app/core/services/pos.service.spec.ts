import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { PosService } from './pos.service';
import { API_BASE_URL } from '../api.config';

describe('Checkout failure and retry', () => {
  let pos: PosService;
  let http: HttpTestingController;
  const outlet = { id: 'outlet-id', name: 'Test outlet' };
  const user = { id: 'cashier-id' };
  const shift = { id: 'shift-id', outlet_id: outlet.id, opening_float: 0, expected_cash: 0, opened_at: new Date().toISOString(), status: 'OPEN' };
  const order = { id: 'order-id', invoice_number: 'INV-TEST', outlet_id: outlet.id, cashier_id: user.id, status: 'STOCK_RESERVED', total_amount: 10, subtotal: 10, tax_amount: 0, discount_amount: 0, items: [] };
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '/api/v1' },
      { provide: AuthService, useValue: { currentOutlet: signal(outlet), currentUser: signal(user), hasPermission: () => true } }
    ] });
    pos = TestBed.inject(PosService); http = TestBed.inject(HttpTestingController);
    TestBed.tick();
    http.expectOne('/api/v1/shifts/active?outlet_id=outlet-id').flush(shift);
    pos.cartItems.set([{ variant_id: 'variant-id', sku: 'TEST', title: 'Purchased item', unit_price: 10, quantity: 1 }]);
  });
  afterEach(() => { http.verify(); localStorage.clear(); });
  it('keeps the cart and displays the server error when checkout creation fails', async () => {
    const pending = pos.checkout('CASH', '');
    http.expectOne('/api/v1/pos/checkout').flush({ detail: 'Billing is unavailable' }, { status: 503, statusText: 'Unavailable' });
    await pending;
    expect(pos.cartItems()).toHaveLength(1);
    expect(pos.receipt()).toBeNull();
    expect(pos.error()).toBe('Billing is unavailable');
  });
  it('retries payment against the same saved order and clears the cart only after a confirmed receipt', async () => {
    const first = pos.checkout('CASH', '');
    http.expectOne('/api/v1/pos/checkout').flush(order);
    await Promise.resolve();
    http.expectOne('/api/v1/pos/orders/order-id/pay').flush({ detail: 'Payment could not be recorded' }, { status: 503, statusText: 'Unavailable' });
    await first;
    expect(pos.cartItems()).toHaveLength(1);
    expect(pos.pendingOrder()?.id).toBe('order-id');
    const retry = pos.checkout('CASH', '');
    http.expectNone('/api/v1/pos/checkout');
    http.expectOne('/api/v1/pos/orders/order-id/pay').flush({ ...order, status: 'COMPLETED' });
    await Promise.resolve();
    http.expectOne('/api/v1/pos/orders/order-id/receipt').flush({ ...order, status: 'COMPLETED', escpos_thermal_text: 'Actual server receipt' });
    await Promise.resolve();
    http.expectOne('/api/v1/shifts/active?outlet_id=outlet-id').flush(shift);
    await retry;
    expect(pos.cartItems()).toEqual([]);
    expect(pos.receipt()?.escpos_thermal_text).toBe('Actual server receipt');
  });
});
