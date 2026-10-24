import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LucidePlus, LucideArrowRight } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { ApiService, errorMessage } from '../../core/services/api.service';
import { InventoryService } from '../../core/services/inventory.service';
import { DataRecord, WorkspaceService } from '../../core/services/workspace.service';
import { DataStateComponent } from '../../shared/data-state/data-state.component';

@Component({ selector: 'app-dashboard', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DataStateComponent, LucidePlus, LucideArrowRight],
  templateUrl: './dashboard.component.html', styleUrl: './dashboard.component.css' })
export class DashboardComponent {
  readonly detailed = input(false);
  readonly auth = inject(AuthService);
  readonly api = inject(ApiService);
  readonly inventory = inject(InventoryService);
  readonly workspace = inject(WorkspaceService);
  readonly days = signal(7);
  readonly report = signal<DataRecord | null>(null);
  readonly orders = signal<DataRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly chartMax = computed(() => Math.max(1, ...(this.report()?.['daily_sales'] ?? []).map((d: DataRecord) => d['revenue'])));
  readonly alerts = computed(() => this.inventory.stockItems().filter(r => r['status'] !== 'normal'));
  private generation = 0;
  constructor() {
    effect(() => { this.auth.currentOutlet()?.id; this.days(); untracked(() => void this.load()); });
  }
  async load(): Promise<void> {
    const generation = ++this.generation; const outlet = this.auth.currentOutlet();
    this.report.set(null); this.orders.set([]); this.error.set('');
    if (!outlet) { this.loading.set(false); return; }
    this.loading.set(true);
    try {
      const [report, orders] = await Promise.all([
        firstValueFrom(this.api.get<DataRecord>('/pos/reports?outlet_id=' + outlet.id + '&days=' + this.days())),
        firstValueFrom(this.workspace.load('orders', outlet.id))
      ]);
      if (generation === this.generation) { this.report.set(report); this.orders.set(orders.slice(0,5)); }
    } catch (error) { if (generation === this.generation) this.error.set(errorMessage(error)); }
    finally { if (generation === this.generation) this.loading.set(false); }
  }
}
