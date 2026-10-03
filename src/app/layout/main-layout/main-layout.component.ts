import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <!-- Sidebar: has its own brand header built in, full height -->
      <app-sidebar />

      <!-- Main wrapper: header + content -->
      <div class="main-wrapper">
        <app-header />
        <main class="content-area">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      width: 100vw;
      overflow-x: hidden;
      background-color: var(--bg-app);
    }

    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      /* Sidebar is sticky height:100vh, header is sticky top:0 */
    }

    .content-area {
      flex: 1;
      background-color: var(--bg-app);
      display: flex;
      flex-direction: column;
      overflow: auto;
    }
  `]
})
export class MainLayoutComponent {}
