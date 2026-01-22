import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamicBaseResourceFormComponent } from './dinamic-base-resource-form.component';

describe('DinamicBaseResourceFormComponent', () => {
  let component: DinamicBaseResourceFormComponent;
  let fixture: ComponentFixture<DinamicBaseResourceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DinamicBaseResourceFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DinamicBaseResourceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
