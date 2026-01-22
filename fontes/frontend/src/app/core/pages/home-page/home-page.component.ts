import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacade } from 'app/core/azure/auth/auth.facade';
import { TenantService } from 'app/core/tenant/tenant.service';
import { ConfigService } from 'app/core/config/config.service';
import type { AuthMethod } from 'app/core/config/config.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  // método/variante: 'MSAL' = rmzk | 'NORMAL' = nobuntu
  variant: AuthMethod = 'NORMAL';

  // usados apenas pela variante MSAL
  loading = false;
  error = '';

  constructor(
    private cfg: ConfigService,
    private authFacade: AuthFacade, // usado no login da MSAL
    private tenantService: TenantService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.variant = this.cfg.authMethod; // vem do environment
  }

  // -- AÇÕES NORMAL (Nobuntu) --
  goToSignInPage(): void {
    this.router.navigate(['signin']);
  }
  goToSignUpPage(): void {
    this.router.navigate(['signup']);
  }

  // -- AÇÃO MSAL (RMZK) --
  async login(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const success = await this.authFacade.login();
      if (success) {

        console.log("login foi um sucesso?: ", success);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

        // Obtem dados de Tenants que o usuário tem acesso
        this.tenantService.getTenantsAndSaveInLocalStorage(this.authFacade.getUser().UID);

        this.router.navigateByUrl(returnUrl);
      } else {
        this.error = 'Falha na autenticação';
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro desconhecido';
    } finally {
      this.loading = false;
    }
  }
}
