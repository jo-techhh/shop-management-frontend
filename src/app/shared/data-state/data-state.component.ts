import { Component, input, output } from '@angular/core';
import { LucideInbox, LucideCircleAlert, LucideLoaderCircle } from '@lucide/angular';

@Component({
  selector: 'app-data-state', standalone: true,
  imports: [LucideInbox, LucideCircleAlert, LucideLoaderCircle],
  templateUrl: './data-state.component.html', styleUrl: './data-state.component.css'
})
export class DataStateComponent {
  readonly loading = input(false);
  readonly error = input('');
  readonly title = input('No data yet');
  readonly description = input('Records will appear here once they have been created.');
  readonly retry = output<void>();
}
