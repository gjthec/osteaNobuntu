import {
	IRoleDataBaseModel,
	Role
} from '../../../../domain/entities/role.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import { IRoleRepository } from '../../../../domain/repositories/role.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';

export class RoleRepositorySequelize implements IRoleRepository {
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<IRoleDataBaseModel, Role>
	) {}

	async isPublicRoute(method: string, route: string): Promise<boolean> {
		const isPublicRoute = await this.tenantConnection
			.models!.get('FunctionSystem')
			.findAll({
				where: {
					route: route,
					method: method
				},
				include: [
					{
						model: this.tenantConnection.models!.get('Role'),
						as: 'role',
						required: true,
						where: {
							name: 'guest'
						}
					}
				]
			});

		if (isPublicRoute.length <= 0) {
			return false;
		}

		return true;
	}

	async getRoleListByUserId(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<Role[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		const roleList = await this.tenantConnection
			.models!.get('FunctionSystem')
			.findAll({
				...options,
				include: [
					{
						model: this.tenantConnection.models!.get('User'),
						as: 'user',
						required: true,
						where: {
							id: userId
						}
					}
				]
			});

		const formattedData = roleList.map((f: any) => f.get({ plain: true }));

		return formattedData;
	}
}