import { ICreateComponentParams } from "../services/form-generator.service";
import { FormField } from "./form-field";
import { IPageStructure } from "./pageStructure";

export interface FormFactory {
  createFormField(createComponentData: ICreateComponentParams, dataToCreatePage: IPageStructure): FormField;
}
