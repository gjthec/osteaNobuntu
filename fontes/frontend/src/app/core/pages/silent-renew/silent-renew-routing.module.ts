import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SilentRenewComponent } from './silent-renew/silent-renew.component';

const routes: Routes = [
  { path: '', component: SilentRenewComponent}, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SilentRenewRoutingModule { }
