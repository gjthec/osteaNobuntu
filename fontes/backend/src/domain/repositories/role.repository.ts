import { where } from 'sequelize';
import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { IRoleDataBaseModel, Role } from '../entities/role.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';
import { RoleRepositoryMongoose } from '../../infra/database/mongoose/repositories/role.repository';
import { RoleRepositorySequelize } from '../../infra/database/sequelize/repositories/role.repository';

export interface IRoleRepository {
	isPublicRoute(method: string, route: string): Promise<boolean>;
	/**
	 * Obtem uma lista de Role/Permissões com base no identificador do usuário
	 * @param userId Indetificador do usuário
	 * @param pageSize Quantidade de registros retornados por página
	 * @param page Qual pagina está sendo apresentada
	 */
	getRoleListByUserId(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<Role[]>;
}

export default class RoleRepository extends BaseRepository<
	IRoleDataBaseModel,
	Role
> {
	advancedSearches: IRoleRepository;

	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<IRoleDataBaseModel, Role> =
			createDbAdapter<IRoleDataBaseModel, Role>(
				tenantConnection.models!.get('Role'),
				tenantConnection.databaseType,
				tenantConnection.connection,
				Role.fromJson
			);
		super(_adapter, tenantConnection);

		if (tenantConnection.databaseType === 'mongodb') {
			this.advancedSearches = new RoleRepositoryMongoose(
				this.tenantConnection,
				this.adapter
			);
		} else {
			this.advancedSearches = new RoleRepositorySequelize(
				this.tenantConnection,
				this.adapter
			);
		}
	}

	async getUserRoles(userId: number): Promise<Role[]> {
		try {
			if (this.adapter.databaseType == 'mongodb') {
				return await this.getUserRolesMongooseImplementation();
			} else {
				return await this.getUserRolesSequelizeImplementation(userId);
			}
		} catch (error) {
			throw new Error('Error get user Roles. Detail: ' + error);
		}
	}

	async getUserRolesSequelizeImplementation(userId: number): Promise<Role[]> {
		let userRoles = await this._tenantConnection
			.models!.get('UserRole')
			.findAll({
				where: {
					userId: userId
				},
				include: [{ all: true }]
			});

		let roleIds = userRoles.map((userRole: any) => userRole.roleId);

		let _roles = await this._tenantConnection.models!.get('Role').findAll({
			where: {
				id: roleIds
			}
		});

		let roles: Role[] = [];

		if (Array.isArray(_roles) && _roles.length == 0) {
			return [];
		}

		for (let role of _roles) {
			roles.push({
				id: role.dataValues.id,
				name: role.dataValues.name
			});
		}

		return roles;
	}

	async getUserRolesMongooseImplementation() {
		return [];
	}
}