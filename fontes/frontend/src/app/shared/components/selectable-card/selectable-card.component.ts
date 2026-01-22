import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { DateFieldComponent } from '../date-field/date-field.component';
import { FieldComponent } from '../field/field.component';
import { SelectorFieldComponent } from '../selector-field/selector-field.component';
import { UploadFieldComponent } from '../upload-field/upload-field.component';

@Component({
  selector: 'selectable-card',
  templateUrl: './selectable-card.component.html',
  styleUrls: ['./selectable-card.component.scss'],
})
export class SelectableCardComponent implements AfterViewInit, OnInit {

  /**
   * Campo com os dados do item que será apresenados na lista.
   * @example ['nome':'Maria', 'idade':'44'].
   */
  @Input() itemDisplayed: any;
  /**
   * Nome da classe na qual o formulário pertence.
   * @example "Produto".
   */
  @Input() className: string;
  /**
   * Quantidade de colunas que esse Card terá.
   * @example "3".
   * Em telas de dispositivos móveis, sempre será 1.
   */
  @Input() columnsQuantity: number;
  @Input() displayedfieldsName: string[];
  @Input() fieldsType: string[];
  @Input() userConfig: any;
  @Input() isCheckBox: boolean = true;
  @Input() isSingleOption: boolean = false;
  @Input() attributes: any;
  @Input() isSelectable: boolean = true;
  @Input() isEditable: boolean = false;
  @Input() visibleList: boolean[] = [];
  @Input() classFather: string;
  @Input() isSubForm: boolean = false;
  @Input() objectDisplayedValue: string | null;
  @Output() eventClick = new EventEmitter<void>();
  @Output() eventOnSelect = new EventEmitter<void>();
  @Output() eventClickToEdit = new EventEmitter<void>();
  
  gridStyles = {};

  @Input() isSelected: boolean = false;

  @ViewChild('placeToRender', { read: ViewContainerRef }) target!: ViewContainerRef;
  viewMode: any;

  constructor() {
  }
  ngOnInit(): void {
    if (this.itemDisplayed == null) throw new Error("ItemDisplayed is null");

    this.gridStyles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${this.columnsQuantity}, 1fr)`,
    gap: '8px'
    }
  }

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
      this.displayedfieldsName.forEach((fieldDisplayedName, index)=>{
        this.createComponent(this.target, this.fieldsType[index], this.itemDisplayed[fieldDisplayedName], fieldDisplayedName, this.objectDisplayedValue[index], index, this.visibleList[index]);
      });
    }, 0);
  }

  createComponent(target: ViewContainerRef , fieldType, value, labelTittle: string, objectDisplayedValue: string | null, index: number, visibleList: boolean){
    
    if (target == null) {
      console.error("Target not renderized in DefaultCard");
      return;
    }

    if(fieldType == 'manyToOne') {
      return;
    }

    if (visibleList == false) {
      return;
    }

    if (this.isSubForm && this.classFather.toLowerCase() == labelTittle.toLowerCase()) {
      return;
    }

    let componentCreated;
    switch (fieldType) {

      case 'date': {
        componentCreated = this.target.createComponent(DateFieldComponent).instance;
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
      case 'boolean': {
        componentCreated = this.target.createComponent(FieldComponent).instance;
        componentCreated.value = value;
        break;
      }
      case 'selector': {
        componentCreated = this.target.createComponent(SelectorFieldComponent).instance;
        componentCreated.valuesList = this.attributes[index].optionList;
        componentCreated.value = value;
        break;
        // componentCreated = this.target.createComponent(FieldComponent).instance;
        // componentCreated.value = value;
        // break;
      }
      case 'upload': {
        componentCreated = this.target.createComponent(UploadFieldComponent).instance;
        componentCreated.value = value;
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
    if (objectDisplayedValue == null || objectDisplayedValue == "") {
      console.error("Campo de chave estrangeira não especificou o campo do objeto que será apresentado");
      return;
    }

    let componentCreated: FieldComponent = this.target.createComponent(FieldComponent).instance;

    //Se não tiver valor, será apresentado um valor fixo
    if (object == null) {
      componentCreated.value = " - ";
      return componentCreated;
    }

    //Verificar se tem a propriedade do valor que será apresentado


    let displayedValue: string;

    //Verifica se é um array
    if (object instanceof Array) {
      if (object.length == 0) {
        componentCreated.value = " - ";
        return componentCreated;
      }
      if (object[0].hasOwnProperty(objectDisplayedValue) == false) {
        objectDisplayedValue = Object.getOwnPropertyNames(object[0])[0];
        displayedValue = object.map((item: any) => item[objectDisplayedValue]).join(", ");
      } else {
        displayedValue = object.map((item: any) => item[objectDisplayedValue]).join(", ");
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
      return "dd/MM/YY"
    }

    if (this.userConfig.dateFormat != null) {
      return this.userConfig.dateFormat;
    } else {
      return "dd/MM/YY"
    }
  }

  getLanguageDateFromUserConfig() {
    if (this.userConfig == null) {
      return "en"
    }

    if (this.userConfig.dateFormat != null) {
      return this.userConfig.language;
    } else {
      return "en"
    }
  }

  onClick() {
    this.eventClick.emit(this.itemDisplayed);
  }

  selectItem(event: any | null) {
    this.eventOnSelect.emit(this.itemDisplayed);
    if (event != null) {
      event.source.checked = false;
    }
  }

  onClickToEdit() {
    this.eventClickToEdit.emit(this.itemDisplayed);
  }
}