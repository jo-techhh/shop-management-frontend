import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  price: number;
  costPrice: number;
  taxRate: number;
  stockQuantity: number;
  reservedQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  imageUrl?: string;
  price: number;
  totalStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  variants: ProductVariant[];
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private api = inject(ApiService);

  public readonly searchQuery = signal<string>('');
  public readonly selectedCategory = signal<string>('All');

  public readonly categories = signal<string[]>([
    'All',
    'Electronics',
    'Apparel',
    'Beverages',
    'Footwear',
    'Home & Living',
    'Accessories'
  ]);

  public readonly products = signal<Product[]>([
    {
      id: 'prd-001',
      name: 'Ergonomic Mechanical Keyboard',
      category: 'Electronics',
      brand: 'Keychron',
      description: 'RGB Backlit Wireless Mechanical Keyboard with Hot-swappable switches.',
      price: 6499,
      totalStock: 142,
      status: 'in_stock',
      variants: [
        { id: 'var-01', sku: 'KB-SW-BRN', barcode: '8901234567890', name: 'Brown Switch', price: 6499, costPrice: 4200, taxRate: 18, stockQuantity: 84, reservedQuantity: 5 },
        { id: 'var-02', sku: 'KB-SW-RED', barcode: '8901234567891', name: 'Red Switch', price: 6499, costPrice: 4200, taxRate: 18, stockQuantity: 58, reservedQuantity: 2 }
      ]
    },
    {
      id: 'prd-002',
      name: 'Wireless Noise Canceling Headphones',
      category: 'Electronics',
      brand: 'Sony',
      description: 'Industry-leading noise canceling with Dual Noise Sensor technology.',
      price: 18990,
      totalStock: 38,
      status: 'in_stock',
      variants: [
        { id: 'var-03', sku: 'WH-1000XM5-BLK', barcode: '8901234567892', name: 'Black', price: 18990, costPrice: 13500, taxRate: 18, stockQuantity: 24, reservedQuantity: 1 },
        { id: 'var-04', sku: 'WH-1000XM5-SLV', barcode: '8901234567893', name: 'Silver', price: 18990, costPrice: 13500, taxRate: 18, stockQuantity: 14, reservedQuantity: 0 }
      ]
    },
    {
      id: 'prd-003',
      name: 'Organic Espresso Roast Coffee Beans',
      category: 'Beverages',
      brand: 'Blue Tokai',
      description: 'Dark roast whole bean coffee with notes of dark chocolate and caramel.',
      price: 750,
      totalStock: 215,
      status: 'in_stock',
      variants: [
        { id: 'var-05', sku: 'BT-COF-500G', barcode: '8901234567894', name: '500g Bag', price: 750, costPrice: 450, taxRate: 5, stockQuantity: 215, reservedQuantity: 12 }
      ]
    },
    {
      id: 'prd-004',
      name: 'Minimalist Cotton Crewneck Tee',
      category: 'Apparel',
      brand: 'Uniqlo',
      description: '100% SUPIMA cotton t-shirt with clean single-stitched seams.',
      price: 1290,
      totalStock: 12,
      status: 'low_stock',
      variants: [
        { id: 'var-06', sku: 'TEE-WHT-M', barcode: '8901234567895', name: 'White / M', price: 1290, costPrice: 600, taxRate: 12, stockQuantity: 5, reservedQuantity: 1 },
        { id: 'var-07', sku: 'TEE-BLK-L', barcode: '8901234567896', name: 'Black / L', price: 1290, costPrice: 600, taxRate: 12, stockQuantity: 7, reservedQuantity: 0 }
      ]
    },
    {
      id: 'prd-005',
      name: 'Ultra-Lightweight Running Sneakers',
      category: 'Footwear',
      brand: 'Nike',
      description: 'Breathable mesh running shoes with high-rebound foam cushioning.',
      price: 7995,
      totalStock: 0,
      status: 'out_of_stock',
      variants: [
        { id: 'var-08', sku: 'SNK-GRY-42', barcode: '8901234567897', name: 'Grey / UK 9', price: 7995, costPrice: 5000, taxRate: 18, stockQuantity: 0, reservedQuantity: 0 }
      ]
    },
    {
      id: 'prd-006',
      name: 'Stainless Steel Insulated Water Bottle',
      category: 'Home & Living',
      brand: 'HydroFlask',
      description: 'Double-wall vacuum insulation keeps drinks cold for 24 hours.',
      price: 2490,
      totalStock: 89,
      status: 'in_stock',
      variants: [
        { id: 'var-09', sku: 'BTL-750ML-BLK', barcode: '8901234567898', name: '750ml Matte Black', price: 2490, costPrice: 1400, taxRate: 18, stockQuantity: 89, reservedQuantity: 4 }
      ]
    }
  ]);

  public readonly filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();

    return this.products().filter(p => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch = !query || 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.variants.some(v => v.sku.toLowerCase().includes(query) || v.barcode.includes(query));
      
      return matchesCategory && matchesSearch;
    });
  });

  constructor() {
    this.fetchProducts();
  }

  public fetchProducts(): void {
    this.api.get<Product[]>('/catalog/products', this.products()).subscribe({
      next: (data) => {
        if (data && data.length) this.products.set(data);
      }
    });
  }

  public addProduct(product: Partial<Product> & { barcode?: string; sku?: string }): void {
    const customSku = product.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const customBarcode = product.barcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const newProd: Product = {
      id: `prd-${Date.now()}`,
      name: product.name || 'New Retail Product',
      category: product.category || 'General',
      brand: product.brand || 'Generic',
      description: product.description || '',
      price: product.price || 0,
      totalStock: product.totalStock || 50,
      status: 'in_stock',
      variants: [
        {
          id: `var-${Date.now()}`,
          sku: customSku,
          barcode: customBarcode,
          name: 'Standard Unit',
          price: product.price || 0,
          costPrice: (product.price || 0) * 0.6,
          taxRate: 18,
          stockQuantity: product.totalStock || 50,
          reservedQuantity: 0
        }
      ]
    };

    this.products.update(list => [newProd, ...list]);
    this.api.post('/catalog/products', newProd).subscribe();
  }
}
