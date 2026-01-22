import { Component, OnInit } from '@angular/core';
import { ApplicationService, Application } from 'app/shared/services/application.service';
import { AuthService } from 'app/core/auth/auth.service';
import { UserManager } from 'oidc-client-ts';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmChangeAppComponent } from './confirm-change-app/confirm-change-app.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-list-apps',
  templateUrl: './list-apps.component.html',
  styleUrls: ['./list-apps.component.scss']
})
export class ListAppsComponent implements OnInit {
  customData: any = null;
  showAppMenu: boolean = false;
  selectedApp: Application | null = null;
  apps: Application[] = [];
  private userManagerParameter: UserManager;

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchApps();
    
    this.authService
      .check()
      .pipe(take(1))
      .subscribe({
        next: (isAuthorized: boolean) => {
          if(isAuthorized == true){
            this.fetchApps();
          }
            
        },
        error: (error) => {
          
        },
      });
  }

  toggleAppMenu() {
    this.showAppMenu = !this.showAppMenu;
  }

  fetchApps() {
    this.applicationService.getApplications().subscribe({
      next: (value) => {
        this.apps = value;
      },
      error: (error) => {
        console.error('Erro ao buscar aplicativos:', error);
      },
    });
  }

  /**
  * Redireciona o usuário para outra aplicação
  **/
  async openApp(app: Application) {

    this.dialog.open(ConfirmChangeAppComponent, {
      data: {
        app: app
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        const user = this.authService.currentUser;
        if (user) {
          // Redirecionar para o aplicativo com o usuário codificado na URL
          const redirectUrl = `${app.redirect_uri}`;
          window.open(redirectUrl, '_blank');

        } else {
          // this.authService.login();
        }
      }
    });

  }

  private saveRedirectURL(redirectURL: string) {
    localStorage.setItem("redirectURL", redirectURL);
  }

  closeApp() {
    this.selectedApp = null;
  }
}
