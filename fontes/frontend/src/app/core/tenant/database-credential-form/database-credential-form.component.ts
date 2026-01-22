import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { DatabaseCredentialService } from '../databaseCredential.service';
import { TenantService } from '../tenant.service';
import { take } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tenant } from '../tenant.model';
import { Router } from '@angular/router';

interface DataBaseType {
  name: string;
}

@Component({
  selector: 'app-database-credential-form',
  templateUrl: './database-credential-form.component.html',
  styleUrls: ['./database-credential-form.component.scss']
})
export class DatabaseCredentialFormComponent implements OnInit {

  /**
  * Variável de controle se está em carregamento a página
  */
  isLoading: boolean = false;

  databaseTypes: DataBaseType[] = [
    { name: "mysql" },
    { name: "postgres" }
  ];

  tenant = new FormControl('');

  tenantsUserHavePermission: Tenant[];

  userHasTenant: boolean = true;

  databaseCredentialFormGroup: FormGroup = this._formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    type: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    host: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    port: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]*$')]],
    srvEnabled: ['', [Validators.required]],
    options: [''],
    storagePath: [''],
    sslEnabled: [true, [Validators.required]],

    //SSL data
    sslCertificateAuthority: [''],
    sslPrivateKey: [''],
    sslCertificate: [''],
  });

  constructor(
    private _formBuilder: FormBuilder,
    private databaseCredentialService: DatabaseCredentialService,
    private translocoService: TranslocoService,
    private snackBar: MatSnackBar,
    private tenantService: TenantService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getTenantsUserHavePermission();
    this.changeSSLFields();
  }

  getTenantsUserHavePermission() {
    const currentUser = this.authService.currentUser;

    if (currentUser == null) {
      throw Error("Error to get tenants user have permission. Current user is null.");
      return;
    }

    this.tenantService.getTenantsUserIsAdmin(currentUser.UID).pipe(take(1)).subscribe({
      next: (tenants: Tenant[]) => {
        this.tenantsUserHavePermission = tenants;
      },
      error: (error) => {
        // throw Error("Error to get tenants user have permission. "+ error);
        this.userHasTenant = false;
      },
    });
  }

  changeSSLFields(){
    this.databaseCredentialFormGroup.get('sslEnabled').valueChanges.subscribe((sslEnabled) => {
      if (!sslEnabled) {
        this.databaseCredentialFormGroup.get('sslCertificateAuthority')?.disable();
        this.databaseCredentialFormGroup.get('sslPrivateKey')?.disable();
        this.databaseCredentialFormGroup.get('sslCertificate')?.disable();
      } else {
        this.databaseCredentialFormGroup.get('sslCertificateAuthority')?.enable();
        this.databaseCredentialFormGroup.get('sslPrivateKey')?.enable();
        this.databaseCredentialFormGroup.get('sslCertificate')?.enable();
      }
    });
  }

  registerNewDatabaseCredential() {

    if (this.databaseCredentialFormGroup.valid == false) {
      return Error("Erro ao registrar o as credenciais do banco de dados!");
    }

    this.isLoading = true;
    this.databaseCredentialFormGroup.disable();

    // criar Tenant, definir as credentiais 
    let closeMessage: string = this.translocoService.translate("core.sign-in-component.close");

    //TODO ao tentar realizar o registro, deverá ser feito o teste de conectividade, posteiriormente retornado a resposta para cá
    this.databaseCredentialService.create(
      // {
      //   databaseName: this.registerNewTenantFormGroup.get('databaseName').value,
      //   databaseType: this.registerNewTenantFormGroup.get('databaseType').value,
      //   databaseUsername: this.registerNewTenantFormGroup.get('databaseUsername').value,
      //   databasePassword: this.registerNewTenantFormGroup.get('databasePassword').value,
      //   databaseHost: this.registerNewTenantFormGroup.get('databaseHost').value,
      //   databasePort: this.registerNewTenantFormGroup.get('databasePort').value,
      // }
      this.databaseCredentialFormGroup.value
    ).pipe(
      //Depos de recebido dados 1 vez o observable é encerrado
      take(1),
    ).subscribe({
      next: (value) => {
        this.isLoading = false;
        this.databaseCredentialFormGroup.enable();
        this.databaseCredentialFormGroup.reset();
        console.log(value);

        let registerDatabaseCredentialSuccessMessage: string = this.translocoService.translate("core.database-credential-form.registerSuccess");
        //TODO irá recarregar a pagina do usuário, adicionando o tenant ao controle de tenants para ser usado o ID no HTTP interceptor
        this.snackBar.open(registerDatabaseCredentialSuccessMessage, closeMessage, {
          duration: 3000,
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.databaseCredentialFormGroup.enable();
        console.log(error);

        let registerDatabaseCredentialErrorMessage: string = this.translocoService.translate("core.database-credential-form.generic-error");

        //TODO irá apresentar a mensagem de erro ao não ter conseguido adicionar o tenant, seja por erro ao salvar ou ao tentar conectar com o tenant
        this.snackBar.open(registerDatabaseCredentialErrorMessage, closeMessage, {
          duration: 3000,
        });

      },
    })
  }

  goToCreateTenantPage(){
    this.router.navigate(['/tenant/add']);
  }
}
