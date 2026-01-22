import {
	FilterSearchParameter,
	IFilterSearchParameter,
	IFilterSearchParameterDatabaseModel
} from '../../../../domain/entities/filterSearchParameter.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import { IFilterSearchParameterRepository } from '../../../../domain/repositories/filterSearchParameter.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';

export class FilterSearchParameterRepositoryMongoose
	implements IFilterSearchParameterRepository
{
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<
			IFilterSearchParameterDatabaseModel,
			FilterSearchParameter
		>
	) {}

	checkUserAccess(
		filterSearchParameterId: number,
		userAccessLevelList: string[],
		roleAccessLevelList: string[],
		userIdentityProviderUID: string
	): Promise<number> {
		throw new Error('Method not implemented.');
	}
	create(
		filterSearchParameter: IFilterSearchParameter,
		userIdentityProviderUID: string
	): Promise<FilterSearchParameter> {
		throw new Error('Method not implemented.');
	}
	delete(
		filterSearchParameterId: number,
		userIdentityProviderUID: string
	): Promise<FilterSearchParameter> {
		throw new Error('Method not implemented.');
	}
	setUserPermissionForFilterSearchParameter(
		permissionGiverId: number,
		permissionReceiverId: number,
		filterSearchParameterId: number,
		accessLevel: string
	): Promise<FilterSearchParameter> {
		throw new Error('Method not implemented.');
	}
	setRolePermissionForFilterSearchParameter(
		permissionGiverId: number,
		roleId: number,
		filterSearchParameterId: number,
		accessLevel: string
	): Promise<FilterSearchParameter> {
		throw new Error('Method not implemented.');
	}
	removeUserPermissionForFilterSearchParameter(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		filterSearchParameterId: number
	): Promise<FilterSearchParameter> {
		throw new Error('Method not implemented.');
	}
	removeRolePermissionForFilterSearchParameter(
		permissionRemoverId: number,
		roleId: number,
		filterSearchParameterId: number
	): Promise<FilterSearchParameter> {
		throw new Error('Method not implemented.');
	}
	getByOwner(userId: number): Promise<FilterSearchParameter[]> {
		throw new Error('Method not implemented.');
	}
	getPublic(): Promise<FilterSearchParameter[]> {
		throw new Error('Method not implemented.');
	}
	getByUserPermissions(userId: number): Promise<FilterSearchParameter[]> {
		throw new Error('Method not implemented.');
	}
	getByRolePermissions(roleId: number): Promise<FilterSearchParameter[]> {
		throw new Error('Method not implemented.');
	}
	getAccessible(
		userId: number,
		roleIdList: number[]
	): Promise<FilterSearchParameter[]> {
		throw new Error('Method not implemented.');
	}
	getAccessibleByUserIdentityProviderUID(
		className: string,
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<FilterSearchParameter[]> {
		throw new Error('Method not implemented.');
	}
	getCountAccessibleByUserIdentityProviderUID(
		className: string,
		identityProviderUID: string
	): Promise<number> {
		throw new Error('Method not implemented.');
	}
}
