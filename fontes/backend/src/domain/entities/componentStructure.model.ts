import { BaseResourceModel } from './baseResource.model';

export interface IComponentStructureDatabaseModel extends BaseResourceModel {
	structure?: string;
	componentName?: string;
}

export interface IComponentStructure extends BaseResourceModel {
	structure: string;
	componentName: string;
}

export class ComponentStructure extends BaseResourceModel {
	structure: string;
	componentName: string;

	constructor(data: IComponentStructure) {
		super();
		this.structure = data.structure;
		this.componentName = data.componentName;
	}

	static fromJson(jsonData: IComponentStructure): ComponentStructure {
		return new ComponentStructure(jsonData);
	}
}
