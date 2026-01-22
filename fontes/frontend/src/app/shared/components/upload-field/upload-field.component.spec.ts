import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFieldComponent } from './upload-field.component';

describe('UploadFieldComponent', () => {
  let component: UploadFieldComponent;
  let fixture: ComponentFixture<UploadFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
