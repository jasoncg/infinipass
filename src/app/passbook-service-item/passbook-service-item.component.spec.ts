import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassbookServiceItemComponent } from './passbook-service-item.component';

describe('PassbookServiceItemComponent', () => {
  let component: PassbookServiceItemComponent;
  let fixture: ComponentFixture<PassbookServiceItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassbookServiceItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassbookServiceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
