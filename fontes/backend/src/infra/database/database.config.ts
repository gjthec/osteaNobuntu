import getMongooseModels from './mongoose/models';
import getSequelizeModels from './sequelize/models';
import { saveRoutes } from '../../utils/registerRoutes.util';
import { connectToDatabase } from './databaseConnection.config';
import { decryptDatabasePassword } from '../../utils/crypto.util';
import { GetSecurityTenantConnectionUseCase } from '../../useCases/tenant/getSecurityTenantConnection.useCase';
import { DatabaseCredential } from '../../domain/entities/databaseCredential.model';
import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import DatabaseCredentialRepository from '../../domain/repositories/databaseCredential.repository';
import registerMenu from '../../utils/registerMenu.util';
import {
	ForbiddenError,
	NotFoundError,
	ValidationError
} from '../../errors/client.error';
import { InternalServerError } from '../../errors/internal.error';
import { TenantConnectionAccessService } from '../../domain/services/tenantConnection.service';
import { SyncUserAccountOnTenantsUseCase } from '../../useCases/authentication/syncUserAccountOnTenants.useCase';

export interface DatabaseConnection {
	databaseCredentialId: number;
	tenantConnection: TenantConnection;
}

/**
 * Obtem a instância de conexão com o banco de dados de acordo com o tenant
 * @param {*} tenantId Identificador do tenant que está sendo usado
 * @param {*} identityProviderUID UID do usuário que está fazendo uso do tenant
 * @returns Retorna a instância da conexão com o tenant caso encontrado e o usuário tiver permissão, caso não, será retornado null
 */
export async function getTenantConnection(
	databaseCredentialId: number,
	identityProviderUID: string
): Promise<DatabaseConnection> {
	const tenantConnectionAccessService: TenantConnectionAccessService =
		TenantConnectionAccessService.instance;
	// const tenantConnectionCacheInMemoryService: TenantConnectionCacheInMemoryService = TenantConnectionCacheInMemoryService.instance;
	//Verifica em memória se o usuário tem acesso
	// const hasUserAccess: boolean = tenantConnectionCacheInMemoryService.hasUserAccess(identityProviderUID, databaseCredentialId)
	const hasUserAccess: boolean =
		tenantConnectionAccessService.tenantConnectionCache.hasUserAccess(
			identityProviderUID,
			databaseCredentialId
		);

	if (hasUserAccess == true) {
		const connectedTenant =
			tenantConnectionAccessService.tenantConnectionCache.get(
				databaseCredentialId
			);
		// const connectedTenant = tenantConnectionCacheInMemoryService.get(databaseCredentialId);

		const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
			new GetSecurityTenantConnectionUseCase();
		const securityTenantConnection: TenantConnection =
			await getSecurityTenantConnectionUseCase.execute();

		//Se nao conseguiu o tenant na memória
		if (connectedTenant == null) {
			//Obter a conexão padrão com o banco de dados

			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(securityTenantConnection);

			const databaseCredential =
				await databaseCredentialRepository.findById(databaseCredentialId);

			if (!databaseCredential) {
				throw new NotFoundError('NOT_FOUND', {
					cause: "Database credential don't exist."
				});
			}

			const connectedTenant = await connectTenant(databaseCredential, false);

			tenantConnectionAccessService.tenantConnectionCache.set(
				databaseCredentialId,
				connectedTenant
			);

			return {
				databaseCredentialId: databaseCredentialId,
				tenantConnection: connectedTenant
			};
		} else {
			return {
				databaseCredentialId: databaseCredentialId,
				tenantConnection: connectedTenant
			};
		}
	} else {
		throw new ForbiddenError('FORBIDDEN', {
			cause: "User don't have access to Tenant."
		});
	}
}

/**
 * Realiza a conexão com o banco de dados de acordo com o tipo de banco de dados. Seta os models de acordo com o banco de dados.
 * @param databaseCredentialId
 * @param databaseCredential Dados de credenciais para realizar a conexão do banco de dados
 * @returns
 */
export async function connectTenant(
	databaseCredential: DatabaseCredential,
	decryptEnabled: boolean
): Promise<TenantConnection> {
	//TODO verificar se precisa atualizar o banco (migrações)

	if (!databaseCredential.type || !databaseCredential.password) {
		throw new ValidationError('VALITADION', {
			cause:
				'Erro ao realizar a conexão com o banco de dados. Tipo de banco de dados não definido'
		});
	}

	try {
		if (decryptEnabled == true) {
			//Descriptgrafar a senha do tenant
			if (
				databaseCredential.password != undefined &&
				databaseCredential.password != ''
			) {
				databaseCredential.password = decryptDatabasePassword(
					databaseCredential.password
				)!;
			}

			//TODO Descriptogradar as chaves SSL
		}

		let tenantConnection: TenantConnection;
		const databaseType: string = databaseCredential.type;

		tenantConnection = await connectToDatabase(databaseCredential, false);
		tenantConnection.models = await getModels(databaseType, tenantConnection);

		// Armazena dados de qual usuário pode acessar os tenant no cache
		const tenantConnectionAccessService: TenantConnectionAccessService =
			TenantConnectionAccessService.instance;
		tenantConnectionAccessService.tenantConnectionCache.set(
			databaseCredential.id!,
			tenantConnection
		);

		const syncUserAccountOnTenantsUseCase: SyncUserAccountOnTenantsUseCase =
			new SyncUserAccountOnTenantsUseCase();
		await syncUserAccountOnTenantsUseCase.syncUsersOnDatabase(
			databaseCredential.id!
		);

		await saveRoutes(tenantConnection);

		await registerMenu(tenantConnection);

		console.log(
			'Database: ' +
				databaseCredential.id! +
				'. Database type: ' +
				tenantConnection.databaseType +
				' connect!'
		);

		return tenantConnection;
	} catch (error: unknown) {
		throw new InternalServerError('Error to connect Tenant.', { cause: error });
	}
}

/**
 * Define os models da banco de dados na conexão
 * @param databaseType Tipo de banco de dados
 * @param tenantConnection Instância da conexão com o banco de dados
 * @returns
 */
function getModels(
	databaseType: string,
	tenantConnection: TenantConnection
): any {
	if (databaseType === 'mongodb') {
		return getMongooseModels(tenantConnection);
	} else {
		return getSequelizeModels(tenantConnection);
	}
}
