import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureFieldComponent } from './picture-field.component';

describe('PictureFieldComponent', () => {
  let component: PictureFieldComponent;
  let fixture: ComponentFixture<PictureFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PictureFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PictureFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
