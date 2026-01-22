import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent extends BaseFieldComponent implements OnInit, OnDestroy{
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
  @Input() value: string;
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

  constructor(protected injector: Injector){
    super(injector);
  }

  ngOnInit(): void {
    this.setLabel();
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

  get getValue(): string{
    return this.setCharactersLimit(this.value, this.charactersLimit);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
