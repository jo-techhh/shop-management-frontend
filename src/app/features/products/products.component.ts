import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService, Product } from '../../core/services/catalog.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products-page bg-grid-subtle">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Product Catalog & SKUs</h1>
          <p class="page-subtitle">Central merchandise directory, variants, retail pricing, and SKU classifications.</p>
        </div>
        <div class="header-right">
          <div class="view-toggle">
            <button
              type="button"
              [class.active]="viewMode() === 'table'"
              (click)="viewMode.set('table')"
              title="Table view"
            >Table</button>
            <button
              type="button"
              [class.active]="viewMode() === 'cards'"
              (click)="viewMode.set('cards')"
              title="Cards view"
            >Cards</button>
          </div>
          <button class="btn-primary" (click)="showAddModal.set(true)">+ Add Product</button>
        </div>
      </div>

      <!-- Filter Strip -->
      <div class="filter-strip">
        <div class="search-input-box">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            class="input-field search-box"
            placeholder="Search product, brand, category, SKU..."
            [(ngModel)]="searchQuery"
          />
        </div>

        <div class="category-pills">
          @for (cat of categories; track cat) {
            <button
              type="button"
              class="cat-pill"
              [class.active]="selectedCat() === cat"
              (click)="selectedCat.set(cat)"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>

      <!-- 13. Clean Table View -->
      @if (viewMode() === 'table') {
        <div class="grid-card table-wrapper">
          <table class="grid-table">
            <thead>
              <tr>
                <th>Primary SKU</th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Retail Price</th>
                <th>Total Stock</th>
                <th>Variants</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (prod of filteredProducts(); track prod.id) {
                <tr>
                  <td>
                    <code class="sku-chip font-mono">
                      {{ prod.variants.length > 0 ? prod.variants[0].sku : 'SKU-GEN' }}
                    </code>
                  </td>
                  <td>
                    <div class="prod-cell">
                      <span class="prod-name">{{ prod.name }}</span>
                      <span class="prod-desc-sub">{{ prod.description }}</span>
                    </div>
                  </td>
                  <td><span class="prod-brand">{{ prod.brand }}</span></td>
                  <td><span class="badge badge-neutral font-mono">{{ prod.category }}</span></td>
                  <td><strong class="price-val font-mono">₹{{ prod.price | number:'1.2-2' }}</strong></td>
                  <td>
                    <span class="stock-val font-mono" [class.stock-warn]="prod.totalStock <= 10">
                      {{ prod.totalStock }} pcs
                    </span>
                  </td>
                  <td>
                    <span class="variants-badge font-mono">{{ prod.variants.length }} options</span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn-ghost action-btn">Edit</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8">
                    <div class="empty-state">
                      <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span class="empty-state-title">No products match search criteria</span>
                      <span class="empty-state-desc">Try clearing your search query or selecting a different category.</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <!-- Minimal Grid Cards View -->
        <div class="cards-grid">
          @for (prod of filteredProducts(); track prod.id) {
            <div class="grid-card product-card">
              <div class="card-top">
                <span class="badge badge-neutral font-mono">{{ prod.category }}</span>
                <span class="sku-chip font-mono">{{ prod.variants[0]?.sku || 'SKU-00' }}</span>
              </div>

              <div class="card-product-name">{{ prod.name }}</div>
              <p class="card-brand">{{ prod.brand }}</p>
              <p class="card-desc">{{ prod.description }}</p>

              <div class="card-bottom">
                <div>
                  <span class="price-lbl">RETAIL PRICE</span>
                  <div class="card-price font-mono">₹{{ prod.price | number:'1.2-2' }}</div>
                </div>
                <div style="text-align: right;">
                  <span class="price-lbl">TOTAL STOCK</span>
                  <div class="card-stock font-mono">{{ prod.totalStock }} pcs</div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Add Product Modal -->
      @if (showAddModal()) {
        <div class="modal-backdrop" (click)="showAddModal.set(false)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <span class="modal-title">Add New Catalog Product</span>
              <button class="close-btn" (click)="showAddModal.set(false)">✕</button>
            </div>
            <form (ngSubmit)="submitNewProduct()">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label">Product Title</label>
                  <input type="text" class="input-field" [(ngModel)]="newProdName" name="name" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Brand</label>
                  <input type="text" class="input-field" [(ngModel)]="newProdBrand" name="brand" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select class="input-field" [(ngModel)]="newProdCat" name="category">
                    <option value="Electronics">Electronics</option>
                    <option value="Keyboards">Keyboards</option>
                    <option value="Audio">Audio</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Price (₹ INR)</label>
                  <input type="number" class="input-field" [(ngModel)]="newProdPrice" name="price" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Initial Stock Count</label>
                  <input type="number" class="input-field" [(ngModel)]="newProdStock" name="stock" required />
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="showAddModal.set(false)">Cancel</button>
                <button type="submit" class="btn-primary">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .products-page {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-height: calc(100vh - 56px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.15rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .view-toggle {
      display: flex;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 2px;
      gap: 2px;
    }

    .view-toggle button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 500;
    }

    .view-toggle button.active {
      background: var(--bg-secondary);
      color: var(--text-main);
      font-weight: 600;
    }

    .filter-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .search-input-box {
      position: relative;
      width: 340px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-box {
      padding-left: 2.25rem;
    }

    .category-pills {
      display: flex;
      gap: 0.35rem;
    }

    .cat-pill {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 500;
    }

    .cat-pill.active {
      border-color: var(--color-primary);
      color: var(--color-primary);
      font-weight: 600;
      background-color: var(--color-primary-subtle);
    }

    .prod-cell {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .prod-name {
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.8125rem;
    }

    .prod-desc-sub {
      font-size: 0.6875rem;
      color: var(--text-dim);
    }

    .prod-brand {
      font-size: 0.78125rem;
      color: var(--text-muted);
    }

    .sku-chip {
      font-size: 0.75rem;
      background-color: var(--bg-secondary);
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-xs);
      color: var(--text-main);
    }

    .price-val {
      font-size: 0.875rem;
      color: var(--text-main);
    }

    .stock-val {
      font-size: 0.8125rem;
      color: var(--text-main);
    }

    .stock-warn {
      color: var(--color-warning);
    }

    .variants-badge {
      font-size: 0.72rem;
      color: var(--text-dim);
    }

    .action-btn {
      font-size: 0.72rem;
      color: var(--color-primary);
    }

    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }

    .product-card {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-product-name {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-main);
      margin-top: 0.2rem;
    }

    .card-brand {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .card-desc {
      font-size: 0.75rem;
      color: var(--text-dim);
      margin: 0.35rem 0;
      line-height: 1.35;
    }

    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.65rem;
      border-top: 1px solid var(--border-subtle);
    }

    .price-lbl {
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    .card-price {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .card-stock {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .modal-box {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      width: 460px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 1rem;
      color: var(--text-muted);
      cursor: pointer;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .full-width {
      grid-column: span 2;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
  `]
})
export class ProductsComponent {
  public catalogService = inject(CatalogService);

  public viewMode = signal<'table' | 'cards'>('table');
  public showAddModal = signal<boolean>(false);
  public searchQuery = '';
  public selectedCat = signal<string>('All');
  public categories = ['All', 'Electronics', 'Keyboards', 'Audio', 'Apparel', 'Accessories'];

  public newProdName = '';
  public newProdBrand = '';
  public newProdCat = 'Electronics';
  public newProdPrice = 1000;
  public newProdStock = 25;

  public filteredProducts = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const cat = this.selectedCat();
    let prods = this.catalogService.products();

    if (cat !== 'All') {
      prods = prods.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }

    if (q) {
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.variants.some(v => v.sku.toLowerCase().includes(q))
      );
    }

    return prods;
  });

  public submitNewProduct(): void {
    this.catalogService.addProduct({
      name: this.newProdName,
      brand: this.newProdBrand,
      category: this.newProdCat,
      price: this.newProdPrice,
      totalStock: this.newProdStock
    });
    this.showAddModal.set(false);
    this.newProdName = '';
    this.newProdBrand = '';
  }
}
