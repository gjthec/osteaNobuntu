import {
	FunctionSystem,
	IFunctionSystem,
	IFunctionSystemDatabaseModel
} from '../../../../domain/entities/functionSystem.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import { IFunctionSystemRepository } from '../../../../domain/repositories/functionSystem.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';

export class FunctionSystemRepositoryMongoose
	implements IFunctionSystemRepository
{
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<
			IFunctionSystemDatabaseModel,
			FunctionSystem
		>
	) {}

	create(
		functionSystem: IFunctionSystem,
		userId: number
	): Promise<FunctionSystem> {
		throw new Error('Method not implemented.');
	}
	delete(functionSystemId: number, userId: number): Promise<FunctionSystem> {
		throw new Error('Method not implemented.');
	}
	setUserPermissionForFunctionSystem(
		permissionGiverId: number,
		permissionReceiverId: number,
		functionSystemId: number,
		accessLevel: string
	): Promise<FunctionSystem> {
		throw new Error('Method not implemented.');
	}
	setRolePermissionForFunctionSystem(
		permissionGiverId: number,
		roleId: number,
		functionSystemId: number,
		accessLevel: string
	): Promise<FunctionSystem> {
		throw new Error('Method not implemented.');
	}
	removeUserPermissionForFunctionSystem(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		functionSystemId: number
	): Promise<FunctionSystem> {
		throw new Error('Method not implemented.');
	}
	removeRolePermissionForFunctionSystem(
		permissionRemoverId: number,
		roleId: number,
		functionSystemId: number
	): Promise<FunctionSystem> {
		throw new Error('Method not implemented.');
	}
	getByOwner(userId: number): Promise<FunctionSystem[]> {
		throw new Error('Method not implemented.');
	}
	getPublic(pageSize?: number, page?: number): Promise<FunctionSystem[]> {
		throw new Error('Method not implemented.');
	}
	getByUserPermissions(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		throw new Error('Method not implemented.');
	}
	getByRolePermissions(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		throw new Error('Method not implemented.');
	}
	getAccessible(
		userId: number,
		roleIdList: number[],
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		throw new Error('Method not implemented.');
	}
	getAccessibleByUserIdentityProviderUID(
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		throw new Error('Method not implemented.');
	}
}
