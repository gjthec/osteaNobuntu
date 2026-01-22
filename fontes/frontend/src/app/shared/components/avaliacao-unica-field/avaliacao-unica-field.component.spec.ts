import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaliacaoUnicaFieldComponent } from './avaliacao-unica-field.component';

describe('AvaliacaoUnicaFieldComponent', () => {
  let component: AvaliacaoUnicaFieldComponent;
  let fixture: ComponentFixture<AvaliacaoUnicaFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvaliacaoUnicaFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvaliacaoUnicaFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
