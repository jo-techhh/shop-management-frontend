import { LucideActivity, LucideArrowLeftRight, LucideArrowRight, LucideCalculator, LucideChartNoAxesCombined, LucideChevronDown, LucideHouse, LucideMenu, LucidePackage, LucideReceiptText, LucideSettings, LucideStore, LucideUsers, LucideWarehouse } from '@lucide/angular';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideActivity, LucideArrowLeftRight, LucideArrowRight, LucideCalculator, LucideChartNoAxesCombined, LucideChevronDown, LucideHouse, LucideMenu, LucidePackage, LucideReceiptText, LucideSettings, LucideStore, LucideUsers, LucideWarehouse],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  public inventoryService = inject(InventoryService);
  public readonly mobileLinks = [
    { path: '/overview', label: 'Overview' }, { path: '/pos', label: 'Point of sale' },
    { path: '/orders', label: 'Orders' }, { path: '/products', label: 'Products' },
    { path: '/inventory', label: 'Inventory' }, { path: '/transfers', label: 'Transfers' },
    { path: '/customers', label: 'Customers' }, { path: '/outlets', label: 'Outlets' },
    { path: '/analytics', label: 'Analytics' }, { path: '/events', label: 'Activity log' },
    { path: '/settings', label: 'Settings' }
  ];
}
