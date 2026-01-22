import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadInputFieldComponent } from './upload-input-field.component';

describe('UploadInputFieldComponent', () => {
  let component: UploadInputFieldComponent;
  let fixture: ComponentFixture<UploadInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
