import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { FunctionSystemRepositoryMongoose } from '../../infra/database/mongoose/repositories/functionSystem.repository';
import { FunctionSystemRepositorySequelize } from '../../infra/database/sequelize/repositories/functionSystem.repository';
import {
	IFunctionSystemDatabaseModel,
	FunctionSystem,
	IFunctionSystem
} from '../entities/functionSystem.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export interface IFunctionSystemRepository {
	/**
	 * Realiza o registro no banco de dados do FunctionSystem que são os dados das rotas
	 * @param functionSystem Dados do functionSystem
	 * @param userId Identificador do usuário que criou
	 * @returns Retorna os dados do FunctionSystem caso salvamento no banco de dados com sucesso
	 */
	create(
		functionSystem: IFunctionSystem,
		userId: number
	): Promise<FunctionSystem>;
	/**
	 * Realiza a remoção do registro do FunctionSystem do banco de dados, avaliando se quem requisitou pode fazer isso, ver se conflita com outros registros e relacionamentos no banco de dados.
	 * @param functionSystemId Identificador do functionSystem
	 * @param userId Identificador do usuário que fez a requisição de remoção do banco de dados
	 * @returns Retorna os dados do FunctionSystem caso remoção no banco de dados com sucesso
	 */
	delete(functionSystemId: number, userId: number): Promise<FunctionSystem>;
	/**
	 * Um usuário dá permissão de acesso a outro usuário para vizualizar registro FunctionSystem
	 * @param permissionGiverId Id od usuário no qual irá dar a permissão
	 * @param permissionReceiverId Id do usuário no qual irá receber a permissão
	 * @param functionSystemId Id do filtro
	 * @param accessLevel Nível de acesso
	 * @returns Retorna os dados do FunctionSystem caso salvamento no banco de dados com sucesso
	 */
	setUserPermissionForFunctionSystem(
		permissionGiverId: number,
		permissionReceiverId: number,
		functionSystemId: number,
		accessLevel: string
	): Promise<FunctionSystem>;
	setRolePermissionForFunctionSystem(
		permissionGiverId: number,
		roleId: number,
		functionSystemId: number,
		accessLevel: string
	): Promise<FunctionSystem>;
	removeUserPermissionForFunctionSystem(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		functionSystemId: number
	): Promise<FunctionSystem>;
	removeRolePermissionForFunctionSystem(
		permissionRemoverId: number,
		roleId: number,
		functionSystemId: number
	): Promise<FunctionSystem>;
	/**
	 * Obter todos os registros de FunctionSystem no qual o usuário é dono (accessLevel como "owner"), seja por role ou por usuário.
	 * @param userId Id do usuário
	 * @returns Retorna uma lista com registros de registros de FunctionSystem no qual o usuário é dono.
	 */
	getByOwner(userId: number): Promise<FunctionSystem[]>;
	/**
	 * Obtem todas os registros de FunctionSystem publicos
	 * @returns Retorna uma lista com registros de registros de FunctionSystem
	 */
	getPublic(pageSize?: number, page?: number): Promise<FunctionSystem[]>;
	/**
	 * Retorna registros de rotas na qual o usuário tem acesso. Sem contar as públicas.
	 * @param userId Identificador do usuário
	 * @param pageSize Registros por pagina retornada
	 * @param page Indicador da pagina que é retornada
	 */
	getByUserPermissions(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]>;
	/**
	 * Retorna registros de rotas na qual o usuário tem acesso pela sua role/permissão. Sem contar as públicas.
	 * @param roleId Identificador da role/permissão do usuário
	 * @param pageSize Registros por pagina retornada
	 * @param page Indicador da pagina que é retornada
	 */
	getByRolePermissions(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]>;
	/**
	 * Obtem todas as FunctionSystem/rotas no qual o usuário seja pelo seu identificador ou role/permissão.
	 * @param userId Identificador do usuário
	 */
	getAccessible(
		userId: number,
		roleIdList: number[],
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]>;
	/**
	 * Retorna uma lista de rotas/FunctionSystem que o usuário tem acesso com base em seu identityProviderUID. Levando em consideração as rotas públicas, rotas que o usuário tem acesso e rotas que o usuário tem a Role na qual tem acesso a rota.
	 * @param identityProviderUID Identificar de usuário que é criado pelo servidor de identidade
	 * @param pageSize Registros por pagina retornada
	 * @param page Indicador da pagina que é retornada
	 */
	getAccessibleByUserIdentityProviderUID(
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]>;
}

export default class FunctionSystemRepository extends BaseRepository<
	IFunctionSystemDatabaseModel,
	FunctionSystem
> {
	private databaseModels: any;
	/**
	 * Implementação de funções de operações no banco de dados mais complexas e personalizadas
	 */
	advancedSearches: IFunctionSystemRepository;

	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IFunctionSystemDatabaseModel,
			FunctionSystem
		> = createDbAdapter<IFunctionSystemDatabaseModel, FunctionSystem>(
			tenantConnection.models!.get('FunctionSystem'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			FunctionSystem.fromJson
		);
		super(_adapter, tenantConnection);

		if (tenantConnection.databaseType === 'mongodb') {
			this.advancedSearches = new FunctionSystemRepositoryMongoose(
				this.tenantConnection,
				this.adapter
			);
		} else {
			this.advancedSearches = new FunctionSystemRepositorySequelize(
				this.tenantConnection,
				this.adapter
			);
		}
	}
}