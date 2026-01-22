import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { FilterSearchParameterRepositoryMongoose } from '../../infra/database/mongoose/repositories/filterSearchParameter.repository';
import { FilterSearchParameterRepositorySequelize } from '../../infra/database/sequelize/repositories/filterSearchParameter.repository';
import {
	IFilterSearchParameterDatabaseModel,
	FilterSearchParameter,
	IFilterSearchParameter
} from '../entities/filterSearchParameter.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export interface IFilterSearchParameterRepository {
	/**
	 * Faz a verificação se o usuário tem acesso a realizar alguma ação (criar, ler, atualizar, remover) no recurso
	 * @param filterSearchParameterId Identificador do filterSearchParameter
	 * @param userAccessLevelList Array que indica qual tipo de acesso o usuário deve ter mapa realizar a ação (create, read, update, delete, owner);
	 * @param roleAccessLevelList Array que indica qual tipo de acesso a role do usuário deve ter mapa realizar a ação (create, read, update, delete, owner);
	 * @param userIdentityProviderUID Identificador de usuário que é criado pelo servidor de identidade
	 * @returns Retorna o identificador do usuário
	 */
	checkUserAccess(
		filterSearchParameterId: number,
		userAccessLevelList: string[],
		roleAccessLevelList: string[],
		userIdentityProviderUID: string
	): Promise<number>;
	/**
	 * Realiza o registro no banco de dados do FilterSearchParameter que são os parâmetros de filtros usados pela aplicação
	 * @param filterSearchParameter Dados do filterSearchParameter
	 * @param userIdentityProviderUID Identificador de usuário que é criado pelo servidor de identidade
	 * @returns Retorna os dados do FilterSearchParameter caso salvamento no banco de dados com sucesso
	 */
	create(
		filterSearchParameter: IFilterSearchParameter,
		userIdentityProviderUID: string
	): Promise<FilterSearchParameter>;
	/**
	 * Realiza a remoção do registro do FilterSearchParameter do banco de dados, avaliando se quem requisitou pode fazer isso, ver se conflita com outros registros e relacionamentos no banco de dados.
	 * @param filterSearchParameterId Identificador do filterSearchParameter
	 * @param userIdentityProviderUID Identificador de usuário que é criado pelo servidor de identidade
	 * @returns Retorna os dados do FilterSearchParameter caso remoção no banco de dados com sucesso
	 */
	delete(
		filterSearchParameterId: number,
		userIdentityProviderUID: string
	): Promise<FilterSearchParameter>;
	/**
	 * Um usuário dá permissão de acesso a outro usuário para vizualizar registro FilterSearchParameter
	 * @param permissionGiverId Id od usuário no qual irá dar a permissão
	 * @param permissionReceiverId Id do usuário no qual irá receber a permissão
	 * @param filterSearchParameterId Id do filtro
	 * @param accessLevel Nível de acesso
	 * @returns Retorna os dados do FilterSearchParameter caso salvamento no banco de dados com sucesso
	 */
	setUserPermissionForFilterSearchParameter(
		permissionGiverId: number,
		permissionReceiverId: number,
		filterSearchParameterId: number,
		accessLevel: string
	): Promise<FilterSearchParameter>;
	/**
	 * Um usuário dá permissão de acesso a uma Role (permissão) para vizualizar registro FilterSearchParameter
	 * @param permissionGiverId Id od usuário no qual irá dar a permissão
	 * @param roleId Id da Role no qual irá receber a permissão
	 * @param filterSearchParameterId Id do filtro
	 * @param accessLevel Nível de acesso
	 * @returns Retorna os dados do FilterSearchParameter caso salvamento no banco de dados com sucesso
	 */
	setRolePermissionForFilterSearchParameter(
		permissionGiverId: number,
		roleId: number,
		filterSearchParameterId: number,
		accessLevel: string
	): Promise<FilterSearchParameter>;
	/**
	 * Remove o acesso de um usuário aos registros de FilterSearchParameter por outro usuário.
	 * @param permissionRemoverId ID do usuário que irá remover dar a permissão de acesso.
	 * @param permissionRevokeeId ID do usuário que terá sua permissão de acesso removido.
	 * @param filterSearchParameterId ID do filtro que será alterado a permissão.
	 * @returns Retorna os dados do FilterSearchParameter caso remoção de relacionamento no banco de dados tenha sucesso
	 */
	removeUserPermissionForFilterSearchParameter(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		filterSearchParameterId: number
	): Promise<FilterSearchParameter>;
	/**
	 * Remove o acesso de um usuário aos registros de FilterSearchParameter por outro usuário.
	 * @param permissionRemoverId ID do usuário que irá remover dar a permissão de acesso.
	 * @param roleId ID da Role que terá sua permissão de acesso removido.
	 * @param filterSearchParameterId ID do filtro que será alterado a permissão.
	 * @returns Retorna os dados do FilterSearchParameter caso remoção de relacionamento no banco de dados tenha sucesso
	 */
	removeRolePermissionForFilterSearchParameter(
		permissionRemoverId: number,
		roleId: number,
		filterSearchParameterId: number
	): Promise<FilterSearchParameter>;
	/**
	 * Obter todos os registros de FilterSearchParameter no qual o usuário é dono (accessLevel como "owner"), seja por role ou por usuário.
	 * @param userId Id do usuário
	 * @returns Retorna uma lista com registros de registros de FilterSearchParameter no qual o usuário é dono.
	 */
	getByOwner(userId: number): Promise<FilterSearchParameter[]>;
	/**
	 * Obter todos os registros de FilterSearchParameter no qual é público para todos os usuários
	 * @returns Retorna uma lista com registros de registros de FilterSearchParameter
	 */
	getPublic(): Promise<FilterSearchParameter[]>;
	/**
	 * Obtem todas os registros de FilterSearchParameter que o usuário tem permissão
	 * @param userId Identificador do usuário
	 * @returns Lista com FilterSearchParameters
	 */
	getByUserPermissions(userId: number): Promise<FilterSearchParameter[]>;
	/**
	 * Obtem uma lista de FilterSearchParameters de acordo com a Role (permissão)
	 * @param roleId Identificador da Role (permissão)
	 * @param pageSize Quantidade de itens por página
	 * @param page Pagina
	 * @returns Retorna uma lista de FilterSearchParameters
	 */
	getByRolePermissions(roleId: number): Promise<FilterSearchParameter[]>;
	/**
	 * Obtem uma lista de FilterSearchParameters de acordo com as Roles (permissões) ou o usário que tem acesso.
	 * @param userId Identificador do usuário
	 * @param roleIdList Lista com identificadores de Roles (permissões)
	 * @param pageSize Quantidade de itens por página
	 * @param page Pagina
	 * @returns Retorna uma lista de FilterSearchParameters
	 */
	getAccessible(
		userId: number,
		roleIdList: number[]
	): Promise<FilterSearchParameter[]>;
	/**
	 * Retorna uma lista de FilterSearchParameters que o usuário tem acesso com base em seu identityProviderUID. Levando em consideração as FilterSearchParameters públicos, FilterSearchParameters que o usuário tem acesso e FilterSearchParameters que o usuário tem a Role na qual tem acesso a rota.
	 * @param identityProviderUID Identificador de usuário que é criado pelo servidor de identidade
	 * @param pageSize Registros por pagina retornada
	 * @param page Indicador da pagina que é retornada
	 */
	getAccessibleByUserIdentityProviderUID(
		className: string,
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<FilterSearchParameter[]>;
	/**
	 * Retorna quantidade de FilterSearchParameters que o usuário tem acesso com base em seu identityProviderUID. Levando em consideração as FilterSearchParameters públicos, FilterSearchParameters que o usuário tem acesso e FilterSearchParameters que o usuário tem a Role na qual tem acesso a rota.
	 * @param identityProviderUID Identificador de usuário que é criado pelo servidor de identidade
	 * @param pageSize Registros por pagina retornada
	 * @param page Indicador da pagina que é retornada
	 */
	getCountAccessibleByUserIdentityProviderUID(
		className: string,
		identityProviderUID: string
	): Promise<number>;
}

export default class FilterSearchParameterRepository extends BaseRepository<
	IFilterSearchParameterDatabaseModel,
	FilterSearchParameter
> {
	private databaseModels: any;
	advancedSearches: IFilterSearchParameterRepository;

	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IFilterSearchParameterDatabaseModel,
			FilterSearchParameter
		> = createDbAdapter<
			IFilterSearchParameterDatabaseModel,
			FilterSearchParameter
		>(
			tenantConnection.models!.get('FilterSearchParameter'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			FilterSearchParameter.fromJson
		);
		super(_adapter, tenantConnection);

		if (tenantConnection.databaseType === 'mongodb') {
			this.advancedSearches = new FilterSearchParameterRepositoryMongoose(
				this.tenantConnection,
				this.adapter
			);
		} else {
			this.advancedSearches = new FilterSearchParameterRepositorySequelize(
				this.tenantConnection,
				this.adapter
			);
		}
	}
}
