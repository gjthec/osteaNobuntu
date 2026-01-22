import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmChangeAppComponent } from './confirm-change-app.component';

describe('ConfirmChangeAppComponent', () => {
  let component: ConfirmChangeAppComponent;
  let fixture: ComponentFixture<ConfirmChangeAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmChangeAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmChangeAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
