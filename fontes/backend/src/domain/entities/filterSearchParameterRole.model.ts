import { BaseResourceModel } from './baseResource.model';
import { FilterSearchParameter } from './filterSearchParameter.model';

export interface IFilterSearchParameterRoleDatabaseModel
	extends BaseResourceModel {
	filterSearchParameterId?: number;
	roleId?: number;
	accessLevel?: string;
}

export interface IFilterSearchParameterRole extends BaseResourceModel {
	filterSearchParameter?: FilterSearchParameter;
	roleId?: number;
	accessLevel?: string;
}

export class FilterSearchParameterRole extends BaseResourceModel {
	filterSearchParameter?: FilterSearchParameter;
	roleId?: number;
	accessLevel?: string;

	constructor(data: IFilterSearchParameterRole) {
		super();
		this.id = data.id;
		this.filterSearchParameter = data.filterSearchParameter;
		this.roleId = data.roleId;
		this.accessLevel = data.accessLevel;
	}

	static fromJson(jsonData: IFilterSearchParameterRole): FilterSearchParameterRole {
		return new FilterSearchParameterRole(jsonData);
	}
}
