import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ApiKeyModal } from './api-key-modal';

describe('ApiKeyModal', () => {
  it('renders 9router configuration and per-model provider controls', async () => {
    await TestBed.configureTestingModule({ imports: [ApiKeyModal] }).compileComponents();
    const fixture = TestBed.createComponent(ApiKeyModal);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#nineRouterBaseUrl')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('select[aria-label="Nhà cung cấp model"]')).toBeTruthy();
  });
});
