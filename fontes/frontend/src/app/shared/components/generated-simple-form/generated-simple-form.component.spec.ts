import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratedSimpleFormComponent } from './generated-simple-form.component';

describe('GeneratedSimpleFormComponent', () => {
  let component: GeneratedSimpleFormComponent;
  let fixture: ComponentFixture<GeneratedSimpleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratedSimpleFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratedSimpleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
