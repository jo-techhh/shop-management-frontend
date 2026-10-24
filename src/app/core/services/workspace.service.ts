import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type ResourceKey = 'products' | 'inventory' | 'transfers' | 'orders' | 'customers' | 'outlets' | 'events';
export type DataRecord = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  load(resource: ResourceKey, outletId: string): Observable<DataRecord[]> {
    const query = '?outlet_id=' + encodeURIComponent(outletId);
    switch (resource) {
      case 'products': return this.allProducts();
      case 'inventory': return this.api.get<DataRecord[]>('/inventory/stock' + query);
      case 'transfers': return this.api.get<DataRecord[]>('/inventory/transfers' + query).pipe(map(rows => rows.map(r => ({ ...r,
        source_name: this.auth.availableOutlets().find(o => o.id === r['source_outlet_id'])?.name || r['source_outlet_id'],
        destination_name: this.auth.availableOutlets().find(o => o.id === r['destination_outlet_id'])?.name || r['destination_outlet_id']
      }))));
      case 'orders': return this.api.get<DataRecord[]>('/pos/orders' + query + '&limit=500');
      case 'customers': return this.api.get<DataRecord[]>('/pos/customers' + query);
      case 'outlets': return this.api.get<DataRecord[]>('/outlets?active_only=false');
      case 'events': return forkJoin({ inventory: this.api.get<DataRecord[]>('/inventory/events' + query), billing: this.api.get<DataRecord[]>('/pos/events' + query) }).pipe(
        map(({ inventory, billing }) => [...inventory, ...billing].sort((a,b) => Date.parse(b['created_at']) - Date.parse(a['created_at']))));
    }
  }

  // Retrieve every catalog page rather than silently dropping products after the API default limit.
  allProducts(): Observable<DataRecord[]> {
    return new Observable(subscriber => {
      let cancelled = false;
      const subscriptions: { unsubscribe(): void }[] = [];
      const records: DataRecord[] = [];
      const page = (offset: number) => {
        subscriptions.push(this.api.get<DataRecord[]>(`/catalog/products?limit=100&offset=${offset}`).subscribe({
          next: rows => { if (cancelled) return; records.push(...rows); if (rows.length === 100) page(offset + 100); else { subscriber.next(records); subscriber.complete(); } },
          error: error => subscriber.error(error)
        }));
      };
      page(0);
      return () => { cancelled = true; subscriptions.forEach(s => s.unsubscribe()); };
    });
  }
}
