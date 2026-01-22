import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedItemsListComponent } from './selected-items-list.component';

describe('SelectedItemsListComponent', () => {
  let component: SelectedItemsListComponent;
  let fixture: ComponentFixture<SelectedItemsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedItemsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
