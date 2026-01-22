import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubformComponent } from './subform.component';

describe('SubformComponent', () => {
  let component: SubformComponent;
  let fixture: ComponentFixture<SubformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubformComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
