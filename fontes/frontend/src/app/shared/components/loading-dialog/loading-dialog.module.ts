import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingDialogComponent } from './loading-dialog.component';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

//Angular Material Modules
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    LoadingDialogComponent
  ],
  imports: [
    CommonModule,
    TranslocoModule,
    //Angular Material Components
    MatProgressSpinnerModule
  ],
  providers: [
    { provide: TRANSLOCO_SCOPE, useValue: { scope: "components", alias: "components" } }
  ],
  exports: [
    LoadingDialogComponent
  ],
})
export class LoadingDialogModule { }
