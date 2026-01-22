import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultGraphicComponent } from './default-graphic.component';

describe('DefaultGraphicComponent', () => {
  let component: DefaultGraphicComponent;
  let fixture: ComponentFixture<DefaultGraphicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultGraphicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultGraphicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
