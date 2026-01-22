import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAppsComponent } from './list-apps.component';

describe('ListAppsComponent', () => {
  let component: ListAppsComponent;
  let fixture: ComponentFixture<ListAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListAppsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
