import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { DateFieldComponent } from '../date-field/date-field.component';
import { FieldComponent } from '../field/field.component';

@Component({
  selector: 'app-default-card',
  templateUrl: './default-card.component.html',
  styleUrls: ['./default-card.component.scss'],
})
export class DefaultCardComponent implements AfterViewInit {
  @Input() itemDisplayed: any;
  /**
   * Nome da classe na qual o formulário pertence
   */
  @Input() className: string;
  @Input() columnsQuantity: number;
  @Input() displayedfieldsName: string[];
  @Input() fieldsType: string[];
  @Input() isEditable: boolean = true;
  @Input() visibleList: boolean[] = [];
  /**
   * Caso o campo for um objeto, será o nome do campo que está dentro do que será exibido.
   * [Exemplo]: O campo tem um objeto, esse objeto tem "id", "name" e "age". O campo apresentado poderá ser o "name", assim aparecerá o valor do campo "name" no componente.
   */
  @Input() objectDisplayedValue: string | null;
  @Input() userConfig: any;
  @Input() isSelectable: boolean = true;
  @Output() eventClick = new EventEmitter<void>();
  @Output() eventOnSelect = new EventEmitter<void>();
  @Output() eventClickToEdit = new EventEmitter<void>();

  columnsQuantityStyle;
  isSelected: boolean = false;

  @ViewChild('placeToRender', { read: ViewContainerRef })
  target!: ViewContainerRef;

  constructor() {}

  ngAfterViewInit(): void {
    this.createComponentsOnView();
  }

  get customStyle(): any {
    return {
      'grid-template-columns': `repeat(${this.columnsQuantity}, 1fr)`,
    };
  }

  createComponentsOnView() {
    setTimeout(() => {
      this.displayedfieldsName.forEach((fieldDisplayedName, index) => {
        this.createComponent(
          this.target,
          this.fieldsType[index],
          this.itemDisplayed[fieldDisplayedName],
          fieldDisplayedName,
          this.objectDisplayedValue[index],
          this.visibleList[index]
        );
      });
    }, 0);
  }

  /**
   * Cria o componente que irá apresentar as informações do item
   * @param target Referência onde deve ser criado o novo componente na tela
   * @param fieldType Tipo de campo que é a variável do item. Se é uma variável de data, texto ou outras opções.
   * [Exemplo]: "date", "text"
   * @param value Valor do campo.
   * [Exemplo]: O campo é "phone" e o valor é "9999999999" ou "nascimento" e o valor é "12/12/20"
   * @param labelTittle Titulo que o campo irá apresentar.
   * [Exemplo]: O nome do campo é "phone", então esse valor será apresentado para informar o valor do que está sendo apresentado.
   * @param objectDisplayedValue Caso o campo for um objeto, será o nome do campo que está dentro do que será exibido.
   * [Exemplo]: O campo tem um objeto, esse objeto tem "id", "name" e "age". O campo apresentado poderá ser o "name", assim aparecerá o valor do campo "name" no componente.
   */
  createComponent(
    target: ViewContainerRef,
    fieldType,
    value,
    labelTittle: string,
    objectDisplayedValue: string | null,
    visibleList: boolean
  ) {
    if (target == null) {
      console.error('Target not renderized in DefaultCard');
      return;
    }

    if (visibleList == false) {
      return;
    }

    let componentCreated;
    switch (fieldType) {
      case 'date': {
        componentCreated =
          this.target.createComponent(DateFieldComponent).instance;
        componentCreated.format = this.getFormatDateFromUserConfig();
        componentCreated.value = value;
        break;
      }
      case 'foreignKey': {
        componentCreated = this.createObjectField(objectDisplayedValue, value);
        break;
      }
      case 'object': {
        componentCreated = this.createObjectField(objectDisplayedValue, value);
        break;
      }
      case 'subform': {
        componentCreated = this.createObjectField(objectDisplayedValue, value);
        break;
      }
      default: {
        componentCreated = this.target.createComponent(FieldComponent).instance;
        componentCreated.value = value;
        break;
      }
    }

    componentCreated.label = labelTittle;
    componentCreated.className = this.className;
  }

  /**
   * Cria um campo que apresentará um objeto ou vários, apresentando somente um campo especificado
   * @param objectDisplayedValue Especificará o campo o objeto(s) que será apresentado. [Exemplo]: No objeto tem o campo "name", então ele será apresentado.
   * @param object Objeto que contém os campos e valores, sendo que um desses campos serão apresentados
   */
  createObjectField(objectDisplayedValue: string, object: object) {
    if (objectDisplayedValue == null || objectDisplayedValue == '') {
      console.error(
        'Campo de chave estrangeira não especificou o campo do objeto que será apresentado'
      );
      return;
    }

    let componentCreated: FieldComponent =
      this.target.createComponent(FieldComponent).instance;

    //Se não tiver valor, será apresentado um valor fixo
    if (object == null) {
      componentCreated.value = ' - ';
      return componentCreated;
    }

    //Verificar se tem a propriedade do valor que será apresentado

    let displayedValue: string;

    //Verifica se é um array
    if (object instanceof Array) {
      if (object.length == 0) {
        componentCreated.value = ' - ';
        return componentCreated;
      }
      if (object[0].hasOwnProperty(objectDisplayedValue) == false) {
        objectDisplayedValue = Object.getOwnPropertyNames(object[0])[0];
        displayedValue = object
          .map((item: any) => item[objectDisplayedValue])
          .join(', ');
      } else {
        displayedValue = object
          .map((item: any) => item[objectDisplayedValue])
          .join(', ');
      }
    } else {
      if (object.hasOwnProperty(objectDisplayedValue) == false) {
        //Caso o nome não for encontrado do campo, pega o promeiro
        const objectPropertyNames = Object.getOwnPropertyNames(object);
        objectDisplayedValue = objectPropertyNames[0];
      }
      displayedValue = object[objectDisplayedValue];
    }

    componentCreated.value = displayedValue;

    return componentCreated;
  }

  getFormatDateFromUserConfig() {
    if (this.userConfig == null) {
      return 'dd/MM/YY';
    }

    if (this.userConfig.dateFormat != null) {
      return this.userConfig.dateFormat;
    } else {
      return 'dd/MM/YY';
    }
  }

  getLanguageDateFromUserConfig() {
    if (this.userConfig == null) {
      return 'en';
    }

    if (this.userConfig.dateFormat != null) {
      return this.userConfig.language;
    } else {
      return 'en';
    }
  }

  onClick() {
    this.eventClick.emit(this.itemDisplayed);
  }

  selectItem(event: any | null) {
    this.eventOnSelect.emit(this.itemDisplayed);
  }

  onClickToEdit() {
    this.eventClickToEdit.emit(this.itemDisplayed);
  }
}
