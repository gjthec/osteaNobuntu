import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDateFieldComponent } from './input-date-field.component';

describe('InputDateFieldComponent', () => {
  let component: InputDateFieldComponent;
  let fixture: ComponentFixture<InputDateFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputDateFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputDateFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
