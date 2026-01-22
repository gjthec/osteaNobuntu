import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from 'app/core/auth/user.model';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthFacade } from 'app/core/azure/auth/auth.facade';
import { IAuthUser } from 'app/core/azure/auth/models/auth.models';
import { ConfigService } from 'app/core/config/config.service';
import { take } from 'rxjs';

@Component({
  selector: 'user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
  /**
   * Controla se o painel de dados das contas de usuários está aberto
   */
  panelOpenState = false;
  /**
   * Controla o estado de acesso
   */
  isLoggedIn: boolean = false;
  /**
   * Sessão dos usuários
   */
  users: IUser[] = [];
  /**
   * Sessão dos usuários inativos
   */
  inactiveUsers: IUser[] = [];
  /**
   * Sessão do usuário atual que está realizando as requisições
   */
  // currentUser: IUser;
  currentUser: IAuthUser | IUser | null = null;
  userProfilePhotoEnabled: boolean = false;
  menus: { id: string, fileName: string }[] = JSON.parse(localStorage.getItem('menus') || '[]');
  currentMenuId: string = JSON.parse(localStorage.getItem('currentMenu') || '[]');

  constructor(
    private authService: AuthService,
    private authFacade: AuthFacade,
    private configService: ConfigService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.updateUserState();

    //Obtem a sessão de usuário atual para manipular o componente
    this.currentUser = this.configService.isNormal
      ? this.authService.currentUser
      : this.authFacade.getUser();
    //Obtem informação dos usuário com acesso
    if (this.configService.isNormal) {
      this.users = this.authService.getUsers() ?? [];
      this.inactiveUsers = this.authService.getInactiveUsers() ?? [];
    }
    //Obtem informações dos usuários com acesso mas não ativos
    // this.inactiveUsers = this.authService.getInactiveUsers();

    //TODO fazer isso só uma vez após o login pra não dar problema com a Azure
    // this.getUserProfilePhoto(this.currentUserSession.user.UID);

  }

  get firstName(): string {
    const name = this.displayName;
    if (!name) return '';
    // Pega até a vírgula ou espaço, o que vier primeiro
    let trimmed = name.split(',')[0].split(' ')[0];
    // Limita a 15 caracteres
    return trimmed.substring(0, 13);
  }

  get displayName(): string {
    if (!this.currentUser) {
      return '';
    }
    if (this.isAuthUser(this.currentUser) && this.currentUser.name) {
      return this.currentUser.name;
    }
    if (this.isAppUser(this.currentUser)) {
      const userName =
        [this.currentUser.firstName, this.currentUser.lastName]
          .filter(Boolean)
          .join(' ')
          .trim() || this.currentUser.userName;
      return userName || this.displayEmail;
    }
    return this.displayEmail;
  }

  get displayEmail(): string {
    if (!this.currentUser) {
      return '';
    }
    if (this.currentUser.email) {
      return this.currentUser.email;
    }
    return '';
  }

  get displayInitial(): string {
    const base = this.displayName || this.displayEmail;
    return base ? base[0] : '';
  }

  checkUserExpired(user: IUser) {

  }

  getInactiveUserDisplayName(user: IUser): string {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.userName;
    return name || user.email || '';
  }

  getInactiveUserInitial(user: IUser): string {
    const base = this.getInactiveUserDisplayName(user);
    return base ? base[0] : '';
  }

  private isAuthUser(user: IAuthUser | IUser): user is IAuthUser {
    return 'roles' in user;
  }

  private isAppUser(user: IAuthUser | IUser): user is IUser {
    return 'userName' in user;
  }

  setCurrentMenu(menu: { id: string, fileName: string }) {
    localStorage.setItem('currentMenu', JSON.stringify(menu));
    window.location.reload();
  }

  updateUserState() {
    if (this.configService.isNormal) {
      this.authService.check().pipe(take(1)).subscribe((res) => {
        this.isLoggedIn = res;
      });
      return;
    }
    this.isLoggedIn = this.authFacade.isAuthenticated();
  }

  goToSignInPage() {
    this.router.navigate(['signin']);
  }

  goToEditUserPage(): void {
    this.router.navigate(['editProfile']);
  }

  goToManageAccountPage(): void {

  }

  // isCurrentUser(user: IUser): boolean {
  //   if (this.currentUser.UID == user.UID) {
  //     return true;
  //   }

  //   return false;
  // }
  /*
  switchCurrentUser(user: IUser) {

    //Se por acaso tentar mudar a sessão do usuário para o mesmo usuário, não irá poder fazer isso
    if (this.isCurrentUser(user) == true) {
      return null;
    }

    this.authService.switchUser(user.UID);

    //Atualiza o sessão de usuário atual
    this.currentUser = this.authService.currentUser;
    //Atualiza a lista de sessões de usuário inativas
    this.inactiveUsers = this.authService.getInactiveUsers();

    window.location.reload();
  }
  */
  async signOutUser() {
    try {
      if (this.configService.isNormal) {
        await this.authService.signOutAllUsers();
        this.router.navigate(['/signin']);
        return;
      }
      await this.authFacade.logout();
      this.router.navigate(['/']);
    } catch (error) {
      console.error("Error to logout");
    }
  }
  /*
  signOutAllUsers() {
    this.authService.signOutAllUsers().then(() => {
      this.router.navigate(['/signin']); // Redirecionar para a página inicial
    });
  }
  */
  /*
   async getUserProfilePhoto(userUID: string) {
     this.userService.getUserProfilePhoto(userUID).pipe(take(2)).subscribe({
       next: (value) => {
         this.userProfilePhotoEnabled = true;
       },
       error: (error) => {
         this.userProfilePhotoEnabled = false;
       },
     })
   }
   */
}
