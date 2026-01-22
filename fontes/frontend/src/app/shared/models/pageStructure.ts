import { SortField } from "../components/sort-order-dialog/sort-order-dialog.component";

export interface IPageStructure {
  config: IPageStructureConfig;
  attributes: IPageStructureAttribute[];
}


export interface IconOption {
  nome: string;
  valor: number;
}

export interface IPageStructureConfig {
  modified: Date;
  description: string;
  name: string;
  limiteOfChars: number; //criado novo
  apiUrl: string;
  route: string;
  title: ITitle;
  localStorage: boolean;
  filter: boolean;
  searchableFields: ISearchableField[];
  steps: string[];
  isAbleToCreate: boolean;
  edit: boolean;
  columnsQuantity: number;
  delete: boolean;
  /**
   * Indica se na lista terá um botão novo com função e ícone customizado
   */
  hasCustomFunctionButton: boolean;
  isFormStepper: boolean;
  isLinearFormStepper: boolean;
  sortableFields: SortField[];
  icones?: IconOption[];
  mask?: string;
  maskType?: string; // criado novo
  charactersLimit?: number;
  numberOfIcons?: number[];  //criado novo
  conditionalVisibility?: { field: string, values: string[] }; //criado novo
  locationMarker?: { lat: number, lng: number, quadrant?: string }; //criado novo?
  needMaskValue?: boolean; //criado novo
  numberOfDecimals?: number; //criado novo
  decimalSeparator?: string; //criado novo
  links?: {addressDestination: string, title: any, destinationFormat: string }[];  
  addressDestination?: string; 
  externalAddress?: string; 
  sendAllData?: boolean; 
  formLinear?: boolean;
}

export interface ITitle {
  pt: string;
  en: string;
}

export interface ISearchableField {
  name: string,
  type: string
}

export interface IPageStructureAttribute {
  name: string;
  type: string;
  limiteOfChars: number; //criado novo
  isRequired: boolean,
  className: string;
  many: boolean;
  apiUrl: string;
  /**
   * Caso o attributo sejá um relacionamento com outra classe/entidade, esse será o nome do campo que será apresentado. Exemplo: O relacionamento com veículos, esse campo então se chamará "placa", então será apresentado a placa do veículo.
   */
  fieldDisplayedInLabel: string;
  visibleCard: boolean;
  visibleGrid: boolean;
  visibleFilter: boolean;
  visibleList: boolean;
  forageinKey: string;
  lookup: boolean;
  viewDetails: boolean;
  searchable: string[];
  addNew: boolean;
  properties: IPageStructureAttributesProperties[];
  visibleForm: boolean;
  formTab: string;
  defaultValue: string;
  selectItemsLimit?: number;
  /**
   * Caso o attribute/atributo/campo da classe/variável seja um campo selecionável (opções fixas). Esse campo armazenará os nomes das opções disponívels para seleção.
   */
  optionList?: any[];
  step?: string;
  allowedExtensions?: string[];
  icones?: IconOption[];
  mask?: string;
  maxFileSize?: number;
  maskType?: string; // criado novo
  charactersLimit?: number;
  numberOfIcons?: number[];  //criado novo
  conditionalVisibility?: { field: string, values: string[] }; //criado novo
  locationMarker?: { lat: number, lng: number, quadrant?: string }; //criado novo?
  needMaskValue?: boolean; //criado novo
  numberOfDecimals?: number; //criado novo
  decimalSeparator?: string; //criado novo
  classImported?: {
    nameClass: string;
    jsonPath: string;
    attributeClass: string;
    links: {
      addressDestination: string;
      mapping: { [key: string]: string };
    };
  }[];
  links?: {addressDestination: string, title: any, destinationFormat: string }[]; 
  addressDestination?: string; 
  sendAllData?: boolean; 
  foreignKeyName?: string; //criado novo
  searchInputFieldVisible?: boolean; //criado novo
}

export interface IPageStructureAttributesProperties {
  type: string;
  name: string;
  visibleCard: boolean;
  visibleGrid: boolean;
  visibleFilter: boolean;
  visibleList: boolean;
  visibleForm: boolean;
  conditionalVisibility?: { field: string, values: string[] };  //criado novo
  locationMarker?: { lat: number, lng: number, quadrant?: string }; //criado novo
}

export class PageStructure implements IPageStructure {
  config: IPageStructureConfig;
  attributes: IPageStructureAttribute[];

  constructor(data: IPageStructure) {
    
  }
}