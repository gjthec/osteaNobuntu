import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import {
	IUserDatabaseModel,
	User
} from '../../../../domain/entities/user.model';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';

export class UserRepositorySequelize implements IUserRepository {
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<IUserDatabaseModel, User>
	) {}

	async getByRoleId(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<User[]> {
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
						model: this.tenantConnection.models!.get('Role'),
						as: 'role',
						required: true,
						where: {
							id: roleId
						}
					}
				]
			});

		const formattedData = roleList.map((f: any) => f.get({ plain: true }));

		return formattedData;
	}
}
