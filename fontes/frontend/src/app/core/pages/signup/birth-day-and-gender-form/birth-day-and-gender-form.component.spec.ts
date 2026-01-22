import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthDayAndGenderFormComponent } from './birth-day-and-gender-form.component';

describe('BirthDayAndGenderFormComponent', () => {
  let component: BirthDayAndGenderFormComponent;
  let fixture: ComponentFixture<BirthDayAndGenderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BirthDayAndGenderFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BirthDayAndGenderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
