import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { Subject, takeUntil } from 'rxjs';

interface IconOption {
  nome: string;
  valor: number;
}

@Component({
  selector: 'app-avaliacao-field',
  templateUrl: './avaliacao-field.component.html',
  styleUrls: ['./avaliacao-field.component.scss']
})
export class AvaliacaoFieldComponent extends BaseFieldComponent implements OnInit {
  @Input() label: string;
  @Input() charactersLimit: number;
  @Input() isRequired: boolean = false;
  @Input() className: string;
  @Input() icones: IconOption[] = [];
  @Input() numberOfIcons: number[] = []; // Valor padrão para stars
  /**
    * Condicao de visibilidade do campo.
    */
  @Input() conditionalVisibility: { field: string, values: string[] }
  /**
  * FormGroup do formulario.
  */
  @Input() resourceForm: FormGroup<any>;
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();

  inputValue = new FormControl<number | null>(null, this.isRequired ? Validators.required : null);
  selectedIcon: IconOption | null = null; 
  showSelector: boolean = true; 
  icone: string;
  valueSelected: number = 0;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.icone = this.icones[0].nome;
    this.initializeStars();
    this.checkConditional();
    if (this.inputValue.value !== null) {
      this.selectedIcon = this.icones.find(icon => icon.valor === this.inputValue.value) || null;
      this.showSelector = false; 
    }
  }

  initializeStars(): void {
    if (this.numberOfIcons.length === 0) {
      this.numberOfIcons = Array.from({ length: 5 }, (_, i) => i + 1); // Valor padrão de 5 estrelas se não for fornecido
    }
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
        console.log('Initial field value is in conditional values, enabling input');
        if (this.inputValue.disabled) {
          this.inputValue.enable();
        }
      } else {
        console.log('Initial field value is not in conditional values, disabling input');
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
        console.log('Field value changed:', fieldValueStr);
        if (this.conditionalVisibility.values.includes(fieldValueStr)) {
          // Caso o valor do fieldValue seja igual a algum de dentro do values ai é habilitado
          console.log('Field value is in conditional values, enabling input');
          if (this.inputValue.disabled) {
            this.inputValue.enable();
          }
        } else {
          console.log('Field value is not in conditional values, disabling input');
          if (this.inputValue.enabled) {
            this.inputValue.disable();
          }
        }
      });
    }
  }
  selectIcon(star: number): void {
    this.inputValue.setValue(star);
    this.valueSelected = this.inputValue.value;
    console.log('Selected star value:', this.valueSelected);
    this.showSelector = false; 
  }

  showIconSelector(): void {
    this.showSelector = true; 
  }

  rate(value: number): void {
    this.inputValue.setValue(value);
  }
}