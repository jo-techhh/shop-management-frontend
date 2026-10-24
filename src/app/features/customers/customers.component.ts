import { Component } from '@angular/core';
import { ResourcePageComponent } from '../../shared/resource-page/resource-page.component';

@Component({
  selector: 'app-customers', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './customers.component.html', styleUrl: './customers.component.css'
})
export class CustomersComponent {}
