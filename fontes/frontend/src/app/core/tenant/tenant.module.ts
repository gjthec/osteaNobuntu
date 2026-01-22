import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService } from './tenant.service';
import { MatFormFieldModule } from '@angular/material/form-field';


import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { TranslocoRootModule } from 'app/transloco-root.module';
import { TenantListComponent } from './tenant-list/tenant-list.component';
import { SharedModule } from "../../shared/shared.module";

//Angular material Modules
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

//Routing Module
import { TenantRoutingModule } from './tenant-routing.module';

//Components
import { TenantUserListComponent } from './tenant-user-list/tenant-user-list.component';
import { TenantInviteUserFormComponent } from './tenant-user-list/tenant-invite-user-form/tenant-invite-user-form.component';
import { DatabaseCredentialFormComponent } from './database-credential-form/database-credential-form.component';
import { TenantFormComponent } from './tenant-form/tenant-form.component';
import { DatabaseCredentialListComponent } from './database-credential-list/database-credential-list.component';

@NgModule({
  imports: [
    CommonModule,
    TenantRoutingModule,
    //Angular Material
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule, //Para usar o fromGroup
    MatIconModule,
    MatButtonToggleModule,
    MatStepperModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDialogModule,
    MatCheckboxModule,
    //Transoloco
    TranslocoRootModule,
    SharedModule
  ],
  declarations: [
    // DatabaseCredentialFormComponent,
    TenantListComponent,
    TenantUserListComponent,
    TenantInviteUserFormComponent,
    DatabaseCredentialFormComponent,
    TenantFormComponent,
    DatabaseCredentialListComponent,
  ],
  providers: [
    TenantService,
    { provide: TRANSLOCO_SCOPE, useValue: { scope: "core", alias: "core" } }
  ],
})
export class TenantModule { }
