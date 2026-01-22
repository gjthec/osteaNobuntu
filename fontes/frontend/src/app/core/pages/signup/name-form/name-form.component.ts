import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface INameForm {
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'name-form',
  templateUrl: './name-form.component.html',
  styleUrls: ['./name-form.component.scss']
})
export class NameFormComponent implements OnInit {
  /**
   * Campo para inserçào dos dados
   */
  @Input() inputData: INameForm;

  //Campos de saída
  @Output() onFieldsChange = new EventEmitter<INameForm>();

  //Campos de saída
  @Output() buttonFunction = new EventEmitter<boolean>();

  nameFormGroup: FormGroup;

 
  constructor(
    private _formBuilder: FormBuilder,
  ){
    this.nameFormGroup = this._formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    });
  }

  ngOnInit(): void {
    // Preenche o formulário com os dados recebidos do componente pai
    this.nameFormGroup.patchValue(this.inputData);
    
    // Ouve mudanças nos campos
    this.nameFormGroup.valueChanges.subscribe(value => {
      this.onFieldsChange.emit(value);
    });
  }

  checkName(){
    if(this.nameFormGroup.valid == true){
      //Irá enviar os dados obtidos para o componente pai
      this.buttonFunction.emit();
    }
  }

  focusNextInputField(event: KeyboardEvent, nextInput: HTMLInputElement): void {
    event.preventDefault();
    nextInput.focus();
  }
}
