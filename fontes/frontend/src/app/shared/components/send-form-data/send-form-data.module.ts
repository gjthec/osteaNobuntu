import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SendFormDataComponent } from './send-form-data.component';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

//Angular Material Modules
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    SendFormDataComponent
  ],
  imports: [
    CommonModule,
    TranslocoModule,
    //Angular Material Components
    MatMenuModule,
    MatButtonModule
  ],
  providers: [
    { provide: TRANSLOCO_SCOPE, useValue: { scope: "components", alias: "componentsBase" } }
  ],
  exports: [
    SendFormDataComponent
  ],
})
export class SendFormDataModule { }
