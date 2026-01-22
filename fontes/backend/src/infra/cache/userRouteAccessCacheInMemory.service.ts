import { FunctionSystem } from '../../domain/entities/functionSystem.model';
import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import FunctionSystemRepository from '../../domain/repositories/functionSystem.repository';
import {
	CachedUserPermissions,
	IUserRouteAccessService
} from '../../domain/services/IuserRouteAccess.service';
import { normalizeRouteKey } from '../../utils/normalizeRoute.util';

/**
 * Classe responsável por armazenar na memória dados de acesso de qual usuário pode acessar qual rota. Uso para caso de uma unica instância da API.
 */
export class UserRouteAccessCacheInMemoryService
	implements IUserRouteAccessService
{
	// Cache rápido para middleware
	private userRoutesCache = new Map<string, CachedUserPermissions>();
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

	constructor() {
		// Limpeza automática de cache expirado
		setInterval(() => {
			this.cleanExpiredCache();
		}, 60000); // A cada minuto
	}

	async hasUserAccessByUserUID(
		identityProviderUID: string,
		method: string,
		path: string,
		tenantWithRouteAccessRecords: TenantConnection
	): Promise<boolean> {
		const routeKey = `${method}:${path}`;
		const normalizerRouteKey = normalizeRouteKey(routeKey);

		// Verifica cache
		const cached = this.userRoutesCache.get(identityProviderUID);

		let userHaveAccessToRoute: boolean = false;

		if (cached && cached.expiry > Date.now()) {
			userHaveAccessToRoute = cached.routes.has(normalizerRouteKey);
		}

		if (userHaveAccessToRoute == true) {
			return userHaveAccessToRoute;
		}

		// Caso não tenha em cache. Vai pegar do banco de dados e salvar em memória. Ocorre uma vez na instância (só usar em caso de instancia unica da API).
		const userPermissions = await this.getUserPermissionsFromDatabase(
			identityProviderUID,
			tenantWithRouteAccessRecords
		);

		// Atualiza cache
		this.userRoutesCache.set(identityProviderUID, {
			routes: userPermissions,
			expiry: Date.now() + this.CACHE_TTL
		});

		return userPermissions.has(normalizerRouteKey);
	}

	isUserOnCacheByUserUID(identityProviderUID: string): Boolean {
		const cached = this.userRoutesCache.get(identityProviderUID);

		if (!cached) {
			return false;
		}

		return true;
	}

	private async getUserPermissionsFromDatabase(
		identityProviderUID: string,
		tenantConnection: TenantConnection
	): Promise<Set<string>> {
		const allRoutes = new Set<string>();

		const functionSystemRepository: FunctionSystemRepository =
			new FunctionSystemRepository(tenantConnection);
		const functionSystemList: FunctionSystem[] =
			await functionSystemRepository.advancedSearches.getAccessibleByUserIdentityProviderUID(
				identityProviderUID
			);

		functionSystemList.forEach((functionSystem) => {
			allRoutes.add(`${functionSystem.method}:${functionSystem.route}`);
		});

		return allRoutes;
	}

	//TODO Para toda operação de mudança de acessos da rota, que será chamada no controller aí chama o repository para mudar no banco de dados e depois muda aqui
	/**
	 * Remove o registro em memória do usuário e as rotas que tem acesso
	 * @param identityProviderUID
	 */
	invalidateUserCache(identityProviderUID: string): void {
		this.userRoutesCache.delete(identityProviderUID);
	}

	/**
	 * Limpa da memória os dados de tempos em tempos
	 */
	cleanExpiredCache(): void {
		const now = Date.now();
		for (const [userId, cached] of this.userRoutesCache.entries()) {
			if (cached.expiry <= now) {
				this.userRoutesCache.delete(userId);
			}
		}
	}
}
