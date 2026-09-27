import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page bg-grid-subtle">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Settings & System Configuration</h1>
          <p class="page-subtitle">Configure theme system tokens, distributed microservice boundaries, and register policies.</p>
        </div>
      </div>

      <!-- Theme System Design Token Engine -->
      <div class="grid-card settings-card">
        <div class="card-head">
          <h2 class="card-title">Clean Grid Design Token Engine</h2>
          <p class="card-sub">
            Switch between Light, Dark, and System appearance. Consistent component structure and token mapping.
          </p>
        </div>

        <div class="theme-picker-grid">
          <div
            class="theme-card-option"
            [class.selected]="themeService.themeMode() === 'light'"
            (click)="themeService.setTheme('light')"
          >
            <div class="preview-box light-preview">
              <div class="p-header"></div>
              <div class="p-body"></div>
            </div>
            <div class="theme-meta">
              <strong>Light Mode (☀)</strong>
              <span class="font-mono">#F7F8F6 App · #FFFFFF Surface</span>
            </div>
          </div>

          <div
            class="theme-card-option"
            [class.selected]="themeService.themeMode() === 'system'"
            (click)="themeService.setTheme('system')"
          >
            <div class="preview-box system-preview">
              <div class="p-header"></div>
              <div class="p-body"></div>
            </div>
            <div class="theme-meta">
              <strong>System Preference (◐)</strong>
              <span>Follow operating-system dark mode</span>
            </div>
          </div>

          <div
            class="theme-card-option"
            [class.selected]="themeService.themeMode() === 'dark'"
            (click)="themeService.setTheme('dark')"
          >
            <div class="preview-box dark-preview">
              <div class="p-header"></div>
              <div class="p-body"></div>
            </div>
            <div class="theme-meta">
              <strong>Dark Mode (☾)</strong>
              <span class="font-mono">#101312 App · #171A18 Surface</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Distributed Microservice Architecture & Gateway Diagnostic -->
      <div class="grid-card settings-card">
        <div class="card-head">
          <h2 class="card-title">Distributed Backend Architecture Status</h2>
          <p class="card-sub font-mono">Gateway Proxy: http://localhost:8000/api/v1</p>
        </div>

        <div class="gateway-status-grid">
          <div class="status-box">
            <div class="box-top">
              <span class="status-dot status-dot-success"></span>
              <strong class="box-title">API Gateway</strong>
            </div>
            <span class="box-detail font-mono">Port 8000 · Reverse Proxy & Rate Limiting</span>
          </div>

          <div class="status-box">
            <div class="box-top">
              <span class="status-dot status-dot-success"></span>
              <strong class="box-title">Auth Service</strong>
            </div>
            <span class="box-detail font-mono">Port 8001 · JWT & RBAC (Jobi · store_admin)</span>
          </div>

          <div class="status-box">
            <div class="box-top">
              <span class="status-dot status-dot-success"></span>
              <strong class="box-title">Inventory Service</strong>
            </div>
            <span class="box-detail font-mono">Port 8002 · Ledger, Reservations & Transfers</span>
          </div>

          <div class="status-box">
            <div class="box-top">
              <span class="status-dot status-dot-success"></span>
              <strong class="box-title">Billing Service</strong>
            </div>
            <span class="box-detail font-mono">Port 8003 · POS Saga & Transactional Outbox</span>
          </div>

          <div class="status-box">
            <div class="box-top">
              <span class="status-dot status-dot-info"></span>
              <strong class="box-title">Transactional Outbox</strong>
            </div>
            <span class="box-detail font-mono">PostgreSQL Outbox Table · Zero lag</span>
          </div>

          <div class="status-box">
            <div class="box-top">
              <span class="status-dot status-dot-success"></span>
              <strong class="box-title">Redis Streams</strong>
            </div>
            <span class="box-detail font-mono">stream:orders · stream:inventory · stream:billing</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-height: calc(100vh - 56px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.15rem;
    }

    .settings-card {
      padding: 1.15rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
    }

    .card-head {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .card-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .card-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .theme-picker-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .theme-card-option {
      background-color: var(--bg-secondary);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.875rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      transition: all 0.12s ease;
    }

    .theme-card-option:hover {
      border-color: var(--text-dim);
    }

    .theme-card-option.selected {
      border-color: var(--color-primary);
      background-color: var(--bg-surface);
      box-shadow: 0 0 0 1px var(--color-primary-border);
    }

    .preview-box {
      height: 75px;
      border-radius: var(--radius-sm);
      padding: 0.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      border: 1px solid var(--border-color);
    }

    .light-preview {
      background-color: #F7F8F6;
    }
    .light-preview .p-header { background: #FFFFFF; height: 14px; border-radius: 2px; border: 1px solid #E1E5E2; }
    .light-preview .p-body { background: #FFFFFF; flex: 1; border-radius: 2px; border: 1px solid #E1E5E2; }

    .dark-preview {
      background-color: #101312;
    }
    .dark-preview .p-header { background: #171A18; height: 14px; border-radius: 2px; border: 1px solid #2A302D; }
    .dark-preview .p-body { background: #171A18; flex: 1; border-radius: 2px; border: 1px solid #2A302D; }

    .system-preview {
      background: linear-gradient(135deg, #F7F8F6 50%, #101312 50%);
    }
    .system-preview .p-header { background: rgba(255, 255, 255, 0.5); height: 14px; border-radius: 2px; }
    .system-preview .p-body { background: rgba(255, 255, 255, 0.5); flex: 1; border-radius: 2px; }

    .theme-meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .theme-meta strong {
      font-size: 0.8125rem;
      color: var(--text-main);
    }

    .theme-meta span {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    /* GATEWAY STATUS GRID */
    .gateway-status-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .status-box {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .box-top {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .box-title {
      font-size: 0.8125rem;
      color: var(--text-main);
    }

    .box-detail {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    @media (max-width: 1024px) {
      .theme-picker-grid {
        grid-template-columns: 1fr;
      }
      .gateway-status-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent {
  public themeService = inject(ThemeService);
  public apiService = inject(ApiService);
}
