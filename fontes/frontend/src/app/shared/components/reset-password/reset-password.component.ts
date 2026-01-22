import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/auth/user.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  email: string = '';
  verificationCode: string = '';
  password: string = '';
  confirmPassword: string = '';

  codeSent: boolean = false;
  codeVerified: boolean = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) { }

  onEmailSubmit() {
    this.authService.sendPasswordResetLinkToEmail(this.email).pipe(take(1)).subscribe({
      next(response: any) {
        console.log(response.message);
        this.codeSent = true;
      },
      error(error) {
        console.error('Erro ao enviar código:', error.error.message);
        this.snackBar.open('Erro ao enviar o código de verificação', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar']
        });
      },
    })

  }

  onCodeSubmit() {
    // this.userService.validateVerificationEmailCode(this.verificationCode).pipe(take(1)).subscribe({
    //   next(response: any) {
    //     console.log(response.message);
    //     this.codeVerified = true;
    //   },
    //   error(error) {
    //     console.error('Erro ao verificar código:', error.error.message);
    //     this.snackBar.open('Erro ao verificar o código', 'Close', {
    //       duration: 3000,
    //       panelClass: ['custom-snackbar']
    //     });
    //   },
    // });
  }

  onResetSubmit() {
    if (this.password !== this.confirmPassword) {
      this.snackBar.open('Passwords do not match!', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    const resetPasswordPayload = {
      email: this.email,
      password: this.password
    };

    // this.applicationService.resetPassword(resetPasswordPayload)
    //   .subscribe(
    //     (response: any) => {
    //       console.log('Password reset successfully!', response);
    //       this.snackBar.open('Senha redefinida com sucesso!', 'Close', {
    //         duration: 3000,
    //       });
    //       this.router.navigate(['login']); // Redireciona para a tela de login
    //     },
    //     (error) => {
    //       console.error('Erro ao redefinir senha!', error);
    //       this.snackBar.open('Erro ao redefinir a senha', 'Close', {
    //         duration: 3000,
    //       });
    //     }
    //   );
  }
}
