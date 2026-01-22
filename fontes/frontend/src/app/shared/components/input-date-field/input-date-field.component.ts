import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';

@Component({
  selector: 'app-input-date-field',
  templateUrl: './input-date-field.component.html',
  styleUrls: ['./input-date-field.component.scss']
})
export class InputDateFieldComponent extends BaseFieldComponent implements OnInit, OnDestroy {
  /**
   * Campo de título desse campo.
   */
  @Input() label: string;
  /**
   * Quantidade máxima de letras.\
   * Exemplo: 255.
   */
  @Input() charactersLimit: number;
  /**
   * É preciso preencher o campo.\
   * Exemplo: true.
  */
  @Input() isRequired: boolean = false;
  /**
  * Nome da classe que pertence esse campo.
  */
  @Input() className: string;
  /**
   * Label que será apresentada no titulo desse campo
   */
  displayedLabel: string;
  /**
     * Condicao de visibilidade do campo.
     */
  @Input() conditionalVisibility: { field: string, values: string[] }
  /**
  * FormGroup do formulario.
  */
  @Input() resourceForm: FormGroup<any>;


  inputValue = new FormControl<Date | null>(null);
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();
  /**
   * Valor padrão do campo.
  */
  @Input() defaultValue: Date | null = null;
  /**
   * Campo de formulário que é usado para apresentar para o usuário o valor da data definida. Esse campo tem a intenção de se modificar para ficar amigável ao usuário, não sendo o valor enviado para a API.
   */
  displayedInput = new FormControl('');

  mask: string = '00/00/0000'; // Formato de data padrão
  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.getDefaultValue();
    this.setLabel();
    this.checkConditional();
    this.observersInputValue();
  }

  observersInputValue() {
    this.inputValue.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      // Se o valor já está no formato DD/MM/YYYY, apenas atualiza o displayedInput

      if (!value) {
        return;
      }

      if (typeof value === 'string') {
        const dataMoment = moment.utc(value); 
        this.displayedInput.setValue(dataMoment.format('DD/MM/YYYY'));
      } else if (value) {
        const dataMoment = moment(value);
        if (dataMoment.isValid()) {
          this.displayedInput.setValue(dataMoment.format('DD/MM/YYYY'));
        } else {
          this.displayedInput.setValue('');
        }
      } else {
        this.displayedInput.setValue('');
      }
    });
  }

  checkConditional() {
    if (this.conditionalVisibility) {
      // Verifica o valor inicial
      let initialFieldValue = this.resourceForm.get(this.conditionalVisibility.field)?.value;
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
      this.inputValue.setValue(this.defaultValue);
    }
  }

  /**
   * Irá aplicar o máscara no campo apresentado para o usuário e também no campo de valor que é enviado para API.
   * @param event Dados do evento do componente de MatDatepicker (componente do Angular Material) que contém a data que é selecionada pelo usuário.
   */
  applyMaskOnInput(event: MatDatepickerInputEvent<moment.Moment>) {
    if (event.value) {
      const data = event.value;
      const dataMoment = moment(data);
      if (dataMoment.isValid()) {
        // Atualiza o valor do input mascarado com a data formatada
        this.inputValue.setValue(dataMoment.toDate());
        this.displayedInput.setValue(dataMoment.format('DD/MM/YYYY')); // Formata a data para o formato dd/mm/aaaa
      } else {
        // Se a data for inválida, limpa o formControl principal
        this.inputValue.setValue(null);
        this.displayedInput.setValue(''); // Limpa o campo de entrada mascarada
      }
    }
  }

  // Função 2: Chamada quando o usuário digita no campo e sai dele (blur).
  // O valor do input da máscara (visível) atualiza o datepicker (escondido).
  atualizarValorDatePicker() {
    const valorDigitado = this.displayedInput.value;
    // Verifica se a data digitada é válida e completa (ex: 10 caracteres para dd/mm/aaaa)
    if (valorDigitado && valorDigitado.length === 8) {
      const data = moment(valorDigitado, 'DD/MM/YYYY');
      if (data.isValid()) {
        this.inputValue.setValue(data.toDate());
      } else {
        // Se a data for inválida (ex: 32/13/2024), limpa o formControl principal
        console.error('Data inválida:', valorDigitado);
        this.inputValue.setValue(null);
        this.displayedInput.setValue(''); // Limpa o campo de entrada mascarada
      }
    } else {
      this.inputValue.setValue(null);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
