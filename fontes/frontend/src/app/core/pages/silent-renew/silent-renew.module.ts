import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SilentRenewRoutingModule } from './silent-renew-routing.module';
import { SilentRenewComponent } from './silent-renew/silent-renew.component';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [
    SilentRenewComponent
  ],
  imports: [
    CommonModule,
    SilentRenewRoutingModule,
    TranslocoModule
  ]
})
export class SilentRenewModule { }
