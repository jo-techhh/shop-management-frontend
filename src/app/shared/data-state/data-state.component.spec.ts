import { TestBed } from '@angular/core/testing';
import { DataStateComponent } from './data-state.component';

describe('Data state presentation', () => {
  it('distinguishes a server error from an empty result and supports retry', async () => {
    const fixture = TestBed.createComponent(DataStateComponent);
    fixture.componentRef.setInput('title', 'No orders yet');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No orders yet');
    fixture.componentRef.setInput('error', 'Order service unavailable');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Order service unavailable');
    expect(fixture.nativeElement.textContent).not.toContain('No orders yet');
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => { retried = true; });
    fixture.nativeElement.querySelector('button').click();
    expect(retried).toBe(true);
  });
});
