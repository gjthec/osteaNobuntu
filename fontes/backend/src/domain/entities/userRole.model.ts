import { BaseResourceModel } from './baseResource.model';
import { Role } from './role.model';
import { User } from './user.model';

export interface IUserRoleDatabaseModel extends BaseResourceModel {
	userId?: number;
	roleId?: number;
}

export interface IUserRole extends BaseResourceModel {
	user?: User;
	role?: Role;
}

export class UserRole extends BaseResourceModel {
	user?: User;
	role?: Role;

	constructor(data: IUserRole) {
		super();
		this.id = data.id;
		this.user = data.user;
		this.role = data.role;
	}

	static fromJson(jsonData: IUserRole): UserRole {
		return new UserRole(jsonData);
	}
}