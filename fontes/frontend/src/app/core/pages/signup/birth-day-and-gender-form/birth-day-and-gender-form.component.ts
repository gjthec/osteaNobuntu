import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { INameForm } from '../name-form/name-form.component';

export interface IBirthDayAndGenderForm {
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  gender: number;
}

@Component({
  selector: 'birth-day-and-gender-form',
  templateUrl: './birth-day-and-gender-form.component.html',
  styleUrls: ['./birth-day-and-gender-form.component.scss']
})
export class BirthDayAndGenderFormComponent implements OnInit {
  /**
   * Campo para inserçào dos dados iniciais
   */
  @Input() inputData: INameForm;

  //Campos de saída
  @Output() onFieldsChange = new EventEmitter<INameForm>();

  //Campos de saída
  @Output() buttonFunction = new EventEmitter<boolean>();

  birthDayAndGenderFormGroup: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
  ) {
    this.birthDayAndGenderFormGroup = this._formBuilder.group({
      birthDay: ['', [Validators.required]],
      birthMonth: ['', [Validators.required]],
      birthYear: ['', [Validators.required]],
      gender: ['', [Validators.required]],//Male, Famela, Custom, Rather not to say
    });
  }

  //TODO traduzir isso com o transloco
  genderList: string[] = [
    "Homem",
    "Mulher",
    "Eu prefiro não dizer"
  ]

  ngOnInit(): void {
    // Preenche o formulário com os dados recebidos do componente pai
    this.birthDayAndGenderFormGroup.patchValue(this.inputData);

    // Ouve mudanças nos campos
    this.birthDayAndGenderFormGroup.valueChanges.subscribe(value => {
      this.onFieldsChange.emit(value);
    });
  }

  checkDate() {
    if (this.validateDate(this.birthDayAndGenderFormGroup.value.birthDay, this.birthDayAndGenderFormGroup.value.birthMonth, this.birthDayAndGenderFormGroup.value.birthYear) == true) {
      this.buttonFunction.emit();
    }
  }

  //TODO fazer função validadora de data
  validateDate(day: number, month: number, year: number): boolean {

    
    if(day == undefined || month == undefined || year == undefined){
      this.birthDayAndGenderFormGroup.get('birthDay')?.setErrors({ invalidFormat: true });
      return false;
    }

    // Verificar se o mês é válido (entre 1 e 12)
    if (month < 1 || month > 12) {
      this.birthDayAndGenderFormGroup.get('birthMonth')?.setErrors({ invalidFormat: true });
      return false;
    }
    
    if (this.isYearAfter100YearsAgo(year) == false || this.isYearBefore18YearsAgo(year) == false) {
      this.birthDayAndGenderFormGroup.get('birthYear')?.setErrors({ invalidFormat: true });
      return false;
    }
    

    // Dias máximos permitidos em cada mês
    const daysInMonth: number[] = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Verificar se o dia é válido para o mês e ano dados
    if (day < 1 || day > daysInMonth[month - 1]) {
      this.birthDayAndGenderFormGroup.get('birthDay')?.setErrors({ invalidFormat: true });
      return false;
    }

    // Se todas as verificações passaram, a data é válida
    return true;

  }

  // Função para verificar se o ano é bissexto
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  isYearBefore18YearsAgo(year: number): boolean {
    const currentYear = new Date().getFullYear();
    const year18YearsAgo = currentYear - 18;
  
    if(year < year18YearsAgo){
      return true;
    }

    return false;
  }

  isYearAfter100YearsAgo(year: number): boolean{
    const currentYear = new Date().getFullYear();
    const year100YearsAgo = currentYear - 100;
  
    if(year > year100YearsAgo){
      return true;
    }

    return false;
  }

  getDataFromMonthForm(month: number){
    this.birthDayAndGenderFormGroup.patchValue({birthMonth: month});
  }

}
