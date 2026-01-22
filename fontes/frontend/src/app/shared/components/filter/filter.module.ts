import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResourceFilterComponent } from './base-resource-filter.component';
import { FilterBooleanComponent } from './filter-boolean/filter-boolean.component';
import { FilterEntityComponent } from './filter-entity/filter-entity.component';
import { FilterNumberWithConditionsComponent } from './filter-number-with-conditions/filter-number-with-conditions.component';
import { FilterPeriodComponent } from './filter-period/filter-period.component';
import { FilterTextComponent } from './filter-text/filter-text.component';
import { FilterMenuComponent } from './filter-menu/filter-menu.component';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

//Angular Material
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { FilterFormComponent } from './filter-form/filter-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FilterOptionComponent } from './filter-option/filter-option.component';

@NgModule({
  declarations: [
    BaseResourceFilterComponent,
    FilterBooleanComponent,
    FilterEntityComponent,
    FilterNumberWithConditionsComponent,
    FilterPeriodComponent,
    FilterTextComponent,
    FilterFormComponent,
    FilterMenuComponent,
    FilterOptionComponent
  ],
  imports: [
    CommonModule,
    TranslocoModule,
    //Angular Material Components
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  providers: [
    { provide: TRANSLOCO_SCOPE, useValue: { scope: "components", alias: "componentsBase" } },
  ],
  exports: [
    BaseResourceFilterComponent,
    FilterMenuComponent
  ]
})
export class FilterModule { }
