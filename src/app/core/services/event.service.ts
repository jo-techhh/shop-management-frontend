import { Injectable, inject } from '@angular/core';
import { WorkspaceService } from './workspace.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly workspace = inject(WorkspaceService);
  fetchEvents(outletId: string) { return this.workspace.load('events', outletId); }
}
