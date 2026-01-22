import { TenantConnection } from '../entities/tenantConnection.model';

export interface UserAccess {
	userId: number;
	identityProviderUID: string;
	databaseCredentialId: number;
	isPublic?: boolean;
}

/**
 * Responsável pela gestão do armazenamento em cache das permissões de quem tem acesso a qual tenant
 */
export interface ITenantConnectionService {
	/**
	 * Salva em memória uma lista que indica qual usuário pode acessar qual tenant
	 */
	saveUserAccessOnMemory(
		securityTenantConnection: TenantConnection
	): Promise<void>;
	/**
	 * Adiciona acesso de usuário a um tenant connection
	 * @param userId Identificador do usuário
	 * @param identityProviderUID Identificador do usuário no servidor de identidade
	 * @param databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 */
	addUserAccess(
		userId: number,
		identityProviderUID: string,
		databaseCredentialId: number
	): void;
	/**
	 * Verifica se o usuário tem acesso ao tenant connection
	 * @param identityProviderUID Identificador do usuário no servidor de identidade
	 * @param databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 * @returns retorna verdadeiro se o usuário tem acesso a esse conexão com banco de dados
	 */
	hasUserAccess(
		identityProviderUID: string,
		databaseCredentialId: number
	): boolean;
	/**
	 * Remove acesso de usuário
	 * @param identityProviderUID Identificador do usuário no servidor de identidade
	 * @param databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 */
	removeUserAccess(
		identityProviderUID: string,
		databaseCredentialId: number
	): void;
	/**
	 * Obtem a instancia do TenantConnection
	 * @param databaseCredentialId databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 * @returns
	 */
	get(databaseCredentialId: number): TenantConnection | null;
	/**
	 * Remove da lista de instancias de conexões de banco de dados
	 * @param databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 */
	delete(databaseCredentialId: number): boolean;
	/**
	 * Retorna todos os acessos de um usuário específico
	 * @param identityProviderUID Identificador do usuário no servidor de identidade
	 */
	getUserAccesses(identityProviderUID: string): UserAccess[];
	/**
	 * Armazena em memória uma instancia da conexão com o banco de dados
	 * @param databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 * @param connection Instância da conexão com o banco de dados
	 */
	set(databaseCredentialId: number, connection: TenantConnection): void;
}
