import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeignKeyInputFieldComponent } from './foreign-key-input-field.component';

describe('ForeignKeyInputFieldComponent', () => {
  let component: ForeignKeyInputFieldComponent;
  let fixture: ComponentFixture<ForeignKeyInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForeignKeyInputFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForeignKeyInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
