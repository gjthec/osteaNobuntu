/**
 * Indica qual usuário pode acessar a rota
 */

import { TenantConnection } from '../entities/tenantConnection.model';

// Nesssa estrutura vai repetir muito as rotas mas, isso aqui em memória é pra aplicação pequena, maior vai pro Redis.
export interface CachedUserPermissions {
	userId?: string;
	routes: Set<string>;
	expiry: number;
}
/**
 * Responsável pela gestão do armazenamento em cache das permissões de quem tem acesso a rota da API
 */
export interface IUserRouteAccessService {
	/**
	 * Verifica se o usuário tem acesso a rota da API
	 * @param identityProviderUID Identificador do usuário no servidor de identidade
	 * @param method Método da requisição (GET, POST, PUT, DELETE)
	 * @param path Caminho da rota
	 * @param tenantWithRouteAccessRecords Dados de conexão com banco de dados no qual armazena acesso as rotas
	 * @returns retorna verdadeiro se o usuário tem acesso a rota da API
	 */
	hasUserAccessByUserUID(
		identityProviderUID: string,
		method: string,
		path: string,
		tenantWithRouteAccessRecords: TenantConnection
	): Promise<boolean>;
	/**
	 * Verifica se o usuário está presente em cache
	 * @param identityProviderUID Identificador do usuário no servidor de identidade
	 */
	isUserOnCacheByUserUID(identityProviderUID: string): Boolean;
	/**
	 * Remove o registro em memória do usuário e as rotas que tem acesso
	 * @param identityProviderUID
	 */
	invalidateUserCache(identityProviderUID: string): void;
}
