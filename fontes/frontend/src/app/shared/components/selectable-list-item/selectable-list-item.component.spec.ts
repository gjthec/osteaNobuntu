import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableListItemComponent } from './selectable-list-item.component';

describe('SelectableListItemComponent', () => {
  let component: SelectableListItemComponent;
  let fixture: ComponentFixture<SelectableListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectableListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectableListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
