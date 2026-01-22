import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAgendaComponent } from './list-agenda.component';

describe('ListAgendaComponent', () => {
  let component: ListAgendaComponent;
  let fixture: ComponentFixture<ListAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAgendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
