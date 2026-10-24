import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService, errorMessage } from './api.service';
import { API_BASE_URL } from '../api.config';

describe('Real API response handling', () => {
  let api: ApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api/v1' }] });
    api = TestBed.inject(ApiService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('preserves a successful empty result', () => {
    let result: unknown;
    api.get('/catalog/products').subscribe(data => { result = data; });
    http.expectOne('/api/v1/catalog/products').flush([]);
    expect(result).toEqual([]);
    expect(api.isConnected()).toBe(true);
  });
  it('propagates backend failures instead of supplying records', () => {
    let message = '';
    let succeeded = false;
    api.get('/inventory/stock').subscribe({ next: () => { succeeded = true; }, error: error => { message = errorMessage(error); } });
    http.expectOne('/api/v1/inventory/stock').flush({ detail: 'Inventory service unavailable' }, { status: 503, statusText: 'Unavailable' });
    expect(succeeded).toBe(false);
    expect(message).toBe('Inventory service unavailable');
    expect(api.isConnected()).toBe(false);
  });
  it('shows field validation details', () => {
    let message = '';
    api.post('/catalog/products', {}).subscribe({ error: error => { message = errorMessage(error); } });
    http.expectOne('/api/v1/catalog/products').flush({ detail: [{ loc: ['body', 'variants', 0, 'retail_price'], msg: 'Field required' }] }, { status: 422, statusText: 'Invalid' });
    expect(message).toContain('retail_price');
    expect(message).toContain('Field required');
  });
});
