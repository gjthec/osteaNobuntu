import { connectTenant } from '../../infra/database/database.config';
import { DatabaseCredential } from '../../domain/entities/databaseCredential.model';
import { User } from '../../domain/entities/user.model';
import UserRepository from '../../domain/repositories/user.repository';
import { GetSecurityTenantConnectionUseCase } from '../tenant/getSecurityTenantConnection.useCase';
import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import DatabaseCredentialRepository from '../../domain/repositories/databaseCredential.repository';
import { InternalServerError } from '../../errors/internal.error';
import { TenantConnectionAccessService } from '../../domain/services/tenantConnection.service';

export interface IUserDataInputDTO {
	identityProviderUID: string; //UID do servidor de identidade
	provider: string;
	userName: string;
	firstName: string;
	lastName?: string;
	isAdministrator?: boolean;
	email: string;
	tenantUID?: number;
}

/**
 * Realizar o cadastro ou atualização dos dados do usuário em todos os bancos de dados que ele tem acesso
 */
export class SyncUserAccountOnTenantsUseCase {
	constructor() {}

	async execute(
		identityProviderUID: string,
		userData: any
	): Promise<DatabaseCredential[]> {
		const tenantUID: string = process.env.TENANT_ID!;

		//Obter o security
		const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
			new GetSecurityTenantConnectionUseCase();
		const securityTenant = await getSecurityTenantConnectionUseCase.execute();

		const databaseCredentialRepository: DatabaseCredentialRepository =
			new DatabaseCredentialRepository(securityTenant);

		//Varrer no security todos os bancos que esse usuário tem acesso
		let databaseCredentialList: DatabaseCredential[] =
			await databaseCredentialRepository.advancedSearches.getAccessibleByUserIdentityProviderUID(
				identityProviderUID
			);

		for (let index = 0; index < databaseCredentialList.length; index++) {
			const databaseCredential = databaseCredentialList[index];

			try {
				//Realizar a conexão em todo tenant para atualizar o usuário neles
				const tenantConnectionAccessService: TenantConnectionAccessService =
					TenantConnectionAccessService.instance;

				let databaseConnection =
					tenantConnectionAccessService.tenantConnectionCache.get(
						databaseCredential.id!
					);

				if (databaseConnection == null) {
					databaseConnection = await connectTenant(databaseCredential, true);
				}

				await this.updateUserOnInternalTenant(
					databaseConnection,
					userData,
					identityProviderUID,
					tenantUID
				);
			} catch (error) {
				throw new InternalServerError(
					'Error to update user register on internal tenants.',
					{ cause: error }
				);
			}
		}

		return databaseCredentialList;
	}

	/**
	 * Função que deve fazer uma verificação de quais usuários não estão registrados no banco de dados e sincroniza com o banco Security
	 */
	async syncUsersOnDatabase(databaseCredentialId: number) {
		const tenantUID: string = process.env.TENANT_ID!;
		//Obter o security
		const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
			new GetSecurityTenantConnectionUseCase();
		const securityTenant = await getSecurityTenantConnectionUseCase.execute();

		const databaseCredentialRepository: DatabaseCredentialRepository =
			new DatabaseCredentialRepository(securityTenant);

		const databaseCredential: DatabaseCredential | null =
			await databaseCredentialRepository.findById(databaseCredentialId);

		if (!databaseCredential) {
			throw new InternalServerError('Database credential not exist.');
		}

		const databaseCredentialUserAccessList: User[] =
			await databaseCredentialRepository.advancedSearches.getUserAccessListByDatabaseCredentialId(
				databaseCredentialId
			);

		try {
			const tenantConnectionAccessService: TenantConnectionAccessService =
				TenantConnectionAccessService.instance;

			let databaseConnection =
				tenantConnectionAccessService.tenantConnectionCache.get(
					databaseCredentialId
				);

			if (databaseConnection == null) {
				databaseConnection = await connectTenant(databaseCredential, true);
			}

			for (
				let databaseCredentialUserAccessListIndex = 0;
				databaseCredentialUserAccessListIndex <
				databaseCredentialUserAccessList.length;
				databaseCredentialUserAccessListIndex++
			) {
				const user =
					databaseCredentialUserAccessList[
						databaseCredentialUserAccessListIndex
					];

				await this.updateUserOnInternalTenant(
					databaseConnection,
					user,
					user.identityProviderUID!,
					tenantUID
				);
			}
		} catch (error) {
			throw new InternalServerError(
				'Error to update user register on internal tenant.',
				{ cause: error }
			);
		}
	}

	async updateUserOnInternalTenant(
		tenantConnection: TenantConnection,
		userData: any,
		userUID: string,
		tenantUID: string
	): Promise<void> {
		try {
			const userRepository: UserRepository = new UserRepository(
				tenantConnection
			);

			//Busca usuário
			let user: User | null = await userRepository.findOne({
				identityProviderUID: userUID
			});
			//verificar se a aplicação tem outro usuário
			const hasRegisteredUser = await userRepository.hasRegisteredUser();

			let isAdministrator: boolean = false;

			if (hasRegisteredUser == false) {
				isAdministrator = true;
			}

			if (user == null) {
				try {
					user = await userRepository.create(
						new User({
							// identityProviderUID: userData.identityProviderUID,
							// provider: userData.provider,
							// userName: userData.userName,
							// firstName: userData.firstName,
							// lastName: userData.lastName,
							isAdministrator: isAdministrator,
							// email: userData.email,
							tenantUID: tenantUID,
							...userData
						})
					);
				} catch (error) {
					throw new InternalServerError(
						'Error to register User on internal tenant.',
						{ cause: error }
					);
				}
			} else {
				try {
					//Atualiza os dados de usuário que estão no servidor de identidade para o banco de dados de uso
					user = await userRepository.update(user.id!, {
						// UID: userData.UID,//UID do servidor de identidade
						// userName: userData.userName,
						// firstName: userData.firstName,
						// lastName: userData.lastName,
						// email: userData.email,
						...userData
					});
				} catch (error) {
					throw new InternalServerError(
						'Error to update User on internal tenant.',
						{ cause: error }
					);
				}
			}
		} catch (error) {
			throw new InternalServerError('Error update user on internal tenant.', {
				cause: error
			});
		}
	}
}