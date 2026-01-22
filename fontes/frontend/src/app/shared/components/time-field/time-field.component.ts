import { Component, Inject, Injector, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BaseFieldComponent } from '../base-field/base-field.component';

@Component({
  selector: 'app-time-field',
  templateUrl: './time-field.component.html',
  styleUrls: ['./time-field.component.scss']
})
export class TimeFieldComponent extends BaseFieldComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() label: string;
  @Input() charactersLimit: number;
  @Input() isRequired: boolean = false;
  @Input() className: string;
  /**
   * Valor padrão do campo
   */
  @Input() defaultValue: string;
  /**
     * Condicao de visibilidade do campo.
     */
  @Input() conditionalVisibility: { field: string, values: string[] }
  /**
  * FormGroup do formulario.
  */
  @Input() resourceForm: FormGroup<any>;
  displayedLabel: string;
  selectedTime: string = ''; // Initial value or set based on requirements

  inputValue = new FormControl<string | null>(null, [
    Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  ]);

  private ngUnsubscribe = new Subject();

  constructor(protected injector: Injector, private dialog: MatDialog) {
    super(injector);
  }

  ngOnInit(): void {
    this.getDefaultValue();
    this.setLabel();
    this.checkConditional();
  }

  checkConditional() {
    if (this.conditionalVisibility) {
      // Verifica o valor inicial
      let initialFieldValue = this.resourceForm.get(this.conditionalVisibility.field)?.value;
      console.log('Initial field value:', initialFieldValue);
      if (initialFieldValue && typeof initialFieldValue === 'object' && initialFieldValue.id) {
        initialFieldValue = initialFieldValue.id;
      }
      if (initialFieldValue !== null && typeof initialFieldValue !== 'string') {
        initialFieldValue = initialFieldValue.toString();
      }
      if (this.conditionalVisibility.values.includes(initialFieldValue)) {
        if (this.inputValue.disabled) {
          this.inputValue.enable();
        }
      } else {
        if (this.inputValue.enabled) {
          this.inputValue.disable();
        }
      }


      // Observa mudanças no valor do resourceForm
      this.resourceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(formValues => {
        // Verifica todas as alterações dos campos de input 
        let fieldValue = formValues[this.conditionalVisibility.field];
        // Verifica se o valor é um objeto e pega o id
        if (fieldValue && typeof fieldValue === 'object' && fieldValue.id) {
          fieldValue = fieldValue.id;
        }
        // Transforma em string caso nao seja
        const fieldValueStr = fieldValue?.toString();
        if (this.conditionalVisibility.values.includes(fieldValueStr)) {
          // Caso o valor do fieldValue seja igual a algum de dentro do values ai é habilitado
          if (this.inputValue.disabled) {
            this.inputValue.enable();
          }
        } else {
          if (this.inputValue.enabled) {
            this.inputValue.disable();
          }
        }
      });
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(TimePickerDialogComponent, {
      width: '400px',
      data: { selectedTime: this.selectedTime || this.inputValue.value }  // Passa o valor atual ou selecionado
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.isValidTime(result)) {
        this.selectedTime = result;  // Armazena o tempo selecionado
        this.inputValue.setValue(result);  // Atualiza o valor do formulário
      }
    });
  }

  setLabel() {
    this.setTranslation(this.className, this.label).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (translatedLabel: string) => {
        if (translatedLabel === (this.className + "." + this.label)) {
          const formattedLabel = this.formatDefaultVariableName(this.label);
          this.displayedLabel = this.setCharactersLimit(formattedLabel, this.charactersLimit);
        } else {
          this.displayedLabel = this.setCharactersLimit(translatedLabel, this.charactersLimit);
        }
      },
      error: (error) => {
        this.displayedLabel = this.setCharactersLimit(this.label, this.charactersLimit);
      },
    });
  }

  getDefaultValue() {
    if (this.defaultValue) {
      this.selectedTime = this.defaultValue;  // Armazena o tempo padrão
      this.inputValue.setValue(this.defaultValue);  // Atualiza o valor do formulário
    } else if (this.inputValue.value) {
      this.selectedTime = this.inputValue.value;  // Armazena o tempo do valor existente
    }
  }

  validateTimeFormat(event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement).value;
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // Validates "HH:MM" format
    if (!regex.test(input) && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  formatTimeInput(value: string): string {
    // Remove any non-digit characters
    const cleanedValue = value.replace(/[^0-9]/g, '');

    if (cleanedValue.length <= 2) {
      // If only the hour part is present (1-2 digits)
      return cleanedValue;
    } else if (cleanedValue.length <= 4) {
      // Format as HH:MM if 3-4 digits are available
      return `${cleanedValue.slice(0, 2)}:${cleanedValue.slice(2)}`;
    } else {
      // Limit input to the first four digits (HHMM) if too many digits are entered
      return `${cleanedValue.slice(0, 2)}:${cleanedValue.slice(2, 4)}`;
    }
  }

  isValidTime(value: string): boolean {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(value);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit(): void {
    this.inputValue.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && this.isValidTime(value)) {
        this.selectedTime = value; // Assume que o valor é uma string no formato "HH:MM"
      }
    });

    // Atualiza o campo de entrada com o valor inicial
    if (this.inputValue.value) {
      if (typeof this.inputValue.value === 'string' && this.isValidTime(this.inputValue.value)) {
        this.selectedTime = this.inputValue.value;
      }
    }
  }

  onInputChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    const formattedInput = this.formatTimeInput(input);
    if (this.isValidTime(formattedInput)) {
      this.inputValue.setValue(formattedInput); // Atualiza o valor do formulário com o valor formatado
    }
  }
}

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-time-picker-dialog',
  templateUrl: './dialog-time-input.html',
  styleUrls: ['./dialog-time-input.scss']
})

export class TimePickerDialogComponent {
  @Input() title?: string;
  @Input() cancelLabel?: string;
  @Input() confirmLabel?: string;
  @Input() minTime?: string;
  @Input() maxTime?: string;
  selectedTime: string = '';
  selectedMinute: string = '';

  constructor(
    public dialogRef: MatDialogRef<TimePickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedTime = data.selectedTime || '12:00'; // Hora inicial padrão
    this.selectedMinute = this.selectedTime.split(':')[1]; // Pega os minutos da hora
  }

  onConfirm(): void {
    if (this.isValidTime(this.selectedTime)) {
      this.dialogRef.close(this.selectedTime); // Retorna o valor selecionado
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  adjustTime(amount: number, unit: 'hour' | 'minute'): void {
    let [hour, minute] = this.selectedTime.split(':').map(Number);

    if (unit === 'hour') {
      hour = (hour + amount) % 24; // Ajusta o valor da hora
      if (hour < 0) hour = 23;
    } else {
      minute = (minute + amount) % 60; // Ajusta o valor do minuto
      if (minute < 0) minute = 59;
    }

    this.selectedTime = `${this.padNumber(hour)}:${this.padNumber(minute)}`;
  }

  isValidTime(value: string): boolean {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(value);
  }

  padNumber(value: number): string {
    return value.toString().padStart(2, '0');
  }
}