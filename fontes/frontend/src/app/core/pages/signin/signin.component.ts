import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { RoleService } from 'app/core/auth/role.service';
import { IUser } from 'app/core/auth/user.model';
import { UserService } from 'app/core/auth/user.service';
import { TenantService } from 'app/core/tenant/tenant.service';
import { finalize, take } from 'rxjs';

/**
 * Estados da página
 */
enum SignInPageState {
  Redirecting,
  Error,
  SetEmail,
  SetPassword,
  CreatingAccount
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {

  /**
   * Formulário de acesso do usuário
   */
  passwordFormGroup: FormGroup = this._formBuilder.group({
    password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
  });

  emailFormGroup: FormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(120)]],
  });
  /**
   * Expondo o enum para o template
   */
  signInPageStates: typeof SignInPageState = SignInPageState;
  /**
   * Variável de controle de estado da página
   */
  pageState: SignInPageState = SignInPageState.SetEmail;
  /**
   * Variável de controle se está em carregamento a página
   */
  isLoading: boolean = false;
  /**
   * Controla a visibilidade da senha
   */
  passwordHide: boolean = false;
  passwordHideCheckBoxEnabled: boolean = true;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private tenantService: TenantService,
    private translocoService: TranslocoService,
    private roleService: RoleService,
    private router: Router,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
  }

  async checkEmailExist() {

    if (this.emailFormGroup.get("email").valid == false) {
      this.emailFormGroup.markAsDirty();
      return;
    }
    const email: string = this.emailFormGroup.value.email;

    this.emailFormGroup.get("email").disable();
    this.isLoading = true;

    this.authService.checkEmailExist(email).pipe(
      take(1),//O observador só irá existir até o momento que ouvir a primeira requisição, depois será eliminado

      //Quando o observable completa ou encontra um erro
      finalize(() => {
        this.isLoading = false;
        this.emailFormGroup.get("email").enable();
      }),
    ).subscribe({
      next: (_isValidEmail: boolean) => {

        if (_isValidEmail == true) {
          this.pageState = SignInPageState.SetPassword; // Se o email existe, vai para a etapa de senha
        } else {
          this.pageState = SignInPageState.CreatingAccount; // Se o email não existe, oferece criar uma conta
        }
      },
      error: (error) => {
        let checkEmailErrorMessage: string = this.translocoService.translate("core.sign-in-component.generic-error");

        if (error.status === 404) {
          checkEmailErrorMessage = this.translocoService.translate("core.sign-in-component.email-not-found");
        }

        if(error.status === 500){
          this.pageState = SignInPageState.Error;
        }

        const closeMessage = this.translocoService.translate('core.sign-in-component.close');

        this.snackBar.open(checkEmailErrorMessage, closeMessage, {
          duration: 3000,
        });
      }
    });
    
  }

  async signIn() {

    if (this.passwordFormGroup.valid == false) {
      return;
    }

    //Desabilitar campos de entrada
    this.passwordFormGroup.get("password").disable();
    this.passwordHideCheckBoxEnabled = false;
    this.isLoading = true;

    let user: IUser;

    const closeMessage = this.translocoService.translate('core.sign-in-component.close');

    this.authService.signin(this.emailFormGroup.value.email, this.passwordFormGroup.value.password).pipe(take(1)).subscribe({
      next:(value) => {
        user = value;

        this.userService.addUserOnLocalStorage(user);
        this.userService.setCurrentUserOnLocalStorage(user);
        this.userService.moveUserToFirstPositionOnLocalStorage(user.UID);
        this.authService.currentUser = user;
        this.tenantService.getTenantsAndSaveInLocalStorage(user.UID);
        this.roleService.getRolesUserByIdInLocalStorage(user.id);
    
        const signInSuccessMessage = this.translocoService.translate("core.sign-in-component.signIn-sucess");
        
        this.snackBar.open(signInSuccessMessage, closeMessage, {
          duration: 3000,
        }).afterDismissed().pipe(take(1)).subscribe({
          next: (value) => {
            this.router.navigate(['/home']);
          }
        });
      },

      error: (error) => {

        //Define o campo para permitir escrita
        this.passwordFormGroup.get("password").enable();
        this.passwordHideCheckBoxEnabled = true;
        this.isLoading = false;

        if(error.status === 500){
          this.pageState = SignInPageState.SetPassword;
        }

        if(error.status === 429){
          const manyIncorrectsignInMessage = this.translocoService.translate('core.sign-in-component.error-many-incorrect-signin-attempts');
          this.snackBar.open(manyIncorrectsignInMessage, closeMessage, {
            duration: 3000,
          });
          return;
        }

        const incorrectPasswordMessage = this.translocoService.translate('core.sign-in-component.incorrect-password');
        this.snackBar.open(incorrectPasswordMessage, closeMessage, {
          duration: 3000,
        });
        return
      },
    })
  }

  toggleVisibility() {
    this.passwordHide = !this.passwordHide;  // Alterna entre mostrar e ocultar a senha
  }

  goToSignUpPage() {
    this.router.navigate(['signup']);
  }

  resetPassword() {
    this.router.navigate(['resetPassword']);
  }

  goBackToLogin() {
    this.pageState = SignInPageState.SetEmail;
  }

}