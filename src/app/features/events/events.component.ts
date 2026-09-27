import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="events-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Operational Event Stream & Saga Visualizer</h1>
          <p class="page-subtitle">Real-time Redis Streams audit trail and distributed transaction saga orchestration.</p>
        </div>
        <button class="btn-secondary" (click)="simulateSagaEvent()">⚡ Emit Test Outbox Event</button>
      </div>

      <!-- Saga Choreography Architecture Visualizer -->
      <div class="grid-card saga-visualizer-card">
        <div class="saga-header">
          <h3 class="card-title">Event-Driven Checkout Saga Flow</h3>
          <div class="flow-switcher">
            <button [class.active]="selectedFlow() === 'success'" (click)="selectedFlow.set('success')">Success Flow</button>
            <button [class.active]="selectedFlow() === 'rollback'" (click)="selectedFlow.set('rollback')">Compensating Rollback</button>
          </div>
        </div>

        @if (selectedFlow() === 'success') {
          <div class="saga-flow-container">
            <div class="saga-step active">
              <span class="step-num">1</span>
              <div class="step-info">
                <strong>Order Created</strong>
                <span>API Gateway → Billing Service</span>
              </div>
            </div>
            <div class="saga-arrow">──►</div>
            <div class="saga-step active">
              <span class="step-num">2</span>
              <div class="step-info">
                <strong>Stock Reserved</strong>
                <span>Redis Stream → Inventory Service</span>
              </div>
            </div>
            <div class="saga-arrow">──►</div>
            <div class="saga-step active">
              <span class="step-num">3</span>
              <div class="step-info">
                <strong>Payment Confirmed</strong>
                <span>Redlock → Drawer Balance</span>
              </div>
            </div>
            <div class="saga-arrow">──►</div>
            <div class="saga-step active success">
              <span class="step-num">✓</span>
              <div class="step-info">
                <strong>Order Completed</strong>
                <span>Receipt Printed</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="saga-flow-container">
            <div class="saga-step active">
              <span class="step-num">1</span>
              <div class="step-info">
                <strong>Order Created</strong>
                <span>API Gateway</span>
              </div>
            </div>
            <div class="saga-arrow">──►</div>
            <div class="saga-step active">
              <span class="step-num">2</span>
              <div class="step-info">
                <strong>Stock Reserved</strong>
                <span>Inventory Outbox</span>
              </div>
            </div>
            <div class="saga-arrow">──►</div>
            <div class="saga-step failed">
              <span class="step-num">✕</span>
              <div class="step-info">
                <strong>Payment Failed</strong>
                <span>Card Declined</span>
              </div>
            </div>
            <div class="saga-arrow">──►</div>
            <div class="saga-step warning">
              <span class="step-num">↶</span>
              <div class="step-info">
                <strong>Stock Released</strong>
                <span>Saga Compensations</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Technical Event Stream Timeline -->
      <div class="grid-card timeline-card">
        <div class="grid-header">
          <h3 class="card-title">Live Redis Streams Log (stream:orders & stream:inventory)</h3>
        </div>
        <div class="timeline-list">
          @for (evt of eventService.events(); track evt.id) {
            <div class="timeline-item">
              <div class="timeline-left">
                <span class="timeline-dot" [class.success]="evt.status === 'success'" [class.warning]="evt.status === 'warning'" [class.processing]="evt.status === 'processing'"></span>
                <div class="timeline-line"></div>
              </div>
              <div class="timeline-content">
                <div class="event-header">
                  <span class="event-type font-mono">{{ evt.eventType }}</span>
                  <span class="stream-tag font-mono">{{ evt.stream }}</span>
                  <span class="service-tag font-mono">{{ evt.service }}</span>
                  <span class="timestamp">{{ evt.timestamp | date:'mediumTime' }}</span>
                </div>
                <div class="event-summary">{{ evt.summary }}</div>
                <div class="event-footer">
                  <code class="corr-id">X-Correlation-ID: {{ evt.correlationId }}</code>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .events-page {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
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
    }

    .page-subtitle {
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    .saga-visualizer-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .saga-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .flow-switcher {
      display: flex;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 2px;
    }

    .flow-switcher button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-xs);
      cursor: pointer;
    }

    .flow-switcher button.active {
      background: var(--bg-surface);
      color: var(--text-main);
      font-weight: 600;
      box-shadow: var(--shadow-sm);
    }

    .saga-flow-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--bg-secondary);
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;
    }

    .saga-step {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0.6rem 0.875rem;
      flex: 1;
    }

    .saga-step.active { border-color: var(--color-primary); }
    .saga-step.success { border-color: var(--color-success); }
    .saga-step.failed { border-color: var(--color-danger); }
    .saga-step.warning { border-color: var(--color-warning); }

    .step-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--bg-secondary);
      color: var(--text-main);
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .saga-step.active .step-num { background: var(--color-primary); color: #fff; }
    .saga-step.success .step-num { background: var(--color-success); color: #fff; }
    .saga-step.failed .step-num { background: var(--color-danger); color: #fff; }
    .saga-step.warning .step-num { background: var(--color-warning); color: #fff; }

    .step-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .step-info strong {
      font-size: 0.8rem;
      color: var(--text-main);
    }

    .step-info span {
      font-size: 0.675rem;
      color: var(--text-muted);
    }

    .saga-arrow {
      color: var(--text-muted);
      font-size: 0.85rem;
      padding: 0 0.5rem;
    }

    .timeline-card {
      padding: 0;
    }

    .timeline-list {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
    }

    .timeline-item {
      display: flex;
      gap: 1rem;
      position: relative;
    }

    .timeline-left {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .timeline-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--bg-surface);
      z-index: 2;
    }

    .timeline-dot.success { background-color: var(--color-success); }
    .timeline-dot.warning { background-color: var(--color-warning); }
    .timeline-dot.processing { background-color: var(--color-primary); }

    .timeline-line {
      width: 1px;
      flex: 1;
      background-color: var(--border-color);
      margin-top: 3px;
      margin-bottom: 3px;
    }

    .timeline-item:last-child .timeline-line {
      display: none;
    }

    .timeline-content {
      flex: 1;
      padding-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .event-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .event-type {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .stream-tag {
      font-size: 0.675rem;
      background-color: var(--color-primary-subtle);
      color: var(--color-primary);
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-xs);
    }

    .service-tag {
      font-size: 0.675rem;
      background-color: var(--bg-secondary);
      color: var(--text-muted);
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-xs);
    }

    .timestamp {
      margin-left: auto;
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .event-summary {
      font-size: 0.825rem;
      color: var(--text-main);
    }

    .event-footer {
      margin-top: 0.2rem;
    }

    .corr-id {
      font-size: 0.675rem;
      color: var(--text-muted);
      background-color: var(--bg-secondary);
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-xs);
    }
  `]
})
export class EventsComponent {
  public eventService = inject(EventService);
  public selectedFlow = signal<'success' | 'rollback'>('success');

  public simulateSagaEvent(): void {
    this.eventService.logEvent({
      eventType: 'STOCK_OUTBOX_EVENT_EMITTED',
      stream: 'stream:inventory',
      service: 'inventory_service',
      summary: 'Outbox publisher pushed 1 event to Redis Streams (stream:inventory)',
      status: 'success'
    });
  }
}
