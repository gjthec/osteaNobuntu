import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ISelectorValue } from '../selector-input-field/selector-input-field.component';
import { TranslocoService } from '@ngneat/transloco';
import { BaseFieldComponent } from '../base-field/base-field.component';

@Component({
  selector: 'app-selector-field',
  templateUrl: './selector-field.component.html',
  styleUrls: ['./selector-field.component.scss']
})
export class SelectorFieldComponent extends BaseFieldComponent implements OnInit, OnDestroy {
  /**
   * Nome da classe que pertence esse campo.\
   * Exemplo: "Products".
   */
  @Input() className: string;
  /**
   * Campo de título desse campo.\
   * Exemplo: "Name".
   */
  @Input() label: string;
  /**
   * Valor apresentado no campo.
   */
  @Input() value: string | ISelectorValue | ISelectorValue[];
  /**
   * Quantidade máxima de letras.\
   * Exemplo: 255.
   */
  @Input() charactersLimit : number;
  /**
   * Label que será apresentada no titulo desse campo
   */
  displayedLabel: string;
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();
  /**
    * Todos os campos que podem ser selecionados.
    */
  @Input() valuesList: ISelectorValue[];

  constructor(protected injector: Injector){
    super(injector);
  }

  ngOnInit(): void {
    this.setLabel();
    this.getDisplayedItens();
  }

  setLabel() {
    this.setTranslation(this.className, this.label).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (translatedLabel: string) => {
        if(translatedLabel === (this.className+"."+this.label)){
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

    /**
   * Retorna os itens selecionados
   */
    private getDisplayedItens(): void {
      let itens = [];
      if(!this.valuesList) return;
      if (!this.value) return;
      this.valuesList.forEach((value) => {
        if (value.id === this.value) {
          itens.push(value);
        }
      });

      if (itens.length === 1) {
        let input = itens[0];
        this.value = input;
      }
      if (itens.length > 1) {
        this.value = itens;
      }
    }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
