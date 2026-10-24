import { Component } from '@angular/core';
import { ResourcePageComponent } from '../../shared/resource-page/resource-page.component';

@Component({
  selector: 'app-transfers', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './transfers.component.html', styleUrl: './transfers.component.css'
})
export class TransfersComponent {}
