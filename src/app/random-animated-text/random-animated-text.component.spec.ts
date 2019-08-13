import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomAnimatedTextComponent } from './random-animated-text.component';

describe('RandomAnimatedTextComponent', () => {
  let component: RandomAnimatedTextComponent;
  let fixture: ComponentFixture<RandomAnimatedTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RandomAnimatedTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomAnimatedTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
