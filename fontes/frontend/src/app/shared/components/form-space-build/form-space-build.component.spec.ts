import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSpaceBuildComponent } from './form-space-build.component';

describe('FormSpaceBuildComponent', () => {
  let component: FormSpaceBuildComponent;
  let fixture: ComponentFixture<FormSpaceBuildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormSpaceBuildComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSpaceBuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
