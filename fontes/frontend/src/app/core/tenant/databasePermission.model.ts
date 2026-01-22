import { BaseResourceModel } from "app/shared/models/base-resource.model";
import { Tenant } from "./tenant.model";

export interface IDatabasePermission  extends BaseResourceModel {
  tenant: Tenant;
  databaseCredentialId: number;
  identityProviderUID: string;
}

export class DatabasePermission extends BaseResourceModel implements IDatabasePermission {
  tenant: Tenant;
  databaseCredentialId: number;
  identityProviderUID: string;

  static fromJson(jsonData: any): DatabasePermission {
    return Object.assign(new DatabasePermission(), jsonData);
  }
}