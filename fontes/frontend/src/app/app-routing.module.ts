import { Route } from '@angular/router';
import { SideNavComponent } from './shared/components/side-nav/side-nav.component';
import { EditProfileComponent } from './shared/components/edit-profile/edit-profile.component';
import { DefaultDashboardComponent } from './shared/components/default-dashboard/default-dashboard.component';
import { environment } from '../environments/environment';
import { createAuthGuard } from './core/auth/guards/guard.factory';

const publicRoutes: Route[] = [ 
	{ 
		path: '', 
		pathMatch: 'full', 
		loadChildren: () => 
			import('app/core/pages/home-page/home-page.module').then( 
				(m) => m.HomePageModule 
			) 
        }, 
	{ 
		path: 'error-404', 
		loadChildren: () => 
			import('app/core/pages/error/error-404/error-404.module').then( 
				(m) => m.Error404Module 
			) 
	}, 
	{ 
		path: 'error-500', 
		loadChildren: () => 
			import('app/core/pages/error/error-500/error-500.module').then( 
				(m) => m.Error500Module 
			) 
	}, 
	{ 
		path: 'callback', 
		loadChildren: () => 
			import('app/core/pages/callback/callback.module').then( 
				(m) => m.CallbackModule 
			) 
	}, 
	{ 
		path: 'home', 
		canActivate: [createAuthGuard],
		component: SideNavComponent 
	}, 
	{ 
		path: 'tenant', 
		canActivate: [createAuthGuard], 
		component: SideNavComponent, 
		children: [ 
			{ 
				path: '', 
				loadChildren: () => 
					import('app/core/tenant/tenant.module').then((m) => m.TenantModule) 
			} 
		] 
	} 
]; 
const loginRoutes: Route[] = [ 
	{ 
		path: 'signin', 
		loadChildren: () => 
			import('app/core/pages/signin/signin.module').then((m) => m.SigninModule) 
	}, 
	{ 
		path: 'signup', 
		loadChildren: () => 
			import('app/core/pages/signup/signup.module').then((m) => m.SignupModule) 
	}, 
        { 
		path: 'resetPassword', 
		loadChildren: () => 
			import('app/core/pages/reset-password/reset-password.module').then( 
				(m) => m.ResetPasswordModule 
			) 
	} 
]; 

const protectedRoutes: Route[] = [ 
	// Rotas que precisa de acesso 
	// Admin routes 
	{ 
		path: '', 
		canActivate: [createAuthGuard],
		component: SideNavComponent, 
		children: [ 
			{ path: 'dashboard/:id', component: DefaultDashboardComponent }, 
			{ 
				path: 'editProfile', 
				pathMatch: 'full', 
				component: EditProfileComponent 
			},
	{ path: 'pacientes', loadChildren: () => import('./modules/paciente/paciente.module' ).then(m => m.PacienteModule) },
	{ path: 'AvaliacoesColunaLombar', loadChildren: () => import('./modules/avaliacao/avaliacao.module' ).then(m => m.AvaliacaoModule) },
	{ path: 'agenda', loadChildren: () => import('./modules/agenda/agenda.module' ).then(m => m.AgendaModule) },
		] 
	} 
]; 


export const appRoutes: Route[] = [ 
	...publicRoutes, 
	...protectedRoutes, 
	...(environment.authMethod == 'NORMAL' ? loginRoutes : []), 
	{ 
		path: '**', 
		loadChildren: () => 
			import('app/core/pages/error/error-404/error-404.module').then( 
				(m) => m.Error404Module 
			) 
	} 
];
