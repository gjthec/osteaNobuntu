import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Error500Component } from './error-500.component';
import { error500Routes } from './error-500.routing';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';
//Angular Material Components
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

//Nobuntu Components
import { ChangeLanguageButtonModule } from 'app/shared/components/change-language-button/change-language-button.module';

@NgModule({
  declarations: [
    Error500Component
  ],
  imports: [
    //Definir uso do Transloco nas páginas ligadas a esse módulo
    TranslocoModule,
    RouterModule.forChild(error500Routes),
    //Angular Material Components
    MatToolbarModule,
    MatButtonModule,
    //Nobuntu Components
    ChangeLanguageButtonModule
  ],
  providers: [
    //Definir uso do Transloco nas páginas ligadas a esse módulo
    { provide: TRANSLOCO_SCOPE, useValue: { scope: "core", alias: "core" } }
  ],
})
export class Error500Module
{
}
