import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthSelectorComponent } from './month-selector.component';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

//Angular Material Modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    MonthSelectorComponent
  ],
  imports: [
    CommonModule,
    TranslocoModule,
    //Angular Material Components
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [
    { provide: TRANSLOCO_SCOPE, useValue: { scope: "components", alias: "components" } }
  ],
  exports: [
    MonthSelectorComponent
  ],
})
export class MonthSelectorModule { }
