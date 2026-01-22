import { Directive, Injector } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';

@Directive()
export abstract class BaseFieldComponent {
  public translocoService: TranslocoService;

  constructor(protected injector: Injector){
    this.translocoService = this.injector.get(TranslocoService);
  }

  /**
   * Realiza a tradução do valor com base no nome
   * @param className nome da classe. Sendo no arquivo JSON do transloco.\
   * {
   *  <className>:{ value: textosEmPortugues }
   * }
   * @param value
   * {
   *  className:{ <value>: textosEmPortugues }
   * }
   * @returns Observador que irá retornar a string caso a opção de linguagem atual do transloco seja alterada
   */
  setTranslation(className: string, value: string): Observable<string>{
    return this.translocoService.selectTranslate(className + '.' + value);
  }

  /**
   * Faz o controle do limite do tamanho de caracteres de um valor.
   * @param value valor string a ser alterado.
   * @param charactersLimit limite de characteres que o valor poderá ter, maior que isso será cortado. 
   * @returns valor string com limite de caracteres.
   */
  setCharactersLimit(value: string, charactersLimit: number = 40): string {
    if(value == null) return null;
    if(charactersLimit == null) return value;
    if(typeof value == 'number') return value;

    const data = value.toString();

    if(data.length == 0) return null;

    if (data.length <= charactersLimit) {
      return data;
    } else {
      return data.substring(0, charactersLimit) + '...';
    }
  }

  formatDefaultVariableName(variableName: string): string {
    const words = variableName.split(/(?=[A-Z])/);

    // Capitalize a primeira letra de cada palavra e junte-as com um espaço
    const formattedName = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return formattedName;
  }
}
