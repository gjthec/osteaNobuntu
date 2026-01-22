import { BaseResourceModel } from './baseResource.model';
import { Tenant } from './tenant.model';
import { User } from './user.model';

export interface IUserInvitationDatabaseModel extends BaseResourceModel {
	/**
	 * Identificador do usuário no qual quer convidar o outro
	 */
	invitingUserId?: number;
	/**
	 * Caso o convite seja para um usuário já existente na aplicação, o identificador deste usuário
	 */
	invitedUserId?: number;
	/**
	 * Email do usuário que está sendo convidado
	 */
	invitedUserEmail?: string;
	/**
	 * Lista com ids de tenants que o usuário foi convidado a acessar
	 */
	invitedUserTenantIdList?: number[];
}

export interface IUserInvitation extends BaseResourceModel {
	/**
	 * Identificador do usuário no qual quer convidar o outro
	 */
	invitingUser: User;
	/**
	 * Caso o convite seja para um usuário já existente na aplicação, o identificador deste usuário
	 */
	invitedUser?: User;
	/**
	 * Email do usuário que está sendo convidado
	 */
	invitedUserEmail: string;
	/**
	 * Lista com ids de tenants que o usuário foi convidado a acessar
	 */
	invitedUserTenantList: Tenant[];
}

export class UserInvitation extends BaseResourceModel {
	invitingUser: User;
	invitedUser?: User;
	invitedUserEmail: string;
	invitedUserTenantList: number[];

	constructor(data: IUserInvitation) {
		super();
		this.id = data.id;
		this.invitingUser = data.invitingUser;
		this.invitedUser = data.invitedUser;
		this.invitedUserEmail = data.invitedUserEmail;

		//Percorrerá a lista de tenants e irá pegar os Ids que não são undefined
		const _tenantList = data.invitedUserTenantList
			.map((tenant: Tenant) => tenant.id)
			.filter((id): id is number => id !== undefined);

		this.invitedUserTenantList = _tenantList;
	}

	static fromJson(jsonData: IUserInvitation): UserInvitation {
		return new UserInvitation(jsonData);
	}
}
