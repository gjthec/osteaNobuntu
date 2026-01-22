import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SigninRoutingModule } from './signin-routing.module';
import { SigninComponent } from './signin.component';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

//Angular Material Components
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
//Nobuntu Components
import { ChangeLanguageButtonModule } from 'app/shared/components/change-language-button/change-language-button.module';

@NgModule({
  declarations: [
    SigninComponent,
  ],
  imports: [
    CommonModule,
    SigninRoutingModule,
    TranslocoModule,
    //Angular Material Components
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatCheckboxModule,
    //Nobuntu components
    ChangeLanguageButtonModule
  ],
  providers: [
    { provide: TRANSLOCO_SCOPE, useValue: { scope: "core", alias: "core" } }
  ],
})
export class SigninModule { }