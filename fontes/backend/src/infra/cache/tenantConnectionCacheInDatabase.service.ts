import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import {
	ITenantConnectionService,
	UserAccess
} from '../../domain/services/ItenantConnection.service';

export class TenantConnectionCacheInDatabaseService
	implements ITenantConnectionService
{
	constructor() {
		throw new Error('Method not implemented.');
	}
	set(databaseCredentialId: number, connection: TenantConnection): void {
		throw new Error('Method not implemented.');
	}

	saveUserAccessOnMemory(
		securityTenantConnection: TenantConnection
	): Promise<void> {
		throw new Error('Method not implemented.');
	}
	addUserAccess(
		userId: number,
		identityProviderUID: string,
		databaseCredentialId: number
	): void {
		throw new Error('Method not implemented.');
	}
	hasUserAccess(
		identityProviderUID: string,
		databaseCredentialId: number
	): boolean {
		throw new Error('Method not implemented.');
	}
	removeUserAccess(
		identityProviderUID: string,
		databaseCredentialId: number
	): void {
		throw new Error('Method not implemented.');
	}
	get(databaseCredentialId: number): TenantConnection | null {
		throw new Error('Method not implemented.');
	}
	delete(databaseCredentialId: number): boolean {
		throw new Error('Method not implemented.');
	}
	getUserAccesses(identityProviderUID: string): UserAccess[] {
		throw new Error('Method not implemented.');
	}
}
