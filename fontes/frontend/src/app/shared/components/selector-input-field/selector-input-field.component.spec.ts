import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorInputFieldComponent } from './selector-input-field.component';

describe('SelectorInputFieldComponent', () => {
  let component: SelectorInputFieldComponent;
  let fixture: ComponentFixture<SelectorInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectorInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
