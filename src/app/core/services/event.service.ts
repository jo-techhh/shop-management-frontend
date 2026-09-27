import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface AuditEvent {
  id: string;
  eventType: string;
  stream: string;
  service: string;
  summary: string;
  correlationId: string;
  timestamp: string;
  status: 'success' | 'processing' | 'warning' | 'error';
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private api = inject(ApiService);

  public readonly events = signal<AuditEvent[]>([
    {
      id: 'evt-1008',
      eventType: 'ORDER_CHECKOUT_COMPLETED',
      stream: 'stream:orders',
      service: 'billing_service',
      summary: 'Order ORD-2026-849201 checkout saga executed cleanly ($18,990.00)',
      correlationId: 'req-1727420100-a89b',
      timestamp: '2026-09-27T12:30:15Z',
      status: 'success',
      details: { itemsCount: 1, paymentMethod: 'card', outletId: 'out-01' }
    },
    {
      id: 'evt-1007',
      eventType: 'STOCK_RESERVATION_CONFIRMED',
      stream: 'stream:inventory',
      service: 'inventory_service',
      summary: 'Reserved 1 unit SKU KB-SW-BRN for checkout reservation saga',
      correlationId: 'req-1727420100-a89b',
      timestamp: '2026-09-27T12:30:14Z',
      status: 'success',
      details: { sku: 'KB-SW-BRN', reservedQty: 1, remainingAvail: 79 }
    },
    {
      id: 'evt-1006',
      eventType: 'STOCK_TRANSFER_DISPATCHED',
      stream: 'stream:inventory',
      service: 'inventory_service',
      summary: 'Transfer TRF-2026-0891 dispatched from Main Flagship to Koramangala',
      correlationId: 'req-1727418900-f7c2',
      timestamp: '2026-09-27T10:15:00Z',
      status: 'processing',
      details: { itemsCount: 4, totalQty: 35 }
    },
    {
      id: 'evt-1005',
      eventType: 'LOW_STOCK_THRESHOLD_TRIGGERED',
      stream: 'stream:inventory',
      service: 'inventory_service',
      summary: 'SKU TEE-WHT-M dropped below min threshold (5 remaining)',
      correlationId: 'req-1727415000-d31e',
      timestamp: '2026-09-27T09:10:00Z',
      status: 'warning',
      details: { sku: 'TEE-WHT-M', threshold: 10 }
    },
    {
      id: 'evt-1004',
      eventType: 'SHIFT_REGISTER_OPENED',
      stream: 'stream:orders',
      service: 'billing_service',
      summary: 'Cashier Jobi opened shift SHF-0927-01 on Terminal 01 (Float ₹5,000)',
      correlationId: 'req-1727410800-b99a',
      timestamp: '2026-09-27T08:00:00Z',
      status: 'success',
      details: { float: 5000, registerId: 'reg-01' }
    }
  ]);

  public logEvent(event: Partial<AuditEvent>): void {
    const newEvt: AuditEvent = {
      id: `evt-${Date.now()}`,
      eventType: event.eventType || 'SYSTEM_LOG',
      stream: event.stream || 'stream:system',
      service: event.service || 'frontend',
      summary: event.summary || 'Action recorded',
      correlationId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: event.status || 'success',
      details: event.details
    };

    this.events.update(list => [newEvt, ...list]);
  }
}
