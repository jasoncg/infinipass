import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassbookServiceModifyComponent } from './passbook-service-modify.component';

describe('PassbookServiceModifyComponent', () => {
  let component: PassbookServiceModifyComponent;
  let fixture: ComponentFixture<PassbookServiceModifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassbookServiceModifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassbookServiceModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
