import { BaseResourceModel } from "app/shared/models/base-resource.model";

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
  roles?: string[];
}

export interface IUserSession {
  user: IUser;
  roles?: string[];
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
  invitedTenantsToken?: string;
}

export interface SignInResponse {
  user: IUser;
  roles: string[];
  sessionId: string;
}

export interface SessionResponse {
  user: IUser;
  roles: string[];
}
