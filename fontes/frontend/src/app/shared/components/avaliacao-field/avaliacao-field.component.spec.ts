import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaliacaoFieldComponent } from './avaliacao-field.component';

describe('AvaliacaoFieldComponent', () => {
  let component: AvaliacaoFieldComponent;
  let fixture: ComponentFixture<AvaliacaoFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvaliacaoFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvaliacaoFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
