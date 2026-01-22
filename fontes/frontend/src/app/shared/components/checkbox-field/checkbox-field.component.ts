import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BaseFieldComponent } from '../base-field/base-field.component';

@Component({
  selector: 'app-checkbox-field',
  templateUrl: './checkbox-field.component.html',
  styleUrls: ['./checkbox-field.component.scss']
})
export class CheckboxFieldComponent extends BaseFieldComponent implements OnInit, OnDestroy {
  /**
   * Label que será apresentada no titulo desse campo
   */
  displayedLabel: string;
  /**
     * Nome da classe que pertence esse campo.
     */
  @Input() className: string;
  /**
   * Campo de título desse campo.
   */
  @Input() label: string;
  /**
   * É preciso preencher o campo.\
   * Exemplo: true.
   */
  @Input() isRequired: boolean = false;
  /**
   * Quantidade máxima de letras.\
   */
  @Input() charactersLimit: number;
  /**
 * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
 */
  private ngUnsubscribe = new Subject();
  /**
* Valor padrão do campo
*/
  @Input() defaultValue: boolean;
  /**
     * Condicao de visibilidade do campo.
     */
  @Input() conditionalVisibility: { field: string, values: string[] }
  /**
  * FormGroup do formulario.
  */
  @Input() resourceForm: FormGroup<any>;

  /**
   * Campo que retorna o valor do checkbox.
   * @example true
  */
  public inputValue = new FormControl<boolean>(false);


  constructor(injector: Injector) {
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
        console.log("erro do transloco:" + error)
        this.displayedLabel = this.setCharactersLimit(this.label, this.charactersLimit);
      },
    });
  }

  getDefaultValue() {
    if (this.defaultValue != null) {
      console.log(this.defaultValue);
      this.inputValue.setValue(this.defaultValue);
    } else {
      this.inputValue.setValue(false);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  onChange(event: any) {
    this.inputValue = event.target.inputValue;
  }


}
