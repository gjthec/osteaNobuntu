import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TenantService } from '../tenant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tenant-form',
  templateUrl: './tenant-form.component.html',
  styleUrls: ['./tenant-form.component.scss']
})
export class TenantFormComponent {

  /**
  * Variável de controle se está em carregamento a página
  */
  isLoading: boolean = false;

  tenantFormGroup: FormGroup = this._formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
  });

  constructor(
    private _formBuilder: FormBuilder,
    private tenantService: TenantService,
    private router: Router
  ) { }

  registerNewTenant(){
    this.isLoading = true;
    this.tenantFormGroup.disable();

    this.tenantService.create(this.tenantFormGroup.value).subscribe({
      next: (value) => {
        this.isLoading = false;
        this.tenantFormGroup.reset();
        this.tenantFormGroup.enable();

        this.goToTenantPage();
      },
      error: (error) => {
        this.isLoading = false;
        this.tenantFormGroup.enable();
        console.log(error);
      }
    })
  }

  goToTenantPage(){
    this.router.navigate(['/tenant/']);
  }
}
