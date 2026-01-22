import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatStepperFormComponent } from './mat-stepper-form.component';

describe('MatStepperFormComponent', () => {
  let component: MatStepperFormComponent;
  let fixture: ComponentFixture<MatStepperFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatStepperFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatStepperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
