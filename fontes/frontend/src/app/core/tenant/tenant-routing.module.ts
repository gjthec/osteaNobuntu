import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantListComponent } from './tenant-list/tenant-list.component';
import { TenantUserListComponent } from './tenant-user-list/tenant-user-list.component';
import { DatabaseCredentialFormComponent } from './database-credential-form/database-credential-form.component';
import { TenantFormComponent } from './tenant-form/tenant-form.component';
import { DatabaseCredentialListComponent } from './database-credential-list/database-credential-list.component';

const routes: Routes = [
  { path: '', component: TenantListComponent },
  { path: 'users', component: TenantUserListComponent },
  { path: 'add', component: TenantFormComponent },
  { path: 'tenantCredential', component: DatabaseCredentialListComponent },
  { path: 'tenantCredential/add', component: DatabaseCredentialFormComponent },
  { path: 'tenantCredential/edit', component: DatabaseCredentialFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantRoutingModule { }
