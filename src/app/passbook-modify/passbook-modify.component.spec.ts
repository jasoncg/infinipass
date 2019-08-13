import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassbookModifyComponent } from './passbook-modify.component';

describe('PassbookModifyComponent', () => {
  let component: PassbookModifyComponent;
  let fixture: ComponentFixture<PassbookModifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassbookModifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassbookModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
