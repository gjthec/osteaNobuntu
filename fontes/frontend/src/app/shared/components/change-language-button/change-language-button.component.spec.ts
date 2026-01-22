import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeLanguageButtonComponent } from './change-language-button.component';

describe('ChangeLanguageButtonComponent', () => {
  let component: ChangeLanguageButtonComponent;
  let fixture: ComponentFixture<ChangeLanguageButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeLanguageButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeLanguageButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
