import { BaseResourceModel } from "app/shared/models/base-resource.model";

export interface ITenant extends BaseResourceModel {
  name?: string;
}

export class Tenant extends BaseResourceModel implements ITenant {
  name?: string;

  static fromJson(jsonData: any): Tenant {
    return Object.assign(new Tenant(), jsonData);
  }
}
