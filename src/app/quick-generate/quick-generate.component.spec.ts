import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickGenerateComponent } from './quick-generate.component';

describe('QuickGenerateComponent', () => {
  let component: QuickGenerateComponent;
  let fixture: ComponentFixture<QuickGenerateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickGenerateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
