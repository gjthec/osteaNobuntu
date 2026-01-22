import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantInviteUserFormComponent } from './tenant-invite-user-form.component';

describe('TenantInviteUserFormComponent', () => {
  let component: TenantInviteUserFormComponent;
  let fixture: ComponentFixture<TenantInviteUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantInviteUserFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantInviteUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
