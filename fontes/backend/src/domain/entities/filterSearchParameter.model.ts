import { BaseResourceModel } from './baseResource.model';

export interface IFilterSearchParameterDatabaseModel extends BaseResourceModel {
	name?: string;
	className?: string;
	parameters?: object;
	isPublic?: boolean;
}

export interface IFilterSearchParameter extends BaseResourceModel {
	name?: string;
	className?: string;
	parameters?: object;
	isPublic?: boolean;
}

export class FilterSearchParameter extends BaseResourceModel {
	name?: string;
	className?: string;
	parameters?: object;
	isPublic?: boolean;

	constructor(data: IFilterSearchParameter) {
		super();
		this.id = data.id;
		this.name = data.name;
		this.className = data.className;
		this.parameters = data.parameters;
		this.isPublic = data.isPublic;
	}

	static fromJson(jsonData: IFilterSearchParameter): FilterSearchParameter {
		return new FilterSearchParameter(jsonData);
	}
}
