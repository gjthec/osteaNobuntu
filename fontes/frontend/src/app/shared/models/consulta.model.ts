import { ISelectorValue } from "../components/selector-input-field/selector-input-field.component";
import { IPageStructureAttribute } from "./pageStructure";

export interface IConsultaPageStructure {
    config: IConsultaConfig;
    parameters: IPageStructureAttribute[];
    return: IPageStructureAttribute[];
}

export interface IConsultaConfig {
    name: string;
    descricao: string;
    apiUrl: string;
    frontPath: string;
    isAbleToExportOnDocument: boolean;
}

export interface IConsultaClass {
    name: string;
    fieldType: string;
    label?: string;
    optionList?: ISelectorValue[];
    selectItemsLimit?: number;
}

