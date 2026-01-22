import { BaseResourceModel } from './baseResource.model';
import { FunctionSystem } from './functionSystem.model';
import { Role } from './role.model';

export interface IFunctionSystemRoleDatabaseModel extends BaseResourceModel {
	roleId?: number;
	functionSystemId?: number;
	accessLevel?: string;
}

export interface IFunctionSystemRole extends BaseResourceModel {
	role: Role;
	functionSystem: FunctionSystem;
	accessLevel: string;
}

export class FunctionSystemRole extends BaseResourceModel {
	role: Role;
	functionSystem: FunctionSystem;
	accessLevel: string;

	constructor(input: IFunctionSystemRole) {
		super();
		this.id = input.id;
		this.role = input.role;
		this.functionSystem = input.functionSystem;
		this.accessLevel = input.accessLevel;
	}

	static fromJson(jsonData: IFunctionSystemRole): FunctionSystemRole {
		return new FunctionSystemRole(jsonData);
	}
}