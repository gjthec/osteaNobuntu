import { FormControl } from "@angular/forms";
import { ICreateComponentParams } from "../services/form-generator.service";

export interface FormField {
  createFormField(createComponentData: ICreateComponentParams): FormControl;
}