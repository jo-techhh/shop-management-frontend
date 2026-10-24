import { Component } from '@angular/core';
import { ResourcePageComponent } from '../../shared/resource-page/resource-page.component';

@Component({
  selector: 'app-orders', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './orders.component.html', styleUrl: './orders.component.css'
})
export class OrdersComponent {}
