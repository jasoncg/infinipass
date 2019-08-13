import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserHelperComponent } from './browser-helper.component';

describe('BrowserHelperComponent', () => {
  let component: BrowserHelperComponent;
  let fixture: ComponentFixture<BrowserHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
