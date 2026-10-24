import { Component } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({ selector: 'app-analytics', standalone: true, imports: [DashboardComponent],
  templateUrl: './analytics.component.html', styleUrl: './analytics.component.css' })
export class AnalyticsComponent {}
