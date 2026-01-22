import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAvaliacaoComponent } from './list-avaliacao.component';

describe('ListAvaliacaoComponent', () => {
  let component: ListAvaliacaoComponent;
  let fixture: ComponentFixture<ListAvaliacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAvaliacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAvaliacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
