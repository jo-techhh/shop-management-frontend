import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceOutletId: string;
  sourceOutletName: string;
  destinationOutletId: string;
  destinationOutletName: string;
  itemsCount: number;
  totalQuantity: number;
  status: 'draft' | 'pending' | 'in_transit' | 'completed' | 'cancelled';
  createdAt: string;
  transitedAt?: string;
  completedAt?: string;
}

export interface StockItem {
  id: string;
  productName: string;
  sku: string;
  barcode: string;
  outletName: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  minThreshold: number;
  status: 'normal' | 'low' | 'critical';
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private api = inject(ApiService);

  public readonly stockItems = signal<StockItem[]>([
    { id: 'stk-01', productName: 'Ergonomic Mechanical Keyboard', sku: 'KB-SW-BRN', barcode: '8901234567890', outletName: 'Main Flagship Store', quantityOnHand: 84, reservedQuantity: 5, availableQuantity: 79, minThreshold: 15, status: 'normal' },
    { id: 'stk-02', productName: 'Ergonomic Mechanical Keyboard', sku: 'KB-SW-RED', barcode: '8901234567891', outletName: 'Koramangala Express', quantityOnHand: 58, reservedQuantity: 2, availableQuantity: 56, minThreshold: 10, status: 'normal' },
    { id: 'stk-03', productName: 'Wireless Noise Canceling Headphones', sku: 'WH-1000XM5-BLK', barcode: '8901234567892', outletName: 'Main Flagship Store', quantityOnHand: 24, reservedQuantity: 1, availableQuantity: 23, minThreshold: 8, status: 'normal' },
    { id: 'stk-04', productName: 'Minimalist Cotton Crewneck Tee', sku: 'TEE-WHT-M', barcode: '8901234567895', outletName: 'Indiranagar Boutique', quantityOnHand: 5, reservedQuantity: 1, availableQuantity: 4, minThreshold: 10, status: 'low' },
    { id: 'stk-05', productName: 'Ultra-Lightweight Running Sneakers', sku: 'SNK-GRY-42', barcode: '8901234567897', outletName: 'Mumbai Central Hub', quantityOnHand: 0, reservedQuantity: 0, availableQuantity: 0, minThreshold: 5, status: 'critical' }
  ]);

  public readonly transfers = signal<StockTransfer[]>([
    {
      id: 'trf-901',
      transferNumber: 'TRF-2026-0891',
      sourceOutletId: 'out-01',
      sourceOutletName: 'Main Flagship Store',
      destinationOutletId: 'out-02',
      destinationOutletName: 'Koramangala Express',
      itemsCount: 4,
      totalQuantity: 35,
      status: 'in_transit',
      createdAt: '2026-09-27T09:30:00Z',
      transitedAt: '2026-09-27T10:15:00Z'
    },
    {
      id: 'trf-902',
      transferNumber: 'TRF-2026-0890',
      sourceOutletId: 'out-04',
      sourceOutletName: 'Mumbai Central Hub',
      destinationOutletId: 'out-03',
      destinationOutletName: 'Indiranagar Boutique',
      itemsCount: 2,
      totalQuantity: 50,
      status: 'completed',
      createdAt: '2026-09-26T14:20:00Z',
      completedAt: '2026-09-27T08:00:00Z'
    },
    {
      id: 'trf-903',
      transferNumber: 'TRF-2026-0889',
      sourceOutletId: 'out-01',
      sourceOutletName: 'Main Flagship Store',
      destinationOutletId: 'out-03',
      destinationOutletName: 'Indiranagar Boutique',
      itemsCount: 1,
      totalQuantity: 12,
      status: 'pending',
      createdAt: '2026-09-27T11:45:00Z'
    }
  ]);

  public readonly lowStockAlertsCount = computed(() => {
    return this.stockItems().filter(item => item.status === 'low' || item.status === 'critical').length;
  });

  constructor() {
    this.fetchInventory();
  }

  public fetchInventory(): void {
    this.api.get<StockItem[]>('/inventory/stock', this.stockItems()).subscribe({
      next: (data) => {
        if (data && data.length) this.stockItems.set(data);
      }
    });
  }

  public createTransfer(transfer: Partial<StockTransfer>): void {
    const newTrf: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceOutletId: transfer.sourceOutletId || 'out-01',
      sourceOutletName: transfer.sourceOutletName || 'Main Flagship Store',
      destinationOutletId: transfer.destinationOutletId || 'out-02',
      destinationOutletName: transfer.destinationOutletName || 'Koramangala Express',
      itemsCount: transfer.itemsCount || 1,
      totalQuantity: transfer.totalQuantity || 10,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.transfers.update(list => [newTrf, ...list]);
    this.api.post('/inventory/transfers', newTrf).subscribe();
  }

  public adjustStock(stockId: string, newQuantity: number): void {
    this.stockItems.update(items =>
      items.map(item => {
        if (item.id === stockId) {
          const avail = Math.max(0, newQuantity - item.reservedQuantity);
          const status = newQuantity <= 0 ? 'critical' : newQuantity <= item.minThreshold ? 'low' : 'normal';
          return { ...item, quantityOnHand: newQuantity, availableQuantity: avail, status };
        }
        return item;
      })
    );
  }
}
