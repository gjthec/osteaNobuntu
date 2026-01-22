import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	IDatabaseCredentialDatabaseModel,
	DatabaseCredential,
	IDatabaseCredential
} from '../entities/databaseCredential.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';
import { DatabaseCredentialRepositoryMongoose } from '../../infra/database/mongoose/repositories/databaseCredential.repository';
import { DatabaseCredentialRepositorySequelize } from '../../infra/database/sequelize/repositories/databaseCredential.repository';
import { UserAccess } from '../services/ItenantConnection.service';
import { User } from '../entities/user.model';

export interface IDatabaseCredentialRepository {
	/**
	 * Realiza o registro no banco de dados do DatabaseCredential que são os parâmetros de filtros usados pela aplicação
	 * @param databaseCredential Dados do databaseCredential
	 * @param userId Identificador do usuário que criou
	 * @returns Retorna os dados do DatabaseCredential caso salvamento no banco de dados com sucesso
	 */
	create(
		databaseCredential: IDatabaseCredential,
		userId: number
	): Promise<DatabaseCredential>;
	/**
	 * Realiza a remoção do registro do DatabaseCredential do banco de dados, avaliando se quem requisitou pode fazer isso, ver se conflita com outros registros e relacionamentos no banco de dados.
	 * @param databaseCredentialId Identificador do databaseCredential
	 * @param userId Identificador do usuário que fez a requisição de remoção do banco de dados
	 * @returns Retorna os dados do DatabaseCredential caso remoção no banco de dados com sucesso
	 */
	delete(
		databaseCredentialId: number,
		userId: number
	): Promise<DatabaseCredential>;
	/**
	 * Um usuário dá permissão de acesso a outro usuário para vizualizar registro DatabaseCredential
	 * @param permissionGiverId Id od usuário no qual irá dar a permissão
	 * @param permissionReceiverId Id do usuário no qual irá receber a permissão
	 * @param databaseCredentialId Id do database credential
	 * @param accessLevel Nível de acesso
	 * @returns Retorna os dados do DatabaseCredential caso salvamento no banco de dados com sucesso
	 */
	setUserPermissionForDatabaseCredential(
		permissionGiverId: number,
		permissionReceiverId: number,
		databaseCredentialId: number,
		accessLevel: string
	): Promise<DatabaseCredential>;
	/**
	 * Um usuário dá permissão de acesso a uma Role (permissão) para vizualizar registro DatabaseCredential
	 * @param permissionGiverId Id od usuário no qual irá dar a permissão
	 * @param roleId Id da Role no qual irá receber a permissão
	 * @param databaseCredentialId Id do filtro
	 * @param accessLevel Nível de acesso
	 * @returns Retorna os dados do DatabaseCredential caso salvamento no banco de dados com sucesso
	 */
	setRolePermissionForDatabaseCredential(
		permissionGiverId: number,
		roleId: number,
		databaseCredentialId: number,
		accessLevel: string
	): Promise<DatabaseCredential>;
	/**
	 * Remove o acesso de um usuário aos registros de DatabaseCredential por outro usuário.
	 * @param permissionRemoverId ID do usuário que irá remover dar a permissão de acesso.
	 * @param permissionRevokeeId ID do usuário que terá sua permissão de acesso removido.
	 * @param databaseCredentialId ID do filtro que será alterado a permissão.
	 * @returns Retorna os dados do DatabaseCredential caso remoção de relacionamento no banco de dados tenha sucesso
	 */
	removeUserPermissionForDatabaseCredential(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential>;
	/**
	 * Remove o acesso de um usuário aos registros de DatabaseCredential por outro usuário.
	 * @param permissionRemoverId ID do usuário que irá remover dar a permissão de acesso.
	 * @param roleId ID da Role que terá sua permissão de acesso removido.
	 * @param databaseCredentialId ID do filtro que será alterado a permissão.
	 * @returns Retorna os dados do DatabaseCredential caso remoção de relacionamento no banco de dados tenha sucesso
	 */
	removeRolePermissionForDatabaseCredential(
		permissionRemoverId: number,
		roleId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential>;
	/**
	 * Obter todos os registros de DatabaseCredential no qual o usuário é dono (accessLevel como "owner"), seja por role ou por usuário.
	 * @param userId Id do usuário
	 * @returns Retorna uma lista com registros de registros de DatabaseCredential no qual o usuário é dono.
	 */
	getByOwner(userId: number): Promise<DatabaseCredential[]>;
	/**
	 * Obter todos os registros de DatabaseCredential no qual é público para todos os usuários
	 * @returns Retorna uma lista com registros de registros de DatabaseCredential
	 */
	getPublic(): Promise<DatabaseCredential[]>;
	/**
	 * Obtem todas os registros de DatabaseCredential que o usuário tem permissão
	 * @param userId Identificador do usuário
	 * @returns Lista com DatabaseCredentials
	 */
	getByUserPermissions(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]>;
	/**
	 * Obtem uma lista de DatabaseCredentials de acordo com a Role (permissão)
	 * @param roleId Identificador da Role (permissão)
	 * @param pageSize Quantidade de itens por página
	 * @param page Pagina
	 * @returns Retorna uma lista de DatabaseCredentials
	 */
	getByRolePermissions(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]>;
	/**
	 * Obtem uma lista de DatabaseCredentials de acordo com as Roles (permissões) ou o usuário que tem acesso.
	 * @param userId Identificador do usuário
	 * @param roleIdList Lista com identificadores de Roles (permissões)
	 * @param pageSize Quantidade de itens por página
	 * @param page Pagina
	 * @returns Retorna uma lista de DatabaseCredentials
	 */
	getAccessible(
		userId: number,
		roleIdList: number[],
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]>;
	/**
	 * Retorna uma lista de DatabaseCredential que o usuário tem acesso com base em seu identityProviderUID. Levando em consideração as DatabaseCredentials públicos, DatabaseCredentials que o usuário tem acesso e DatabaseCredentials que o usuário tem a Role na qual tem acesso a rota.
	 * @param identityProviderUID Identificador de usuário que é criado pelo servidor de identidade
	 * @param pageSize Registros por pagina retornada
	 * @param page Indicador da pagina que é retornada
	 */
	getAccessibleByUserIdentityProviderUID(
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]>;
	/**
	 * O usuário passar o cargo de dono do banco de dados para outro usuário
	 * @param oldOwnerUserId Identificador do usuário que é o antigo dono
	 * @param newOwnerUserId Identificador do usuário que será o novo dono
	 * @param databaseCredentialId Identificador do databaseCredential
	 */
	changeDatabaseOwner(
		oldOwnerUserId: number,
		newOwnerUserId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential>;
	/**
	 * Obtem um lista na qual indica qual usuário tem acesso ao tenant
	 * @returns Retorna uma lista com acessos dos usuários
	 */
	getUserAccessList(): Promise<UserAccess[]>;
	/**
	 * Obtem um lista na qual indica qual usuário tem acesso ao tenant
	 * @param databaseCredentialId Indentificador do databaseCredential
	 * @returns Retorna uma lista com acessos dos usuários
	 */
	getUserAccessListByDatabaseCredentialId(
		databaseCredentialId: number
	): Promise<User[]>;
}

export default class DatabaseCredentialRepository extends BaseRepository<
	IDatabaseCredentialDatabaseModel,
	DatabaseCredential
> {
	advancedSearches: IDatabaseCredentialRepository;

	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IDatabaseCredentialDatabaseModel,
			DatabaseCredential
		> = createDbAdapter<IDatabaseCredentialDatabaseModel, DatabaseCredential>(
			tenantConnection.models!.get('DatabaseCredential'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			DatabaseCredential.fromJson
		);
		super(_adapter, tenantConnection);

		if (tenantConnection.databaseType === 'mongodb') {
			this.advancedSearches = new DatabaseCredentialRepositoryMongoose(
				this.tenantConnection,
				this.adapter
			);
		} else {
			this.advancedSearches = new DatabaseCredentialRepositorySequelize(
				this.tenantConnection,
				this.adapter
			);
		}
	}
}
