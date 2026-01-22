import { BaseResourceModel } from './baseResource.model';

export interface IFunctionSystemDatabaseModel extends BaseResourceModel {
	description?: string;
	route?: string;
	method?: string;
	className?: string;
	isPublic?: boolean;
}

export interface IFunctionSystem extends BaseResourceModel {
	description?: string;
	route: string;
	method: string;
	className: string;
	isPublic: boolean;
}

export class FunctionSystem extends BaseResourceModel {
	description?: string;
	route: string;
	method: string;
	className: string;
	isPublic: boolean;

	constructor(data: IFunctionSystem) {
		super();
		this.id = data.id;
		this.description = data.description;
		this.route = data.route;
		this.method = data.method;
		this.className = data.className;
		this.isPublic = data.isPublic;
	}

	static fromJson(jsonData: IFunctionSystem): FunctionSystem {
		return new FunctionSystem(jsonData);
	}
}