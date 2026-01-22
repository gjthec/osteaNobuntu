import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseCredentialFormComponent } from './database-credential-form.component';

describe('DatabaseCredentialFormComponent', () => {
  let component: DatabaseCredentialFormComponent;
  let fixture: ComponentFixture<DatabaseCredentialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatabaseCredentialFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseCredentialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
