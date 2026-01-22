import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantMenuComponent } from './tenant-menu.component';

describe('TenantMenuComponent', () => {
  let component: TenantMenuComponent;
  let fixture: ComponentFixture<TenantMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
