import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { take } from 'rxjs';
import { INameForm } from './name-form/name-form.component';
import { IBirthDayAndGenderForm } from './birth-day-and-gender-form/birth-day-and-gender-form.component';
import { IPasswordForm } from './password-form/password-form.component';
import { IUser } from 'app/core/auth/user.model';
import { TenantService } from 'app/core/tenant/tenant.service';
import { UserService } from 'app/core/auth/user.service';

/**
 * Estados da página
 */
enum SignUpPageState {
  Redirecting,
  Error,
  SetName,
  SetBirthDayAndGender,
  SetEmail,
  ValidateEmailVerificationCode,
  SetPassword,
  CreatingAccount
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  nameForm: INameForm;
  passwordForm: IPasswordForm;
  birthDayAndGenderForm: IBirthDayAndGenderForm;

  emailFormGroup: FormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60), Validators.email]],
  });

  emailVerificationCodeFormGroup: FormGroup = this._formBuilder.group({
    emailVerificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  /**
    * Expondo o enum para o template
    */
  signUpPageStates: typeof SignUpPageState = SignUpPageState;
  /**
   * Variável de controle de estado da página
   */
  pageState: SignUpPageState = SignUpPageState.SetName;
  /**
   * Variável de controle se está em carregamento a página
   */
  isLoading: boolean = false;


  codeSent: boolean = false;
  codeVerified: boolean = false;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private tenantService: TenantService,
    private snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {

  }

  getDataFromNameForm(data: INameForm) {
    this.nameForm = data;
  }

  getDataFromBirthDayAndGenderForm(data: IBirthDayAndGenderForm) {
    this.birthDayAndGenderForm = data;
  }

  getPasswordFromPasswordForm(data: IPasswordForm) {
    this.passwordForm = data;
  }

  passToSetBirthDayAndGenderPageState() {
    this.pageState = SignUpPageState.SetBirthDayAndGender;
  }

  passToSetEmailPageState() {
    this.pageState = SignUpPageState.SetEmail;
  }

  checkEmailIsUsed() {

  }

  sendVerificationCodeToEmail() {
    if (this.emailFormGroup.get("email").valid == false) {
      return null;
    }

    this.snackBar.dismiss(); // Limpa qualquer mensagem anterior
    const email: string = this.emailFormGroup.value.email;
    this.emailFormGroup.get("email").disable;
    this.isLoading = true;

    this.authService.sendVerificationEmailCodeToEmail(email).pipe(
      take(1),
    ).subscribe({
      next: (data) => {

        this.snackBar.open('Código de verificação enviado com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.pageState = SignUpPageState.ValidateEmailVerificationCode;
      },
      error: (error) => {

        this.emailFormGroup.get("email").enable;
        this.isLoading = false;

        if (error.status == 409) {
          this.snackBar.open('Erro ao enviar código. Código já enviado para o email.', 'Fechar', {
            duration: 3000,
          });
          this.pageState = SignUpPageState.ValidateEmailVerificationCode;
        } else if (error.status == 500) {
          this.router.navigate(['/error']);
        } else {
          this.snackBar.open('Erro ao enviar código. Por favor, tente novamente.', 'Fechar', {
            duration: 3000,
          });
        }
      },
    });
  }

  validateEmailVerificationCode() {
    if (this.emailVerificationCodeFormGroup.valid == false) {
      return null;
    }

    this.snackBar.dismiss(); // Limpa qualquer mensagem anterior

    const verificationEmailCode: string = this.emailVerificationCodeFormGroup.get("emailVerificationCode").value;

    this.emailVerificationCodeFormGroup.get("emailVerificationCode").disable;

    this.authService.validateVerificationEmailCode(verificationEmailCode).pipe(
      take(1),
    ).subscribe({
      next: () => {
        this.snackBar.open('Código verificado com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.pageState = SignUpPageState.SetPassword;
      },
      error: (error) => {

        if (error.status == 500) {
          this.router.navigate(['/error-500']);
        }

        this.emailVerificationCodeFormGroup.get("emailVerificationCode").enable;

        this.snackBar.open('Erro ao verificar código. Por favor, tente novamente.', 'Fechar', {
          duration: 3000,
        });
      }
    });
  }

  async registerNewUser() {

    this.snackBar.dismiss(); // Limpa qualquer mensagem anterior
    this.emailFormGroup.disable();
    this.isLoading = true;

    this.authService.signup({
      email: this.emailFormGroup.value.email,
      password: this.passwordForm.password,
      firstName: this.nameForm.firstName,
      lastName: this.nameForm.lastName,
      userName: this.nameForm.firstName,
    }).pipe(take(1)).subscribe({
      next: (value) => {
        this.snackBar.open('Conta criada com exito', 'Fechar', {
          duration: 3000,
        });

        //Realizar o acesso do novo usuário
        this.authService.signin(this.emailFormGroup.value.email, this.passwordForm.password).pipe(take(1)).subscribe({
          next: (value) => {
            let user: IUser = value;

            this.userService.addUserOnLocalStorage(user);
            this.userService.setCurrentUserOnLocalStorage(user);
            this.userService.moveUserToFirstPositionOnLocalStorage(user.UID);
            this.authService.currentUser = user;
            this.tenantService.getTenantsAndSaveInLocalStorage(user.UID);

            this.router.navigate(['/home']);
          },
          error: (error) => {
            this.snackBar.open('Erro inesperado ao realizar o cadastro.', 'Fechar', {
              duration: 3000,
            });
            this.router.navigate(['/error-505']);
          },
        })
      },

      error: (error) => {

        console.log(error);

        this.emailFormGroup.enable();
        this.isLoading = false;

        this.snackBar.open('Erro inesperado ao realizar o cadastro.', 'Fechar', {
          duration: 3000,
        });
        this.router.navigate(['/error-505']);
      },
    })
  }
}