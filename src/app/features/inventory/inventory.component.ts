import { Component } from '@angular/core';
import { ResourcePageComponent } from '../../shared/resource-page/resource-page.component';

@Component({
  selector: 'app-inventory', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './inventory.component.html', styleUrl: './inventory.component.css'
})
export class InventoryComponent {}
