import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoFieldComponent } from './video-field.component';

describe('VideoFieldComponent', () => {
  let component: VideoFieldComponent;
  let fixture: ComponentFixture<VideoFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
