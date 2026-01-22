import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuChoiceComponent } from './menu-choice.component';

describe('MenuChoiceComponent', () => {
  let component: MenuChoiceComponent;
  let fixture: ComponentFixture<MenuChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuChoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
