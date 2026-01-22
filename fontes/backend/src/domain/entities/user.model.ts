import { BaseResourceModel } from './baseResource.model';

export interface IUserDatabaseModel extends BaseResourceModel {
	identityProviderUID?: string;
	provider?: string;
	tenantUID?: string;
	userName?: string;
	firstName?: string;
	lastName?: string;
	isAdministrator?: boolean;
	memberType?: string;
	email?: string;
	password?: string;
}

export interface IUser extends BaseResourceModel {
	identityProviderUID?: string;
	provider?: string;
	tenantUID?: string;
	userName?: string;
	firstName?: string;
	lastName?: string;
	isAdministrator?: boolean;
	memberType?: string;
	email?: string;
	password?: string;
}

export class User extends BaseResourceModel {
	identityProviderUID?: string;
	provider?: string;
	tenantUID?: string;
	userName?: string;
	firstName?: string;
	lastName?: string;
	isAdministrator?: boolean;
	memberType?: string;
	email?: string;
	password?: string | undefined;

	constructor(data: IUser) {
		super();
		this.id = data.id;
		this.password = data.password;
		this.identityProviderUID = data.identityProviderUID;
		this.provider = data.provider;
		this.tenantUID = data.tenantUID;
		this.userName = data.userName;
		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.isAdministrator = data.isAdministrator;
		this.memberType = data.memberType;
		this.email = data.email;
	}

	static fromJson(jsonData: IUser): User {
		return new User(jsonData);
	}

	getFullName() {
		return this.firstName + ' ' + this.lastName;
	}
}