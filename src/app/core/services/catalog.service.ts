import { Injectable, inject } from '@angular/core';
import { WorkspaceService } from './workspace.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly workspace = inject(WorkspaceService);
  fetchProducts() { return this.workspace.allProducts(); }
}
