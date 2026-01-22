import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureLocationFieldComponent } from './capture-location-field.component';

describe('CaptureLocationFieldComponent', () => {
  let component: CaptureLocationFieldComponent;
  let fixture: ComponentFixture<CaptureLocationFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaptureLocationFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaptureLocationFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
