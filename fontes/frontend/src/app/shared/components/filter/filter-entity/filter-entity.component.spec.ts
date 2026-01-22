import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterEntityComponent } from './filter-entity.component';

describe('FilterEntityComponent', () => {
  let component: FilterEntityComponent;
  let fixture: ComponentFixture<FilterEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterEntityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
