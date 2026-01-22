import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignupComponent } from './signup.component';
import { SignUpRoutingModule } from './signup-routing.module';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

//Angular Material Components
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
//Nobuntu Components
import { ChangeLanguageButtonModule } from 'app/shared/components/change-language-button/change-language-button.module';
import { NameFormComponent } from './name-form/name-form.component';
import { BirthDayAndGenderFormComponent } from './birth-day-and-gender-form/birth-day-and-gender-form.component';
import { PasswordFormComponent } from './password-form/password-form.component';
import { MonthSelectorModule } from 'app/shared/components/month-selector/month-selector.module';

@NgModule({
  declarations: [
    SignupComponent,
    NameFormComponent,
    BirthDayAndGenderFormComponent,
    PasswordFormComponent
  ],
  imports: [
    CommonModule,
    SignUpRoutingModule,
    TranslocoModule,
    //Angular Material Components
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    //Nobuntu components
    ChangeLanguageButtonModule,
    MonthSelectorModule
  ],
  providers: [
    { provide: TRANSLOCO_SCOPE, useValue: { scope: "core", alias: "core" } }
  ],
})
export class SignupModule { }