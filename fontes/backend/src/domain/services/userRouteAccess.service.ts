import { InternalServerError } from '../../errors/internal.error';
import { IUserRouteAccessService } from './IuserRouteAccess.service';
import { UserRouteAccessCacheInMemoryService } from '../../infra/cache/userRouteAccessCacheInMemory.service';

/**
 * Responsável pelo controle de armazenamento de qual usuário tem permissão para acessar qual rota
 */
export class UserRouteAccessService {
	userRouteAccessCache: IUserRouteAccessService;

	private static _instance: UserRouteAccessService;

	constructor() {
		if (
			process.env.USER_ROUTE_ACCESS_SAVE_IN_CACHE_IN_MEMORY == 'TRUE' &&
			process.env.IS_API_SINGLE_INSTANCE == 'FALSE'
		) {
			throw new InternalServerError(
				'Saving user route access in memory requires this API to run as a single instance, otherwise inconsistencies between instances will occur.'
			);
		}

		if (process.env.USER_ROUTE_ACCESS_SAVE_IN_CACHE_IN_MEMORY == 'TRUE') {
			console.log(
				'Dados relacionados a qual usuário tem permissão a qual rota foram salvos em memória para cache'
			);
			this.userRouteAccessCache = new UserRouteAccessCacheInMemoryService();
		} else {
			throw new InternalServerError('Method not implemented yet.');
		}
	}

	public static getInstance(): UserRouteAccessService {
		if (!UserRouteAccessService._instance) {
			UserRouteAccessService._instance = new UserRouteAccessService();
		}

		return UserRouteAccessService._instance;
	}
}
