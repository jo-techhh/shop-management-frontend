import { Component } from '@angular/core';
import { ResourcePageComponent } from '../../shared/resource-page/resource-page.component';

@Component({
  selector: 'app-events', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './events.component.html', styleUrl: './events.component.css'
})
export class EventsComponent {}
