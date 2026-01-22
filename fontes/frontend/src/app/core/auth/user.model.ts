import { BaseResourceModel } from "app/shared/models/base-resource.model";

export interface ITokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number
}

export interface IUserSession {
  user: IUser;
  tokens: ITokens;
}

export interface IUser {
  id?: string;
  UID: string;
  TenantUID: string;
  userName: string;
  firstName: string;
  lastName: string;
  isAdministrator?: boolean;
  memberType?: string;
  tenants ?: string[];
  email?: string;
  photoUrl?: string;
}

export class User extends BaseResourceModel implements IUser {
  UID: string;
  TenantUID: string;
  userName: string;
  firstName: string;
  lastName: string;
  isAdministrator?: boolean;
  memberType?: string;
  tenants?: string[];

  static fromJson(jsonData: any): User {
    return Object.assign(new User(), jsonData);
  }
}

export interface SignupDTO {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}