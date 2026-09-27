import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  outlet: string;
  totalSpent: number;
  loyaltyPoints: number;
  tier: 'VIP Gold' | 'Silver' | 'Regular';
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="customers-page bg-grid-subtle">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Customer Relationship Directory</h1>
          <p class="page-subtitle">Loyalty ledger, customer tiers, and lifetime point-of-sale spending.</p>
        </div>
        <button class="btn-primary">+ Register Customer</button>
      </div>

      <!-- Filter Toolbar -->
      <div class="table-toolbar">
        <div class="search-input-box">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            class="input-field search-box"
            placeholder="Search customer name, phone, email..."
            [(ngModel)]="searchQuery"
          />
        </div>

        <div class="tier-filters">
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedTier() === 'all'"
            (click)="selectedTier.set('all')"
          >All Tiers</button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedTier() === 'VIP Gold'"
            (click)="selectedTier.set('VIP Gold')"
          >VIP Gold</button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="selectedTier() === 'Silver'"
            (click)="selectedTier.set('Silver')"
          >Silver</button>
        </div>
      </div>

      <!-- Clean Customer Table -->
      <div class="grid-card table-wrapper">
        <table class="grid-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Preferred Outlet</th>
              <th>Total Spent</th>
              <th>Loyalty Points</th>
              <th>Membership Tier</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (cust of filteredCustomers(); track cust.id) {
              <tr>
                <td><strong class="cust-name">{{ cust.name }}</strong></td>
                <td><span class="phone-text font-mono">{{ cust.phone }}</span></td>
                <td><span class="email-text">{{ cust.email }}</span></td>
                <td><span class="outlet-text font-mono">{{ cust.outlet }}</span></td>
                <td><strong class="spent-val font-mono">₹{{ cust.totalSpent | number:'1.2-2' }}</strong></td>
                <td><span class="points-pill font-mono">{{ cust.loyaltyPoints }} pts</span></td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="{
                      'badge-primary': cust.tier === 'VIP Gold',
                      'badge-neutral': cust.tier === 'Silver',
                      'badge-success': cust.tier === 'Regular'
                    }"
                  >{{ cust.tier }}</span>
                </td>
                <td style="text-align: right;">
                  <button class="btn-ghost action-btn">History</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8">
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span class="empty-state-title">No customers found</span>
                    <span class="empty-state-desc">Try clearing the search query or selecting a different tier filter.</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .customers-page {
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

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .search-input-box {
      position: relative;
      width: 320px;
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

    .tier-filters {
      display: flex;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 2px;
      gap: 2px;
    }

    .filter-pill {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 500;
    }

    .filter-pill.active {
      background: var(--bg-secondary);
      color: var(--text-main);
      font-weight: 600;
    }

    .cust-name {
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.8125rem;
    }

    .phone-text {
      font-size: 0.78125rem;
      color: var(--text-muted);
    }

    .email-text {
      font-size: 0.78125rem;
      color: var(--text-muted);
    }

    .outlet-text {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .spent-val {
      font-size: 0.8125rem;
      color: var(--text-main);
    }

    .points-pill {
      font-size: 0.72rem;
      color: var(--color-primary);
      background: var(--color-primary-subtle);
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-xs);
      border: 1px solid var(--color-primary-border);
    }

    .action-btn {
      font-size: 0.72rem;
      color: var(--color-primary);
    }
  `]
})
export class CustomersComponent {
  public searchQuery = '';
  public selectedTier = signal<'all' | 'VIP Gold' | 'Silver'>('all');

  public customers: CustomerRecord[] = [
    {
      id: 'c-1',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.s@retailops.io',
      outlet: 'Main Flagship Store',
      totalSpent: 42500.00,
      loyaltyPoints: 850,
      tier: 'VIP Gold'
    },
    {
      id: 'c-2',
      name: 'Priya Nair',
      phone: '+91 98765 12345',
      email: 'priya.nair@outlook.com',
      outlet: 'Koramangala',
      totalSpent: 18990.00,
      loyaltyPoints: 370,
      tier: 'Silver'
    },
    {
      id: 'c-3',
      name: 'Ananya Iyer',
      phone: '+91 98111 22334',
      email: 'ananya.iyer@gmail.com',
      outlet: 'Trivandrum',
      totalSpent: 28450.00,
      loyaltyPoints: 560,
      tier: 'VIP Gold'
    },
    {
      id: 'c-4',
      name: 'Vikram Menon',
      phone: '+91 99000 77889',
      email: 'vikram.m@techcorp.in',
      outlet: 'Nagercoil',
      totalSpent: 8750.00,
      loyaltyPoints: 120,
      tier: 'Regular'
    }
  ];

  public filteredCustomers = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const t = this.selectedTier();

    return this.customers.filter(c => {
      const matchQ = !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.outlet.toLowerCase().includes(q);

      const matchT = t === 'all' || c.tier === t;
      return matchQ && matchT;
    });
  });
}
