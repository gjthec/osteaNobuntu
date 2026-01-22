import { AfterViewInit, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { delay, takeUntil } from 'rxjs/operators';
import { Subject, take } from 'rxjs';

export interface ISelectorValue {
  pt: string;
  en: string;
  id: string;
}

@Component({
  selector: 'app-selector-input-field',
  templateUrl: './selector-input-field.component.html',
  styleUrls: ['./selector-input-field.component.scss']
})
export class SelectorInputFieldComponent implements AfterViewInit {
  /**
   * Título que será apresentado no componente
   */
  @Input() label: string;
  @Input() valuesList: ISelectorValue[];
  /**
   * Quantidade limite de itens que podem ser selecionados
   */
  @Input() selectItemsLimit: number;
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

  public inputValue = new FormControl<string | ISelectorValue | ISelectorValue[]>(null);


  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();
  constructor(
    private translocoService: TranslocoService
  ) { }

  ngAfterViewInit(): void {
    this.getDefaultValue();
    this.limitSelectedItems();
    this.inputValue.valueChanges.pipe(delay(0), take(1)).subscribe(() => {
      this.getIdsFromValues();
      this.getDataOnEdit();
    });
    // this.changeLanguage();
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

  // private changeLanguage(): void {
  //   this.translocoService.langChanges$.subscribe(() => {
  //     if(!this.valueObject) return;
  //     this.inputValue.setValue(this.valueObject[this.translocoService.getActiveLang()]);
  //   });
  // }

  /**
   * Limita a quantidade de itens selecionados
   */
  private limitSelectedItems(): void {
    this.inputValue.valueChanges.subscribe((values) => {
      if (this.inputValue.value === null) return;

      if (this.inputValue.value instanceof Array) {
        let selectedValues: Array<any> = this.inputValue.value;
        if (selectedValues.length > this.selectItemsLimit && this.selectItemsLimit > 1) {
          this.inputValue.setValue(selectedValues.slice(0, this.selectItemsLimit));
        }
      }
    });
  }

  private getIdsFromValues(): void {
    //Caso o valor seja um objeto. Pois ele vem assim quando é um valor vindo do subform
    if (this.inputValue.value instanceof Object && !Array.isArray(this.inputValue.value)) {
      this.inputValue.setValue(this.inputValue.value.id);
    }
    //Caso o valor seja um array de objetos. Pois ele vem assim quando é um valor vindo do subform
    if (this.inputValue.value instanceof Object && Array.isArray(this.inputValue.value)) {
      let ids = [];
      this.inputValue.value.forEach((item) => {
        ids.push(item.id);
      });
      this.inputValue.setValue(ids);
    }
  }

  getDefaultValue(): void {
    if (this.defaultValue) {
      this.inputValue.setValue(this.defaultValue);
    }
  }


  private getDataOnEdit(): void {
    let itens = [];
    if (!this.valuesList) return;
    if (!this.inputValue.value) return;
    this.valuesList.forEach((value) => {
      if (this.inputValue.value instanceof Object) {
        if (value === this.inputValue.value) {
          itens.push(value);
        }
      }
      if (value.id === this.inputValue.value) {
        itens.push(value);
      }
    });

    if (itens.length === 1) {
      let input = itens[0];
      this.inputValue.setValue(input);
    }
    if (itens.length > 1) {
      this.inputValue.setValue(itens);
    }
  }
}
