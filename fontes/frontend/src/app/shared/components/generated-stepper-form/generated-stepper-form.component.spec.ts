import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratedStepperFormComponent } from './generated-stepper-form.component';

describe('GeneratedStepperFormComponent', () => {
  let component: GeneratedStepperFormComponent;
  let fixture: ComponentFixture<GeneratedStepperFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratedStepperFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratedStepperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
