import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendFormDataComponent } from './send-form-data.component';

describe('SendFormDataComponent', () => {
  let component: SendFormDataComponent;
  let fixture: ComponentFixture<SendFormDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendFormDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendFormDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
