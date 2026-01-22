import { Op } from 'sequelize';
import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	IComponentStructureDatabaseModel,
	ComponentStructure
} from '../entities/componentStructure.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';
import { Role } from '../entities/role.model';
import RoleRepository from './role.repository';

export default class ComponentStructureRepository extends BaseRepository<
	IComponentStructureDatabaseModel,
	ComponentStructure
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IComponentStructureDatabaseModel,
			ComponentStructure
		> = createDbAdapter<IComponentStructureDatabaseModel, ComponentStructure>(
			tenantConnection.models!.get('ComponentStructure'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			ComponentStructure.fromJson
		);
		super(_adapter, tenantConnection);
	}

	async getPageStructure(
		userId: number,
		pageName: string
	): Promise<ComponentStructure | null> {
		const roleRepository: RoleRepository = new RoleRepository(
			this.tenantConnection
		);
		const userRoles: Role[] | null = await roleRepository.getUserRoles(userId);

		if (userRoles == null) {
			return null;
		}

		let roleIds = userRoles.map((role) => role.id!);

		try {
			if (this.adapter.databaseType == 'mongodb') {
				return await this.getPageStructureMongooseImplementation(
					roleIds,
					pageName
				);
			} else {
				return await this.getPageStructureSequelizeImplementation(
					roleIds,
					pageName
				);
			}
		} catch (error) {
			throw new Error('Error get page structure. Detail: ' + error);
		}
	}

	async getPageStructureSequelizeImplementation(
		roleIds: number[],
		componentName: string
	): Promise<ComponentStructure | null> {
		if (!Array.isArray(roleIds) || roleIds.length === 0) {
			return null;
		}

		const _componentStructure = await this._tenantConnection
			.models!.get('ComponentStructure')
			.findAll({
				where: {
					componentName: componentName
				},
				include: [
					{
						model: this._tenantConnection.models!.get('Role'),
						as: 'role',
						required: true,
						where: {
							id: {
								[Op.in]: roleIds
							}
						}
					}
				]
			});

		return new ComponentStructure({
			componentName: _componentStructure.dataValues.componentName,
			structure: _componentStructure.dataValues.structure
		});
	}

	async getPageStructureMongooseImplementation(
		roleIds: number[],
		componentName: string
	): Promise<ComponentStructure | null> {
		if (!Array.isArray(roleIds) || roleIds.length === 0) {
			return null;
		}

		const componentStructureQuery = [
			{
				$match: {
					roleId: { $in: roleIds }
				}
			},
			{
				$lookup: {
					from: 'ComponentStructure',
					localField: 'componentStructureId',
					foreignField: '_id',
					as: 'componentStructure'
				}
			},
			{
				$unwind: 'componentStructure' // Transforma o array  em documentos individuais
			},
			{
				$project: {
					id: 'componentStructure.id',
					componentName: 'componentStructure.name',
					structure: 'componentStructure.structure'
				}
			}
		];

		const componentStructure = await this._tenantConnection
			.models!.get('ComponentStructureRole')
			.aggregate(componentStructureQuery);

		console.log(
			'componentStructure retornado no mongoose: ',
			componentStructure
		);

		return new ComponentStructure({
			componentName: componentStructure.componentName,
			structure: componentStructure.structure
		});
	}
}