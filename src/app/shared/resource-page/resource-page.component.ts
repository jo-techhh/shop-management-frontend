import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePlus, LucideSearch, LucideRefreshCw, LucideX } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { errorMessage } from '../../core/services/api.service';
import { DataRecord, ResourceKey, WorkspaceService } from '../../core/services/workspace.service';
import { DataStateComponent } from '../data-state/data-state.component';
import { Column, Field, RESOURCE_CONFIG } from './resource-config';

@Component({ selector: 'app-resource-page', standalone: true,
  imports: [CommonModule, FormsModule, DataStateComponent, LucidePlus, LucideSearch, LucideRefreshCw, LucideX],
  templateUrl: './resource-page.component.html', styleUrl: './resource-page.component.css' })
export class ResourcePageComponent {
  readonly resource = input.required<ResourceKey>();
  readonly auth = inject(AuthService);
  readonly workspace = inject(WorkspaceService);
  readonly config = computed(() => RESOURCE_CONFIG[this.resource()]);
  readonly records = signal<DataRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly query = signal('');
  readonly modal = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly mode = signal<'create' | 'category' | 'variant' | 'edit-outlet'>('create');
  readonly selected = signal<DataRecord | null>(null);
  readonly receipt = signal<string | null>(null);
  readonly categories = signal<DataRecord[]>([]);
  readonly variants = signal<DataRecord[]>([]);
  form: DataRecord = {};
  private generation = 0;
  readonly filtered = computed(() => this.records().filter(row => JSON.stringify(row).toLowerCase().includes(this.query().toLowerCase().trim())));
  readonly canCreate = computed(() => !!this.config().permission && this.auth.hasPermission(this.config().permission!));
  readonly fields = computed<Field[]>(() => this.mode() === 'category' ? [{ key: 'name', label: 'Category name', required: true }, { key: 'slug', label: 'Unique category slug', required: true }]
    : this.mode() === 'variant' ? RESOURCE_CONFIG.products.fields!.filter(f => ['sku', 'barcode', 'title', 'retail_price', 'cost_price'].includes(f.key))
    : this.mode() === 'edit-outlet' ? RESOURCE_CONFIG.outlets.fields!.filter(f => f.key !== 'code') : this.config().fields ?? []);
  readonly formTitle = computed(() => this.mode() === 'category' ? 'Add category' : this.mode() === 'variant' ? 'Add variant' : this.mode() === 'edit-outlet' ? 'Edit outlet' : this.config().action ?? 'Create');

  constructor() {
    effect(() => { this.resource(); this.auth.currentOutlet()?.id; untracked(() => { this.modal.set(false); this.receipt.set(null); this.selected.set(null); this.success.set(''); void this.load(); }); });
  }
  async load(): Promise<void> {
    const generation = ++this.generation;
    this.error.set(''); this.records.set([]); this.query.set('');
    const outlet = this.auth.currentOutlet();
    if (!outlet && this.resource() !== 'outlets') { this.loading.set(false); return; }
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.workspace.load(this.resource(), outlet?.id ?? ''));
      if (generation !== this.generation) return;
      this.records.set(this.resource() === 'products' ? data.map(p => ({ ...p, variant_count: p['variants'].length,
        starting_price: p['variants'].length ? Math.min(...p['variants'].map((v: DataRecord) => v['retail_price'])) : null })) : data);
    } catch (error) { if (generation === this.generation) this.error.set(errorMessage(error)); }
    finally { if (generation === this.generation) this.loading.set(false); }
  }
  display(row: DataRecord, column: Column): string {
    const value = column.key.split('.').reduce((obj, key) => obj?.[key], row as any);
    if (value === null || value === undefined || value === '') return '—';
    if (column.format === 'money') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    if (column.format === 'date') return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(value));
    return typeof value === 'boolean' ? value ? 'Yes' : 'No' : String(value);
  }
  options(kind: string): { value: string; label: string }[] {
    if (kind === 'outlets') return this.auth.availableOutlets().filter(o => o.id !== this.auth.currentOutlet()?.id).map(o => ({ value: o.id, label: o.name }));
    return (kind === 'categories' ? this.categories() : this.variants()).map(r => ({ value: r[kind === 'categories' ? 'id' : 'variant_id'], label: kind === 'categories' ? r['name'] : r['product_name'] + ' · ' + r['sku'] + ' (' + r['available_quantity'] + ' available)' }));
  }
  async open(mode: 'create' | 'category' | 'variant' | 'edit-outlet' = 'create', row?: DataRecord): Promise<void> {
    this.mode.set(mode); this.selected.set(row ?? null); this.form = mode === 'edit-outlet' ? { ...row } : {};
    this.formError.set(''); this.modal.set(true); this.saving.set(true);
    try {
      if (this.resource() === 'products' && mode === 'create') this.categories.set(await firstValueFrom(this.workspace.api.get<DataRecord[]>('/catalog/categories')));
      if (this.resource() === 'inventory' || this.resource() === 'transfers') this.variants.set(await firstValueFrom(this.workspace.api.get<DataRecord[]>('/inventory/stock?outlet_id=' + this.auth.currentOutlet()!.id)));
    } catch (error) { this.formError.set(errorMessage(error)); }
    finally { this.saving.set(false); }
  }
  async save(): Promise<void> {
    this.saving.set(true); this.formError.set(''); this.success.set('');
    try {
      const api = this.workspace.api; const outlet_id = this.auth.currentOutlet()?.id;
      if (this.mode() === 'category') await firstValueFrom(api.post('/catalog/categories', this.form));
      else if (this.mode() === 'edit-outlet') await firstValueFrom(api.patch('/outlets/' + this.selected()!['id'], this.form));
      else if (this.mode() === 'variant') await firstValueFrom(api.post('/catalog/products/' + this.selected()!['id'] + '/variants', { ...this.form, barcode: this.form['barcode'] || null }));
      else switch (this.resource()) {
        case 'products': {
          const { name, brand, description, category_id, initial_stock, ...variant } = this.form;
          await firstValueFrom(api.post('/catalog/products', { name, brand: brand || null, description: description || null, category_id: category_id || null,
            outlet_id, initial_stock: Number(initial_stock || 0), variants: [{ ...variant, barcode: variant['barcode'] || null }] })); break;
        }
        case 'inventory': await firstValueFrom(api.post('/inventory/adjust', { ...this.form, outlet_id })); break;
        case 'transfers': await firstValueFrom(api.post('/inventory/transfers', { ...this.form, source_outlet_id: outlet_id })); break;
        case 'outlets': await firstValueFrom(api.post('/outlets', this.form)); break;
      }
      this.modal.set(false); this.success.set('Saved successfully.');
      if (this.resource() === 'outlets') await this.auth.loadOutlets();
      await this.load();
    } catch (error) { this.formError.set(errorMessage(error)); }
    finally { this.saving.set(false); }
  }
  async viewReceipt(row: DataRecord): Promise<void> {
    this.error.set('');
    try { const receipt = await firstValueFrom(this.workspace.api.get<DataRecord>('/pos/orders/' + row['id'] + '/receipt')); this.receipt.set(receipt['escpos_thermal_text']); }
    catch (error) { this.error.set(errorMessage(error)); }
  }
  selectOutlet(row: DataRecord): void {
    const outlet = this.auth.availableOutlets().find(o => o.id === row['id']);
    if (outlet) this.auth.setOutlet(outlet);
  }
}
