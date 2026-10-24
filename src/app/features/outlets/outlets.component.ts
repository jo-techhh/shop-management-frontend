import { Component } from '@angular/core';
import { ResourcePageComponent } from '../../shared/resource-page/resource-page.component';

@Component({
  selector: 'app-outlets', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './outlets.component.html', styleUrl: './outlets.component.css'
})
export class OutletsComponent {}
