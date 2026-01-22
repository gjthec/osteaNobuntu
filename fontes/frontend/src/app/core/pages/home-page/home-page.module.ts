import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageRoutingModule } from './home-page-routing.module';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

import { HomePageComponent } from './home-page.component';
//Angular Material Components
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

//Nobuntu Components
import { ChangeLanguageButtonModule } from 'app/shared/components/change-language-button/change-language-button.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
	declarations: [HomePageComponent],
	imports: [
		CommonModule,
		HomePageRoutingModule,
		TranslocoModule,
		//Angular Material Components
		MatToolbarModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		//Nobuntu Components
		ChangeLanguageButtonModule
	],
	providers: [{ provide: TRANSLOCO_SCOPE, useValue: { scope: '', alias: '' } }]
})
export class HomePageModule {}
