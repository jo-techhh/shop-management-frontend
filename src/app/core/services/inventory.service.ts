import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ApiService, errorMessage } from './api.service';
import { AuthService } from './auth.service';
import { DataRecord } from './workspace.service';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly stockItems = signal<DataRecord[]>([]);
  readonly error = signal('');
  readonly loading = signal(false);
  private readonly refreshCount = signal(0);
  refresh(): void { this.refreshCount.update(value => value + 1); }
  readonly lowStockAlertsCount = computed(() => this.stockItems().filter(item => item['status'] !== 'normal').length);
  constructor() {
    effect(onCleanup => {
      const outlet = this.auth.currentOutlet(); this.api.revision(); this.refreshCount();
      this.stockItems.set([]); this.error.set('');
      if (!outlet) { this.loading.set(false); return; }
      this.loading.set(true);
      const request = this.api.get<DataRecord[]>('/inventory/stock?outlet_id=' + outlet.id).subscribe({
        next: rows => { this.stockItems.set(rows); this.loading.set(false); },
        error: error => { this.error.set(errorMessage(error)); this.loading.set(false); }
      });
      onCleanup(() => request.unsubscribe());
    });
  }
}
