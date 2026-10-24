import { Component } from '@angular/core';
import { ResourcePageComponent } from '../../shared/resource-page/resource-page.component';

@Component({
  selector: 'app-products', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './products.component.html', styleUrl: './products.component.css'
})
export class ProductsComponent {}
