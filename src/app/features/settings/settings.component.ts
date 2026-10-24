import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';
import { DataRecord } from '../../core/services/workspace.service';
import { DataStateComponent } from '../../shared/data-state/data-state.component';

@Component({ selector: 'app-settings', standalone: true, imports: [CommonModule, DataStateComponent],
  templateUrl: './settings.component.html', styleUrl: './settings.component.css' })
export class SettingsComponent {
  readonly theme = inject(ThemeService);
  readonly api = inject(ApiService);
  readonly health = signal<DataRecord | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly themes = ['light', 'dark', 'system'] as const;
  constructor() { void this.load(); }
  async load(): Promise<void> {
    this.loading.set(true); this.error.set(''); this.health.set(null);
    try { this.health.set(await firstValueFrom(this.api.get<DataRecord>('/system/health'))); }
    catch (error) { this.error.set(errorMessage(error)); }
    finally { this.loading.set(false); }
  }
}
