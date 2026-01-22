import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPeriodComponent } from './filter-period.component';

describe('FilterPeriodComponent', () => {
  let component: FilterPeriodComponent;
  let fixture: ComponentFixture<FilterPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterPeriodComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
