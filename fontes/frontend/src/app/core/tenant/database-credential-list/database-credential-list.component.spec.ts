import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseCredentialListComponent } from './database-credential-list.component';

describe('DatabaseCredentialListComponent', () => {
  let component: DatabaseCredentialListComponent;
  let fixture: ComponentFixture<DatabaseCredentialListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatabaseCredentialListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseCredentialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
