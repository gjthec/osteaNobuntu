import { BaseResourceModel } from './baseResource.model';
import { DatabaseCredential } from './databaseCredential.model';
import { Role } from './role.model';

export interface IDatabaseCredentialRoleDatabaseModel
	extends BaseResourceModel {
	roleId?: number;
	databaseCredentialId?: number;
	isAdmin?: boolean;
	accessLevel?: string;
}

export interface IDatabaseCredentialRole extends BaseResourceModel {
	role: Role;
	databaseCredential: DatabaseCredential;
	isAdmin: boolean;
	accessLevel: string;
}

export class DatabaseCredentialRole extends BaseResourceModel {
	role: Role;
	databaseCredential: DatabaseCredential;
	isAdmin: boolean;
	accessLevel: string;

	constructor(data: IDatabaseCredentialRole) {
		super();
		this.id = data.id;
		this.role = data.role;
		this.databaseCredential = data.databaseCredential;
		this.isAdmin = data.isAdmin;
		this.accessLevel = data.accessLevel;
	}

	static fromJson(jsonData: IDatabaseCredentialRole): DatabaseCredentialRole {
		return new DatabaseCredentialRole(jsonData);
	}
}
