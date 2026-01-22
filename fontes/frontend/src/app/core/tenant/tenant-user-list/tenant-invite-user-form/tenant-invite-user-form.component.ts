import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';
import { take } from 'rxjs';
import { TenantService } from '../../tenant.service';

@Component({
  selector: 'app-tenant-invite-user-form',
  templateUrl: './tenant-invite-user-form.component.html',
  styleUrls: ['./tenant-invite-user-form.component.scss']
})
export class TenantInviteUserFormComponent {

  emailFormGroup: FormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(120)]],
  });
  /**
  * Variável de controle se está em carregamento a página
  */
  isLoading: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private tenantService: TenantService
  ) {

  }

  async sendInvite() {
    

    if (this.emailFormGroup.get("email").valid == false) {
      this.emailFormGroup.markAsDirty();
      return;
    }

    this.isLoading = true;
    this.emailFormGroup.get("email").disable();

    const invitedUserEmail: string = this.emailFormGroup.value.email;
    //Pega os dados do localstorage
    let invitingUserEmail: string = this.authService.currentUser.email;
    //TODO mudar o tenant id para number
    let tenantId: number = Number(this.tenantService.currentTenant.tenant.id);
    let databaseCredentialId: number = Number(this.tenantService.currentTenant.databaseCredentialId);


    this.tenantService.inviteUserToTenant(invitingUserEmail, invitedUserEmail, tenantId, databaseCredentialId).pipe(take(1)).subscribe({
      next: (value) => {

        this.emailFormGroup.get("email").enable();
        this.emailFormGroup.get("email").setValue("");
        this.isLoading = false;

        this.snackBar.open("Usuário convidado. Foi enviado um email para o usuário.", "Fechar", {
          duration: 3000,
        }).afterDismissed().pipe(take(1)).subscribe({
          next: (value) => {

          }
        });
      },
      error: (error) => {
        console.log(error);

        this.emailFormGroup.get("email").enable();
        this.isLoading = false;

        this.snackBar.open("Erro ao convidar usuário.", "Fechar", {
          duration: 3000,
        }).afterDismissed().pipe(take(1)).subscribe({
          next: (value) => {

          }
        });
      },
    });

  }

}
