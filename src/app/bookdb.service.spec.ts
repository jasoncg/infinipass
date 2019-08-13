import { TestBed } from '@angular/core/testing';

import { BookdbService } from './bookdb.service';

describe('BookdbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BookdbService = TestBed.get(BookdbService);
    expect(service).toBeTruthy();
  });
});
