import { BaseResourceModel } from './baseResource.model';
import { ComponentStructure } from './componentStructure.model';
import { Role } from './role.model';

//I<NomeDaClasse>DatabaseModel
export interface IComponentStructureRoleDatabaseModel
	extends BaseResourceModel {
	roleId?: number;
	componentStructureId?: number;
}

export interface IComponentStructureRole extends BaseResourceModel {
	role?: Role;
	componentStructure?: ComponentStructure;
}

export class ComponentStructureRole extends BaseResourceModel {
	role?: Role;
	componentStructure?: ComponentStructure;

	constructor(data: IComponentStructureRole) {
		super();
		this.id = data.id;
		this.role = data.role;
		this.componentStructure = data.componentStructure;
	}

	static fromJson(jsonData: IComponentStructureRole): ComponentStructureRole {
		return new ComponentStructureRole(jsonData);
	}
}