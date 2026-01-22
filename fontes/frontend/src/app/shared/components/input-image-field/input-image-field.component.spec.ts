import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputImageFieldComponent } from './input-image-field.component';

describe('InputImageFieldComponent', () => {
  let component: InputImageFieldComponent;
  let fixture: ComponentFixture<InputImageFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputImageFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputImageFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
