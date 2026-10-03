import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PosComponent } from './features/pos/pos.component';
import { ProductsComponent } from './features/products/products.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { TransfersComponent } from './features/transfers/transfers.component';
import { OrdersComponent } from './features/orders/orders.component';
import { CustomersComponent } from './features/customers/customers.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { OutletsComponent } from './features/outlets/outlets.component';
import { EventsComponent } from './features/events/events.component';
import { SettingsComponent } from './features/settings/settings.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: DashboardComponent },
      { path: 'pos', component: PosComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'transfers', component: TransfersComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'outlets', component: OutletsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'overview' }
];
