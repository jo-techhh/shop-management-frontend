import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { ProductVariant } from './catalog.service';

export interface CartItem {
  variantId: string;
  sku: string;
  barcode: string;
  name: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
  discount: number;
  total: number;
}

export interface CashierShift {
  id: string;
  shiftNumber: string;
  cashierName: string;
  registerId: string;
  registerName: string;
  openedAt: string;
  openingFloat: number;
  currentCashBalance: number;
  status: 'open' | 'closed';
}

export interface ReceiptData {
  orderNumber: string;
  timestamp: string;
  cashierName: string;
  registerName: string;
  outletName: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  amountTendered: number;
  changeGiven: number;
}

@Injectable({
  providedIn: 'root'
})
export class PosService {
  private api = inject(ApiService);

  public readonly activeShift = signal<CashierShift>({
    id: 'shf-101',
    shiftNumber: 'SHF-0927-01',
    cashierName: 'Jobi',
    registerId: 'reg-01',
    registerName: 'Terminal 01 (Front Register)',
    openedAt: '2026-09-27T08:00:00Z',
    openingFloat: 5000,
    currentCashBalance: 18450,
    status: 'open'
  });

  public readonly cartItems = signal<CartItem[]>([]);
  public readonly activeDiscountPercent = signal<number>(0);

  public readonly subtotal = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  });

  public readonly taxAmount = computed(() => {
    return this.cartItems().reduce((acc, item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      return acc + (itemSubtotal * (item.taxRate / 100));
    }, 0);
  });

  public readonly discountAmount = computed(() => {
    const totalBeforeDisc = this.subtotal() + this.taxAmount();
    return totalBeforeDisc * (this.activeDiscountPercent() / 100);
  });

  public readonly totalAmount = computed(() => {
    return Math.max(0, this.subtotal() + this.taxAmount() - this.discountAmount());
  });

  public readonly totalItemsCount = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + item.quantity, 0);
  });

  public readonly activeReceipt = signal<ReceiptData | null>(null);

  public addToCart(variant: ProductVariant, itemTitle: string): void {
    const existingIndex = this.cartItems().findIndex(item => item.variantId === variant.id);

    if (existingIndex > -1) {
      this.cartItems.update(items => {
        const updated = [...items];
        const item = updated[existingIndex];
        const newQty = item.quantity + 1;
        const itemSubtotal = item.unitPrice * newQty;
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          total: itemSubtotal
        };
        return updated;
      });
    } else {
      const newItem: CartItem = {
        variantId: variant.id,
        sku: variant.sku,
        barcode: variant.barcode,
        name: `${itemTitle} - ${variant.name}`,
        unitPrice: variant.price,
        quantity: 1,
        taxRate: variant.taxRate || 18,
        discount: 0,
        total: variant.price
      };
      this.cartItems.update(items => [...items, newItem]);
    }
  }

  public updateQuantity(variantId: string, delta: number): void {
    this.cartItems.update(items => {
      return items.map(item => {
        if (item.variantId === variantId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            total: item.unitPrice * newQty
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  }

  public removeFromCart(variantId: string): void {
    this.cartItems.update(items => items.filter(i => i.variantId !== variantId));
  }

  public clearCart(): void {
    this.cartItems.set([]);
    this.activeDiscountPercent.set(0);
  }

  public processCheckout(paymentMethod: 'cash' | 'card' | 'upi', amountTendered: number): ReceiptData {
    const receipt: ReceiptData = {
      orderNumber: `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      cashierName: this.activeShift().cashierName,
      registerName: this.activeShift().registerName,
      outletName: 'Main Flagship Store',
      items: [...this.cartItems()],
      subtotal: this.subtotal(),
      taxAmount: this.taxAmount(),
      discountAmount: this.discountAmount(),
      totalAmount: this.totalAmount(),
      paymentMethod,
      amountTendered,
      changeGiven: Math.max(0, amountTendered - this.totalAmount())
    };

    // Update active shift cash balance if payment was cash
    if (paymentMethod === 'cash') {
      this.activeShift.update(shift => ({
        ...shift,
        currentCashBalance: shift.currentCashBalance + receipt.totalAmount
      }));
    }

    this.activeReceipt.set(receipt);
    this.api.post('/pos/checkout', receipt).subscribe();

    this.clearCart();
    return receipt;
  }
}
