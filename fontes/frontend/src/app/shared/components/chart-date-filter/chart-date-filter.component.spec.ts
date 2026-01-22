import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDateFilterComponent } from './chart-date-filter.component';

describe('ChartDateFilterComponent', () => {
  let component: ChartDateFilterComponent;
  let fixture: ComponentFixture<ChartDateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartDateFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartDateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
