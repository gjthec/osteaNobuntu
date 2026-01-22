import {
	DatabaseCredential,
	IDatabaseCredential,
	IDatabaseCredentialDatabaseModel
} from '../../../../domain/entities/databaseCredential.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import { User } from '../../../../domain/entities/user.model';
import { IDatabaseCredentialRepository } from '../../../../domain/repositories/databaseCredential.repository';
import { UserAccess } from '../../../../domain/services/ItenantConnection.service';
import { IDatabaseAdapter } from '../../IDatabase.adapter';

export class DatabaseCredentialRepositoryMongoose
	implements IDatabaseCredentialRepository
{
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<
			IDatabaseCredentialDatabaseModel,
			DatabaseCredential
		>
	) {}

	getByTenantId(
		tenantId: number,
		ownerUserId: number
	): Promise<DatabaseCredential[]> {
		throw new Error('Method not implemented.');
	}
	getAccessibleByUserIdentityProviderUID(
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]> {
		throw new Error('Method not implemented.');
	}
	create(
		databaseCredential: IDatabaseCredential,
		userId: number
	): Promise<DatabaseCredential> {
		throw new Error('Method not implemented.');
	}
	delete(
		databaseCredentialId: number,
		userId: number
	): Promise<DatabaseCredential> {
		throw new Error('Method not implemented.');
	}
	setUserPermissionForDatabaseCredential(
		permissionGiverId: number,
		permissionReceiverId: number,
		databaseCredentialId: number,
		accessLevel: string
	): Promise<DatabaseCredential> {
		throw new Error('Method not implemented.');
	}
	setRolePermissionForDatabaseCredential(
		permissionGiverId: number,
		roleId: number,
		databaseCredentialId: number,
		accessLevel: string
	): Promise<DatabaseCredential> {
		throw new Error('Method not implemented.');
	}
	removeUserPermissionForDatabaseCredential(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential> {
		throw new Error('Method not implemented.');
	}
	removeRolePermissionForDatabaseCredential(
		permissionRemoverId: number,
		roleId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential> {
		throw new Error('Method not implemented.');
	}
	getByOwner(userId: number): Promise<DatabaseCredential[]> {
		throw new Error('Method not implemented.');
	}
	getPublic(): Promise<DatabaseCredential[]> {
		throw new Error('Method not implemented.');
	}
	getByUserPermissions(userId: number): Promise<DatabaseCredential[]> {
		throw new Error('Method not implemented.');
	}
	getByRolePermissions(roleId: number): Promise<DatabaseCredential[]> {
		throw new Error('Method not implemented.');
	}
	getAccessible(
		userId: number,
		roleIdList: number[]
	): Promise<DatabaseCredential[]> {
		throw new Error('Method not implemented.');
	}
	getAccessibleByIdentityProviderUID(
		identityProviderUID: string,
		roleIdList: number[],
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]> {
		throw new Error('Method not implemented.');
	}
	getUserAccessList(): Promise<UserAccess[]> {
		throw new Error('Method not implemented.');
	}
	changeDatabaseOwner(
		oldOwnerUserId: number,
		newOwnerUserId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential> {
		throw new Error('Method not implemented.');
	}
	getUserAccessListByDatabaseCredentialId(
		databaseCredentialId: number
	): Promise<User[]> {
		throw new Error('Method not implemented.');
	}
}