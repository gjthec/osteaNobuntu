import { BaseResourceModel } from './baseResource.model';
import { DatabaseCredential } from './databaseCredential.model';
import { User } from './user.model';

export interface IDatabaseCredentialUserDatabaseModel
	extends BaseResourceModel {
	userId?: number;
	databaseCredentialId?: number;
	isAdmin?: boolean;
	accessLevel?: string;
}

export interface IDatabaseCredentialUser extends BaseResourceModel {
	user: User;
	databaseCredential: DatabaseCredential;
	isAdmin: boolean;
	accessLevel?: string;
}

export class DatabaseCredentialUser extends BaseResourceModel {
	user: User;
	databaseCredential: DatabaseCredential;
	isAdmin: boolean;
	accessLevel?: string;

	constructor(data: IDatabaseCredentialUser) {
		super();
		this.id = data.id;
		this.user = data.user;
		this.databaseCredential = data.databaseCredential;
		this.isAdmin = data.isAdmin;
		this.accessLevel = data.accessLevel;
	}

	static fromJson(jsonData: IDatabaseCredentialUser): DatabaseCredentialUser {
		return new DatabaseCredentialUser(jsonData);
	}
}
