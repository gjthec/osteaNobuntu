import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationFieldComponent } from './location-field.component';

describe('LocationFieldComponent', () => {
  let component: LocationFieldComponent;
  let fixture: ComponentFixture<LocationFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
