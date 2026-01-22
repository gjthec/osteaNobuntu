import { DatabaseCredential } from '../../domain/entities/databaseCredential.model';
import { Tenant } from '../../domain/entities/tenant.model';
import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import DatabaseCredentialRepository from '../../domain/repositories/databaseCredential.repository';
import TenantRepository from '../../domain/repositories/tenant.repository';
import { InternalServerError } from '../../errors/internal.error';
import { GetSecurityTenantConnectionUseCase } from './getSecurityTenantConnection.useCase';

export class RegisterDefaultTenantUseCase {
	constructor() {}

	/**
	 * Salva dados do banco de dados padrão no bando de dados do Tenant Security, que é o banco de dados de controle de tenants.
	 * @param databaseCredential Dados das credenciais de acesso ao banco de dados do Tenant Padrão do projeto
	 */
	async execute(
		databaseCredential: DatabaseCredential
	): Promise<DatabaseCredential> {
		try {
			const defaultTenantName: string = 'default';

			const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
				new GetSecurityTenantConnectionUseCase();
			const securityTenantConnection: TenantConnection =
				await getSecurityTenantConnectionUseCase.execute();

			const tenantRepository: TenantRepository = new TenantRepository(
				securityTenantConnection
			);

			const transaction = await tenantRepository.startTransaction();

			let tenant: Tenant | null;

			try {
				tenant = await tenantRepository.findOne({ name: defaultTenantName });
				if (tenant == null) {
					tenant = await tenantRepository.createWithTransaction(
						{ name: defaultTenantName },
						transaction
					);
				}
			} catch (error) {
				throw new InternalServerError(
					'Unknown error on Save Default Tenant on Security Tenant function. Unknown error on create Tenant.',
					{ cause: error }
				);
			}

			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(securityTenantConnection);

			let _databaseCredential: DatabaseCredential | null;

			_databaseCredential = await databaseCredentialRepository.findOne({
				tenantId: tenant.id
			});
			if (!_databaseCredential) {
				try {
					_databaseCredential = new DatabaseCredential(
						await databaseCredentialRepository.createWithTransaction(
							{ tenantId: tenant.id, ...databaseCredential },
							transaction
						)
					);
				} catch (error) {
					throw new InternalServerError(
						'Error to create Database Credential.',
						{ cause: error }
					);
				}
			} else {
				try {
					_databaseCredential = new DatabaseCredential(
						await databaseCredentialRepository.updateWithTransaction(
							_databaseCredential.id!,
							{ tenantId: tenant.id, ...databaseCredential },
							transaction
						)
					);
				} catch (error) {
					throw new InternalServerError(
						'Error to update Database Credential.',
						{ cause: error }
					);
				}
			}

			await tenantRepository.commitTransaction(transaction);

			return _databaseCredential;
		} catch (error) {
			throw new InternalServerError('Error to register Default Tenant.', {
				cause: error
			});
		}
	}
}