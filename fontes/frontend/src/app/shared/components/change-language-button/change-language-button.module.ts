import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeLanguageButtonComponent } from './change-language-button.component';
//Angular Material Modules
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    ChangeLanguageButtonComponent,
  ],
  imports: [
    CommonModule,
    MatMenuModule
  ],
  exports: [
    ChangeLanguageButtonComponent
  ]
})
export class ChangeLanguageButtonModule { }
