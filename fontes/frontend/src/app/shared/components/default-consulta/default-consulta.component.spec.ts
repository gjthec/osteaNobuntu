import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultConsultaComponent } from './default-consulta.component';

describe('DefaultConsultaComponent', () => {
  let component: DefaultConsultaComponent;
  let fixture: ComponentFixture<DefaultConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultConsultaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
