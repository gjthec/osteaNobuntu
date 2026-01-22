import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseResourceFilterComponent } from './base-resource-filter.component';

describe('BaseResourceFilterComponent', () => {
  let component: BaseResourceFilterComponent;
  let fixture: ComponentFixture<BaseResourceFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseResourceFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseResourceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
