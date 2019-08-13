import { TestBed } from '@angular/core/testing';

import { PassgenService } from './passgen.service';

describe('PassgenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PassgenService = TestBed.get(PassgenService);
    expect(service).toBeTruthy();
  });
});
