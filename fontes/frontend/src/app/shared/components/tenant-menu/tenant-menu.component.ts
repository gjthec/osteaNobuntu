import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { DatabasePermission } from 'app/core/tenant/databasePermission.model';
import { ITenant } from 'app/core/tenant/tenant.model';
import { TenantService } from 'app/core/tenant/tenant.service';


@Component({
  selector: 'tenant-menu',
  templateUrl: './tenant-menu.component.html',
  styleUrls: ['./tenant-menu.component.scss']
})
export class TenantMenuComponent implements OnInit {
  /**
   * Tenants
   */
  tenants: ITenant[] = [];
  /**
   * Tenant ativo no momento
   */
  currentTenant: DatabasePermission;

  constructor(
    private tenantService: TenantService,
    private authService: AuthService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    //Obtem o Tenant atual para manipular o componente
    this.currentTenant = this.tenantService.currentTenant;
    this.getTenants();
  }

  async getTenants() {
  
    this.currentTenant = this.tenantService.currentTenant;
    this.tenants = this.tenantService.getTenantsFromLocalstorage();

  }

  goToAddTenantPage() {
    this.router.navigate(['/tenant/add']);
  }

  goToTenantPage() {
    this.router.navigate(['/tenant']);
  }

  changeTenant(tenantCredentialId: string) {
    this.tenantService.switchTenant(tenantCredentialId);
    window.location.reload();
  }

}
