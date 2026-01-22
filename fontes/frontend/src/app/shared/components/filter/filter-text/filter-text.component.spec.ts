import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterTextComponent } from './filter-text.component';

describe('FilterTextComponent', () => {
  let component: FilterTextComponent;
  let fixture: ComponentFixture<FilterTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
