import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePackage, LucidePlus, LucideMinus, LucideX, LucidePrinter, LucideSearch } from '@lucide/angular';
import { PosService } from '../../core/services/pos.service';
import { InventoryService } from '../../core/services/inventory.service';
import { DataStateComponent } from '../../shared/data-state/data-state.component';

@Component({ selector: 'app-pos', standalone: true, imports: [CommonModule, FormsModule, DataStateComponent, LucidePackage, LucidePlus, LucideMinus, LucideX, LucidePrinter, LucideSearch],
  templateUrl: './pos.component.html', styleUrl: './pos.component.css' })
export class PosComponent {
  readonly pos = inject(PosService);
  readonly inventory = inject(InventoryService);
  readonly query = signal('');
  readonly products = computed(() => this.inventory.stockItems().filter(p => [p['product_name'], p['sku'], p['barcode']].some(v => String(v ?? '').toLowerCase().includes(this.query().toLowerCase().trim()))));
  openingFloat = 0; closingCash: number | null = null;
  paymentMode = 'CASH'; transactionRef = '';
  onBarcode(): void {
    const product = this.inventory.stockItems().find(p => p['barcode'] === this.query() || p['sku'] === this.query());
    if (product) { this.pos.addToCart(product); this.query.set(''); }
    else this.pos.error.set('No product matches this barcode or SKU.');
  }
  printReceipt(): void { window.print(); }
}
