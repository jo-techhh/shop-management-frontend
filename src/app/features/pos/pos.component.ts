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
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css'
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
