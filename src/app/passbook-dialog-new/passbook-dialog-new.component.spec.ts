import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassbookDialogNewComponent } from './passbook-dialog-new.component';

describe('PassbookDialogNewComponent', () => {
  let component: PassbookDialogNewComponent;
  let fixture: ComponentFixture<PassbookDialogNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassbookDialogNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassbookDialogNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
