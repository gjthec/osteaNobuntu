import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { MenuService } from 'app/shared/services/menu.service';
import { TitleService } from 'app/shared/services/title.service';
import { environment } from 'environments/environment';
import { User } from 'oidc-client-ts';
import {
  Observable,
  Subject,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { MenuChoiceComponent } from './menu-choice/menu-choice.component';

export interface INavList {
  config: INavListConfig;
  itens: INavListOption[];
  id: string;
  fileName: string;
}

interface INavListConfig {
  modified: string;
  name: string;
  type: boolean;
}

/**
 * Interface que contém informações das opções de vavegação do sideNavBar
 * @param routeUrl Rota que o usuário será levado ao selecionar a opção
 * @param optionName Nome da opção. @example "Product"
 * @param svgIcon Caminho para o icone da opcão. @example "feather:box"
 */
interface INavListOption {
  name: string;
  routeUrl: string;
  optionName: string;
  icon: string;
  isSubmenu?: boolean;
  subMenu?: INavListOption[];
}

@Component({
  selector: 'side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy {
  selectedView: string = 'card'; // Valor padrão para 'card'

  /**
   * Opções que são apresentadas na lista lateral para navegar para outras paginas da aplicação
   */
  navListOptions: INavListOption[];
  /**
   * Título que será apresentada no cabeçário da aplicação.
   */
  applicationTitle: string = environment.applicationTitle;
  /**
   * Texto que aparecerá no topo da navegador lateral.
   */
  menuTitle: string = 'Menu';

  isHandset$: Observable<boolean>;
  /**
   * Define se o sideNavBat (navegador lateral) está aberto ou não,
   */
  sideNavBarIsOpened: boolean = false;
  /**
   * Define se é permitido fechar a sideNavBar (navegador lateral).
   */
  canCloseNavBar: boolean = true;
  /**
   * Define se pose ser apresentado o botão do logOut (sair do acesso a conta)
   */
  canShowLogOutButton: boolean = false;
  /**
   * Define se o usuário atual pode ter controle para qual Tenant ele usará nas suas operações com a API
   */
  canUserControlTenant: boolean = true;
  /**
   * Define se será possível mudança de tenant na aplicação
   */
  enableTenantSwitch: boolean = false;

  private ngUnsubscribe = new Subject<void>();

  currentUser: User;
  constructor(
    private breakpointObserver: BreakpointObserver,
    private menuService: MenuService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: TitleService,
    private dialog: MatDialog,
  ) { 
    this.titleService.subTitulo$.subscribe(titulo => {
      this.applicationTitle = titulo;
    });
  }

  ngOnInit(): void {

    this.enableTenantSwitch = environment.enableTenantSwitch;

    const userString = localStorage.getItem('currentUser');
    this.currentUser = userString ? JSON.parse(userString) : [];
    //arrumar o email e a senha do currentUser
    // this.authService.loginCredential("teslaeletronico@gmail.com","adminN123")
    this.route.queryParams.subscribe(async (params) => {
      const userId = params['userId'];
      if (userId) {
        await this.authService.switchUser(userId);
        this.router.navigate(['']);
      }
    });

    this.getDataToMenu().subscribe((data: INavList[]) => {
    }, (error) => {
      console.error('Erro ao buscar menu:', error);
    });

    this.showLogOutButton();
  }

  closeSideNavBar() {
    if (this.canCloseNavBar == true) {
      this.sideNavBarIsOpened = false;
    }
  }

  /**
   * Obtem dados do JSON para contrução do menu de navegação da aplicação
   * @returns Retorna um array com informações para criar o menu de navegação.
   */
  getDataToMenu(): Observable<INavList[]> {
    if (localStorage.getItem('currentMenu')) {
      return this.getDataToMenuLocalStorage(JSON.parse(localStorage.getItem('currentMenu')));
    }
    return this.menuService.getMenuByRole().pipe(
      tap({
        next: (data: INavList[]) => {
          this.menuAccessible(data);
        },
        error: (error) => {
          console.error('Erro ao buscar menu:', error);
        },
      })
    );
  }

  /**
   * Obtem dados do JSON para contrução do menu de navegação da aplicação
   * @returns Retorna um array com informações para criar o menu de navegação.
   */
  getDataToMenuLocalStorage(menu: {fileName: string, id: string}): Observable<INavList[]> {
    return this.menuService.getMenuByFileName(menu.fileName).pipe(
      tap({
      next: (data: INavList) => {
        let dataInArray = [data];
        this.menuAccessible(dataInArray);
      },
      error: (error) => {
        this.menuService.getMenuById(menu.id).subscribe({
        next: (data: INavList[]) => {
          this.menuAccessible(data);
        },
        error: (error) => {
          console.error('Erro ao buscar menu pelo ID:', error);
        },
        });
        console.error('Erro ao buscar menu pelo fileName:', error);
      },
      }),
      map((data: INavList) => [data]),
      take(1),
    ).pipe(
      tap({
      error: () => {
      },
      }),
      switchMap((data) => data.length ? [data] : this.menuService.getMenuById(menu.id).pipe(
      tap({
        next: (data: INavList[]) => {
        this.menuAccessible(data);
        },
        error: (error) => {
        console.error('Erro ao buscar menu pelo ID:', error);
        },
      })
      ))
    );
  }

  getDataToMenuDefault(): Observable<INavList[]> {
    return this.menuService.getDefaultMenu().pipe(
      tap({
        next: (data: INavList[]) => {
        },
        error: (error) => {
          console.error('Erro ao buscar menu:', error);
        },
      })
    );
  }

  /**
   * Metodo que pega os ambientes que o usuário tem acesso e 
   */
  menuAccessible(menus: INavList[]): void {
    if (menus.length === 0) {
      this.getDataToMenuDefault().subscribe((defaultMenus: INavList[]) => {
        if (defaultMenus.length > 0) { 
          this.menuAccessible(defaultMenus);
        }
      });
    }
    if (menus.length === 1) {
      this.navListOptions = menus[0].itens;
      this.menuTitle = menus[0].config.name;
      if(!localStorage.getItem('menus')) {
        localStorage.setItem('currentMenu', JSON.stringify({fileName: menus[0].fileName, id: menus[0].id}));
        localStorage.setItem('menus', JSON.stringify([{id: menus[0].id, fileName: menus[0].fileName}]));
      }
    }
    if (menus.length > 1) {
      this.dialog.open(MenuChoiceComponent, {
        data: { environments: menus },
        disableClose: true,
        autoFocus: false,
        panelClass: 'custom-dialog-container',
      }).afterClosed().subscribe((selectedEnvironment: INavList) => {
        if (selectedEnvironment) {
          this.navListOptions = selectedEnvironment.itens;
          this.menuTitle = selectedEnvironment.config.name;
          localStorage.setItem('currentMenu', JSON.stringify({fileName: selectedEnvironment.fileName, id: selectedEnvironment.id}));
          const menusLocalStorage: {id: string, fileName: string}[] = menus.map((menu) => ({
            id: menu.id,
            fileName: menu.fileName,
          }));
          localStorage.setItem('menus', JSON.stringify(menusLocalStorage));
        }
      });
    }
  }

  showLogOutButton() {
    this.authService
      .check()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (isAuthorized: boolean) => {
          this.canShowLogOutButton = isAuthorized;
        },
        error: (error) => {
          this.canShowLogOutButton = false;
        },
      });
  }

  redirectToSignInPage() {
    this.saveRedirectURL(this.router.url);
    this.router.navigate(['signin']);
  }

  private saveRedirectURL(redirectURL: string) {
    localStorage.setItem('redirectURL', redirectURL);
  }
  
  onViewChange(viewType: string) {
    this.selectedView = viewType; // Atualiza a exibição com base no botão clicado
  }
  switchAccount(): void {
    // this.authService.switchAccount();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
