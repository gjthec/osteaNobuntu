import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalaLinearFieldComponent } from './escala-linear-field.component';

describe('EscalaLinearFieldComponent', () => {
  let component: EscalaLinearFieldComponent;
  let fixture: ComponentFixture<EscalaLinearFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EscalaLinearFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscalaLinearFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
