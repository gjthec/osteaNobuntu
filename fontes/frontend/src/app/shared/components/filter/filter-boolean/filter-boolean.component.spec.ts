import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBooleanComponent } from './filter-boolean.component';

describe('FilterBooleanComponent', () => {
  let component: FilterBooleanComponent;
  let fixture: ComponentFixture<FilterBooleanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterBooleanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterBooleanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
