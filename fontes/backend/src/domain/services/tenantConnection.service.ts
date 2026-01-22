import { ITenantConnectionService } from './ItenantConnection.service';
import { TenantConnectionCacheInMemoryService } from '../../infra/cache/tenantConnectionCacheInMemory.service';
import { TenantConnectionCacheInDatabaseService } from '../../infra/cache/tenantConnectionCacheInDatabase.service';
import { InternalServerError } from '../../errors/internal.error';

/**
 * Responsável pelo controle de armazenamento de qual usuário tem permissão para acessar qual tenant
 */
export class TenantConnectionAccessService {
	tenantConnectionCache: ITenantConnectionService;

	private static _instance: TenantConnectionAccessService;

	constructor() {
		if (
			process.env.TENANT_CONNECTIONS_SAVE_IN_CACHE_IN_MEMORY == 'TRUE' &&
			process.env.IS_API_SINGLE_INSTANCE == 'FALSE'
		) {
			throw new InternalServerError(
				'Saving tenant connections in memory requires this API to run as a single instance, otherwise inconsistencies between instances will occur.'
			);
		}

		if (process.env.TENANT_CONNECTIONS_SAVE_IN_CACHE_IN_MEMORY == 'TRUE') {
			this.tenantConnectionCache = new TenantConnectionCacheInMemoryService();
		} else {
			this.tenantConnectionCache = new TenantConnectionCacheInDatabaseService();
		}
	}

	public static get instance(): TenantConnectionAccessService {
		if (!TenantConnectionAccessService._instance) {
			TenantConnectionAccessService._instance =
				new TenantConnectionAccessService();
		}

		return TenantConnectionAccessService._instance;
	}
}