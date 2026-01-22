import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaliacaoFormComponent } from './avaliacao-form.component';

describe('AvaliacaoFormComponent', () => {
  let component: AvaliacaoFormComponent;
  let fixture: ComponentFixture<AvaliacaoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvaliacaoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvaliacaoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
