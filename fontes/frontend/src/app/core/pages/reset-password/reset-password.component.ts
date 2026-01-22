import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/auth/user.service';
import { finalize, take } from 'rxjs';

/**
 * Estados da página
 */
enum ResetPasswordPageState {
  Redirecting,
  Error,
  SetEmail,
  SetPassword,
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  emailFormGroup: FormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(120)]],
  });

  /**
   * Formulário de alteração de senha do usuário
   */
  resetPasswordFormGroup: FormGroup = this._formBuilder.group({
    password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
  });

  codeSent: boolean = false;
  codeVerified: boolean = false;

  resetPasswordToken: string;

  /**
    * Expondo o enum para o template
    */
  resetPasswordPageStates: typeof ResetPasswordPageState = ResetPasswordPageState;
  /**
   * Variável de controle de estado da página
   */
  pageState: ResetPasswordPageState = ResetPasswordPageState.SetEmail;
  /**
  * Controla a visibilidade da senha
  */
  passwordHide: boolean = false;
  passwordHideCheckBoxEnabled: boolean = true;
  /**
  * Variável de controle se está em carregamento a página
  */
  isLoading: boolean = false;


  constructor(
    // private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getResetPasswordTokenFromUrl();
  }

  private getResetPasswordTokenFromUrl(): void {
    this.route.queryParamMap.subscribe(params => {
      this.resetPasswordToken = params.get('emailVerificationCode');

      console.log('Código encontrado na URL:', this.resetPasswordToken);
      if (this.resetPasswordToken != null) {
        //Se tive o código no parametro, vai direcionar para parte de trocar a senha
        this.pageState = ResetPasswordPageState.SetPassword;
      }

    });
  }

  onChangePasswordLinkSubmit() {
    console.log(this.emailFormGroup.valid);
    if (this.emailFormGroup.valid == false) {
      return;
    }

    this.authService.sendPasswordResetLinkToEmail(this.emailFormGroup.get("email").value).pipe(take(1)).subscribe({
      next: (value) => {
        this.snackBar.open('Envio de link para recuperação de senha requisitado!', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar']
        });
      },
      error: (error) => {
        console.log("error to request password change: ", error);
        this.snackBar.open('Erro no envio de link para recuperação de senha!', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar']
        });
      },
    })
  }

  onChangePasswordSubmit() {
    if (this.isPasswordEqual() == false) {
      this.snackBar.open('Password do not match!', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar']
      });

      return;
    }

    this.isLoading = true;
    //TODO inabilitar os campos de inserir senha e botão para habilitar depois

    this.authService.resetPassword(
      this.resetPasswordFormGroup.value.password,
      this.resetPasswordToken
    ).pipe(take(1)).subscribe({
      next: (value) => {
        this.isLoading = false;
        
        this.snackBar.open('Senha redefinida com sucesso!', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['login']); // Redireciona para a tela de login
      },
      error: (error) => {
        this.isLoading = false;

        console.log(error);
        this.snackBar.open('Erro ao redefinir a senha', 'Close', {
          duration: 3000,
        });
      },
    });

    

  }

  isPasswordEqual(): boolean {
    if (this.resetPasswordFormGroup.value.password !== this.resetPasswordFormGroup.value.confirmPassword) {
      return false;
    }

    return true;
  }
}
