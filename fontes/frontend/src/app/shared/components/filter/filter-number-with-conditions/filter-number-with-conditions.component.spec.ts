import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterNumberWithConditionsComponent } from './filter-number-with-conditions.component';

describe('FilterNumberWithConditionsComponent', () => {
  let component: FilterNumberWithConditionsComponent;
  let fixture: ComponentFixture<FilterNumberWithConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterNumberWithConditionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterNumberWithConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
