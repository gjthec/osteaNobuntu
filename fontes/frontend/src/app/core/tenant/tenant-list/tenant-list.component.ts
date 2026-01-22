import { Component, OnInit } from '@angular/core';
import { ITenant } from '../tenant.model';
import { TenantService } from '../tenant.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss']
})
export class TenantListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'userPermissionTenant', 'databaseCredential'];

  tenants: ITenant[] = [];

  constructor(
    private tenantService: TenantService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.currentUser != null) {
      this.getTenants(this.authService.currentUser.UID);
    }
    

  }

  async getTenants(userUID: string) {
    this.tenants = await this.tenantService.getTenantsAndSaveInLocalStorage(userUID);

    // console.log("tenants obtidos: ",this.tenants)
  }

  goToUserTenantPage() {
    this.router.navigate(['/tenant/users']);
  }

  goToCreateTenantPage(){
    this.router.navigate(['/tenant/add']);
  }

  goToDatabaseCredentialPage(){
    this.router.navigate(['/tenant/tenantCredential']);
  }

}