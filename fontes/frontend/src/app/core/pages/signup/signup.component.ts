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

  nameForm: INameForm = { firstName: 'Tesla', lastName: 'Eletronico' };
  passwordForm: IPasswordForm = { password: 'adminN123@', confirmPassword: 'adminN123@' };
  birthDayAndGenderForm: IBirthDayAndGenderForm = {
    birthDay: 15,
    birthMonth: 1,
    birthYear: 1990,
    gender: 0
  };

  emailFormGroup: FormGroup = this._formBuilder.group({
    email: ['teslaeletronico@gmail.com', [Validators.required, Validators.minLength(3), Validators.maxLength(60), Validators.email]],
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
    this.snackBar.open('Verificação de e-mail desativada. Continue para criar sua conta.', 'Fechar', {
      duration: 3000,
    });
    this.pageState = SignUpPageState.SetPassword;
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
      invitedTenantsToken: ''
    }).pipe(take(1)).subscribe({
      next: (value) => {
        this.snackBar.open('Conta criada com exito', 'Fechar', {
          duration: 3000,
        });
        this.isLoading = false;
        this.emailFormGroup.enable();
        this.router.navigate(['/signin']);
      },

      error: (error) => {

        console.log(error);

        this.emailFormGroup.enable();
        this.isLoading = false;

        this.snackBar.open('Erro inesperado ao realizar o cadastro.', 'Fechar', {
          duration: 3000,
        });
        this.isLoading = false;
        this.emailFormGroup.enable();
      },
    })
  }
}
