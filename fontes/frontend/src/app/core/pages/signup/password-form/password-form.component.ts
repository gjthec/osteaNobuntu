import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { passwordStrengthValidator } from 'app/core/validators/passwordStregth.validator';

export interface IPasswordForm {
  password: string,
}

@Component({
  selector: 'password-form',
  templateUrl: './password-form.component.html',
  styleUrls: ['./password-form.component.scss']
})
export class PasswordFormComponent {
  /**
  * Campo para inserçào dos dados
  */
  @Input() inputData: IPasswordForm;

  //Campos de saída
  @Output() onFieldsChange = new EventEmitter<IPasswordForm>();

  //Campos de saída
  @Output() buttonFunction = new EventEmitter<boolean>();

  passwordFormGroup: FormGroup;

  confirmPasswordIsEqualPassword: boolean;
  /**
  * Controla a visibilidade da senha
  */
  passwordHide: boolean = false;
  passwordHideCheckBoxEnabled: boolean = true;

  constructor(
    private _formBuilder: FormBuilder,
  ) {

    this.passwordFormGroup = this._formBuilder.group({
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required, passwordStrengthValidator()]],
    });
    
  }

  ngOnInit(): void {
    // Preenche o formulário com os dados recebidos do componente pai
    this.passwordFormGroup.patchValue(this.inputData);

    // Ouve mudanças nos campos
    this.passwordFormGroup.valueChanges.subscribe(value => {
      this.onFieldsChange.emit(value);
    });
  }

  checkPassword() {
    if (this.passwordFormGroup.valid == false) {
      return null;
    }

    if(this.passwordFormGroup.get("password").value === this.passwordFormGroup.get("confirmPassword").value){
      //Irá enviar os dados obtidos para o componente pai
      this.buttonFunction.emit();
    } else {
      this.confirmPasswordIsEqualPassword = false;
    }
  }

  toggleVisibility() {
    this.passwordHide = !this.passwordHide;  // Alterna entre mostrar e ocultar a senha
  }

}