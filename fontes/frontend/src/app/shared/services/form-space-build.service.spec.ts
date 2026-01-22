import { TestBed } from '@angular/core/testing';

import { FormSpaceBuildService } from './form-space-build.service';

describe('FormSpaceBuildService', () => {
  let service: FormSpaceBuildService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormSpaceBuildService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
