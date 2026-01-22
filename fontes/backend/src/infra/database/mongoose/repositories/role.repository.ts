import {
	IRoleDataBaseModel,
	Role
} from '../../../../domain/entities/role.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import { IRoleRepository } from '../../../../domain/repositories/role.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';

export class RoleRepositoryMongoose implements IRoleRepository {
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<IRoleDataBaseModel, Role>
	) {}

	async isPublicRoute(method: string, route: string): Promise<boolean> {
		//De functionSystem vai para role
		/*
    let isPublicRouteQuery = [
      {
        $match: {
          $and: [
            { "FunctionSystem.method": { $eq: method } },
            { "FunctionSystem.route": { $eq: route } }
          ]
        },
      },
      {
        $lookup: {
          from: "functionssystemroles",
          localField: "_id",
          foreignField: "functionSystemId",
          as: "FunctionSystemRoles",
        },
      },
      { $unwind: "$FunctionSystemRoles" },
      {
        $lookup: {
          from: "roles",
          localField: "FunctionSystemRoles",
          foreignField: "roleId",
          as: "FunctionSystemRoles",
        },
      },
    ];

    const role = await this.adapter.findUsingCustomQuery(isPublicRouteQuery);

    if (Array.isArray(role) == true) {
      if (role.length > 0) {
        return true;
      } else {
        return false;
      }
    }

    return false;
    */
		throw new Error('Method not implemented.');
	}

	getRoleListByUserId(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<Role[]> {
		throw new Error('Method not implemented.');
	}
}