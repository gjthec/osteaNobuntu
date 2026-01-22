import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ExtraOptions, RouterModule } from '@angular/router';
import { appRoutes } from './app-routing.module';
import { NgxMaskModule } from 'ngx-mask';
import { TranslocoRootModule } from './transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './core/azure/auth/auth.module';
import { IconsModule } from './core/icons/icons.module';
import { appInitProviders } from './app.config';
import { ServiceWorkerModule } from '@angular/service-worker';


const routerConfig: ExtraOptions = { 
    scrollPositionRestoration: 'enabled' 
}; 

@NgModule({ 
  declarations: [ 
    AppComponent, 
  ],
  imports: [ 
    BrowserModule, 
        BrowserAnimationsModule, 
        RouterModule.forRoot(appRoutes, routerConfig), 
        NgxMaskModule.forRoot(), 
		AuthModule, 
		IconsModule, 
        HttpClientModule, 
    TranslocoRootModule,
    SharedModule,
		ServiceWorkerModule.register('ngsw-worker.js', { 
			enabled: !isDevMode(), 
			// Register the ServiceWorker as soon as the application is stable 
			// or after 30 seconds (whichever comes first). 
			registrationStrategy: 'registerWhenStable:30000' 
		}) 
  ], 
  providers: [ 
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, 
		appInitProviders 
  ], 
  bootstrap: [AppComponent] 
}) 
export class AppModule { } 
