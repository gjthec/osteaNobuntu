import { InternalServerError } from '../../errors/internal.error';
import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import DatabaseCredentialRepository from '../../domain/repositories/databaseCredential.repository';
import {
	ITenantConnectionService,
	UserAccess
} from '../../domain/services/ItenantConnection.service';

/**
 * Classe responsável por armazenar na memória instâncias de conexão com banco de dados e gerencia tudo em uma fila
 */
export class TenantConnectionCacheInMemoryService
	implements ITenantConnectionService
{
	private _tenantConnections: Map<number, TenantConnection> = new Map<
		number,
		TenantConnection
	>();
	private _insertionOrder: number[] = []; // Controla a ordem de inserção
	private _maxSize: number;
	private _userAccess: UserAccess[] = []; // Array para controlar acesso dos usuários

	constructor() {
		this._maxSize = parseInt(process.env.MAX_CONNECTIONS || '10');
	}

	/**
	 * Salva em memória uma lista que indica qual usuário pode acessar qual tenant
	 */
	async saveUserAccessOnMemory(securityTenantConnection: TenantConnection) {
		const databaseCredentialRepository: DatabaseCredentialRepository =
			new DatabaseCredentialRepository(securityTenantConnection);
		this._userAccess =
			await databaseCredentialRepository.advancedSearches.getUserAccessList();
	}

	/**
	 * Armazena em memória uma instancia da conexão com o banco de dados
	 * @param databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 * @param connection Instância da conexão com o banco de dados
	 */
	set(databaseCredentialId: number, connection: TenantConnection): void {
		// Se já existe, remove da ordem atual
		if (this._tenantConnections.has(databaseCredentialId)) {
			const index = this._insertionOrder.indexOf(databaseCredentialId);
			if (index > -1) {
				this._insertionOrder.splice(index, 1);
			}
		}

		// Se a fila estiver cheia, remove o mais antigo
		if (
			this._tenantConnections.size >= this._maxSize &&
			!this._tenantConnections.has(databaseCredentialId)
		) {
			this.removeOldest();
		}

		// Adiciona o novo item
		this._tenantConnections.set(databaseCredentialId, connection);
		this._insertionOrder.push(databaseCredentialId);
	}

	// Adiciona acesso de usuário a um tenant connection
	addUserAccess(
		userId: number,
		identityProviderUID: string,
		databaseCredentialId: number
	): void {
		// Verifica se já existe para evitar duplicatas
		const exists = this._userAccess.some(
			(access) =>
				access.userId === userId &&
				access.identityProviderUID === identityProviderUID &&
				access.databaseCredentialId === databaseCredentialId
		);

		if (!exists) {
			this._userAccess.push({
				userId,
				identityProviderUID,
				databaseCredentialId
			});
		}
	}

	/**
	 * Verifica se o usuário tem acesso ao tenant connection
	 * @param identityProviderUID Identificador do usuário no servidor de identidade
	 * @param databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 * @returns retorna verdadeiro se o usuário tem acesso a esse conexão com banco de dados
	 */
	hasUserAccess(
		identityProviderUID: string,
		databaseCredentialId: number
	): boolean {
		if (this._userAccess.length == 0) {
			throw new InternalServerError("Don't have user access data in memory");
		}

		return this._userAccess.some(
			(access) =>
				(access.identityProviderUID === identityProviderUID &&
					access.databaseCredentialId === databaseCredentialId) ||
				(access.isPublic == true &&
					access.databaseCredentialId === databaseCredentialId)
		);
	}

	// Remove acesso de usuário
	removeUserAccess(
		identityProviderUID: string,
		databaseCredentialId: number
	): void {
		this._userAccess = this._userAccess.filter(
			(access) =>
				!(
					access.identityProviderUID === identityProviderUID &&
					access.databaseCredentialId === databaseCredentialId
				)
		);
	}

	// Remove todos os acessos de um tenant connection específico
	private removeAllAccessForTenant(databaseCredentialId: number): void {
		this._userAccess = this._userAccess.filter(
			(access) => access.databaseCredentialId !== databaseCredentialId
		);
	}

	private removeOldest(): void {
		if (this._insertionOrder.length > 0) {
			const oldestId = this._insertionOrder.shift();
			if (oldestId !== undefined) {
				// Não permite remoção do tenant security (gestor de bancos de dados)
				if (
					this._tenantConnections.get(oldestId)?.isTenantManagerDatabase == true
				) {
					return;
				}

				this._tenantConnections.delete(oldestId);
				// Remove também todos os acessos relacionados a este tenant
				this.removeAllAccessForTenant(oldestId);
			}
		}
	}

	/**
	 * Obtem a instancia do TenantConnection
	 * @param databaseCredentialId databaseCredentialId Identificador do banco de dados (id que fica salvo no banco Security, gesto de bancos de dados)
	 * @returns
	 */
	get(databaseCredentialId: number): TenantConnection | null {
		return this._tenantConnections.get(databaseCredentialId) ?? null;
	}

	delete(databaseCredentialId: number): boolean {
		const index = this._insertionOrder.indexOf(databaseCredentialId);
		if (index > -1) {
			this._insertionOrder.splice(index, 1);
		}
		// Remove também todos os acessos relacionados
		this.removeAllAccessForTenant(databaseCredentialId);
		return this._tenantConnections.delete(databaseCredentialId);
	}

	has(databaseCredentialId: number): boolean {
		return this._tenantConnections.has(databaseCredentialId);
	}

	isFull(): boolean {
		return this._tenantConnections.size >= this._maxSize;
	}

	size(): number {
		return this._tenantConnections.size;
	}

	clear(): void {
		this._tenantConnections.clear();
		this._insertionOrder = [];
		this._userAccess = [];
	}

	getInsertionOrder(): number[] {
		return [...this._insertionOrder];
	}

	// Retorna todos os acessos de um usuário específico
	getUserAccesses(identityProviderUID: string): UserAccess[] {
		return this._userAccess.filter(
			(access) => access.identityProviderUID === identityProviderUID
		);
	}
}
