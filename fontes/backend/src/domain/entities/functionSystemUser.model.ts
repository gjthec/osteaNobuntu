import { BaseResourceModel } from './baseResource.model';
import { FunctionSystem } from './functionSystem.model';

export interface IFunctionSystemUserDatabaseModel extends BaseResourceModel {
	userId?: number;
	functionSystemId?: number;
	accessLevel?: string;
}

export interface IFunctionSystemUser extends BaseResourceModel {
	user: string;
	functionSystem: FunctionSystem | number;
	accessLevel: string;
}

export class FunctionSystemUser extends BaseResourceModel {
	user: string;
	functionSystem: FunctionSystem | number;
	accessLevel: string;

	constructor(input: IFunctionSystemUser) {
		super();
		this.id = input.id;
		this.user = input.user;
		this.functionSystem = input.functionSystem;
		this.accessLevel = input.accessLevel;
	}

	static fromJson(jsonData: IFunctionSystemUser): FunctionSystemUser {
		return new FunctionSystemUser(jsonData);
	}
}
