import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'store_admin' | 'cashier';
  outletId: string;
  avatarUrl?: string;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  city: string;
  status: 'active' | 'maintenance' | 'operational';
  todaySales: string;
  stockCount: number;
  openRegisters: number;
  lowStockCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);

  public readonly currentUser = signal<User>({
    id: 'usr-101',
    username: 'jobi',
    email: 'jobi@retailops.io',
    fullName: 'Jobi',
    role: 'store_admin',
    outletId: 'out-01',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jobi'
  });

  public readonly availableOutlets = signal<Outlet[]>([
    {
      id: 'out-01',
      name: 'Main Flagship Store',
      code: 'MFS-BLR',
      city: 'Bengaluru',
      status: 'active',
      todaySales: '₹82,400',
      stockCount: 5420,
      openRegisters: 2,
      lowStockCount: 2
    },
    {
      id: 'out-02',
      name: 'Koramangala',
      code: 'KOR-BLR',
      city: 'Bengaluru',
      status: 'active',
      todaySales: '₹34,120',
      stockCount: 2890,
      openRegisters: 1,
      lowStockCount: 1
    },
    {
      id: 'out-03',
      name: 'Trivandrum',
      code: 'TRV-KER',
      city: 'Kerala',
      status: 'active',
      todaySales: '₹28,900',
      stockCount: 2150,
      openRegisters: 1,
      lowStockCount: 0
    },
    {
      id: 'out-04',
      name: 'Nagercoil',
      code: 'NC-TN',
      city: 'Tamil Nadu',
      status: 'active',
      todaySales: '₹19,450',
      stockCount: 1382,
      openRegisters: 1,
      lowStockCount: 0
    },
    {
      id: 'out-05',
      name: 'Warehouses',
      code: 'WH-HUB',
      city: 'Central Hub',
      status: 'operational',
      todaySales: '₹0 (Logistics)',
      stockCount: 18400,
      openRegisters: 0,
      lowStockCount: 3
    }
  ]);

  public readonly currentOutlet = signal<Outlet>(this.availableOutlets()[0]);

  public readonly isAuthenticated = computed(() => !this.currentUser());

  constructor() {
    this.checkCurrentUser();
  }

  public checkCurrentUser(): void {
    this.api.get<User>('/auth/me', this.currentUser()).subscribe({
      next: (user) => {
        if (user) this.currentUser.set(user);
      }
    });
  }

  public setOutlet(outlet: Outlet): void {
    this.currentOutlet.set(outlet);
  }

  public logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
}
