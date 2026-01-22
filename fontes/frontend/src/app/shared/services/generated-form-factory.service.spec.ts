import { TestBed } from '@angular/core/testing';

import { GeneratedFormFactoryService } from './generated-form-factory.service';

describe('GeneratedFormFactoryService', () => {
  let service: GeneratedFormFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneratedFormFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
