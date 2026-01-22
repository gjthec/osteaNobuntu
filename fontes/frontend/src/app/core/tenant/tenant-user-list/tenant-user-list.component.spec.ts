import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantUserListComponent } from './tenant-user-list.component';

describe('TenantUserListComponent', () => {
  let component: TenantUserListComponent;
  let fixture: ComponentFixture<TenantUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantUserListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
