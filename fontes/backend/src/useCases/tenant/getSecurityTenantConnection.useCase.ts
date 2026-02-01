import { DatabaseType } from '../../infra/database/createDb.adapter';
import { connectToDatabase } from '../../infra/database/databaseConnection.config';
import { getEnvironmentNumber } from '../../utils/environmentGetters.util';
import getMongooseSecurityModels from '../../infra/database/mongoose/models/indexSecurity';
import getSequelizeSecurityModels from '../../infra/database/sequelize/models/indexSecurity.model';
import { DatabaseInitializer } from '../../domain/repositories/databaseInitializer';
import { SequelizeDatabaseInitializer } from '../../infra/database/sequelize/sequelizeDatabaseInitializer';
import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import { DatabaseCredential } from '../../domain/entities/databaseCredential.model';
import { MongooseDatabaseInitializer } from '../../infra/database/mongoose/mongooseDatabaseInitializer';
import { Tenant } from '../../domain/entities/tenant.model';
import { TenantConnectionCacheInMemoryService } from '../../infra/cache/tenantConnectionCacheInMemory.service';
import { InternalServerError } from '../../errors/internal.error';
import { TenantConnectionAccessService } from '../../domain/services/tenantConnection.service';

export class GetSecurityTenantConnectionUseCase {
	constructor() {}

	/**
	 * Obter a instância de conexão com o banco de dados. Sendo esse banco de dados do banco responsável por armazenar os tenants. Sendo chaamdo de banco 'default'.
	 * @returns retornar uma instância de conexão com o banco de dados
	 */
	async execute(): Promise<TenantConnection> {
		const tenantCredentialId: number = 0;
		console.log('GetSecurityTenantConnectionUseCase: start', {
			tenantCredentialId
		});

		const securityDatabaseName = process.env.SECURITY_TENANT_DATABASE_NAME;
		if (!securityDatabaseName) {
			throw new Error(
				'Missing SECURITY_TENANT_DATABASE_NAME environment variable.'
			);
		}

		const databaseCredential: DatabaseCredential = new DatabaseCredential({
			id: 0,
			name: securityDatabaseName.toLowerCase(),
			type: process.env.SECURITY_TENANT_DATABASE_TYPE as DatabaseType,
			username: process.env.SECURITY_TENANT_DATABASE_USERNAME,
			password: process.env.SECURITY_TENANT_DATABASE_PASSWORD,
			host: process.env.SECURITY_TENANT_DATABASE_HOST!,
			port: process.env.SECURITY_TENANT_DATABASE_PORT!,
			srvEnabled:
				process.env.SECURITY_TENANT_DATABASE_SRV_ENABLED === 'true'
					? true
					: false,
			options: process.env.SECURITY_TENANT_DATABASE_OPTIONS,
			storagePath: process.env.SECURITY_TENANT_DATABASE_STORAGE_PATH,
			sslEnabled:
				process.env.SECURITY_TENANT_DATABASE_SSL_ENABLED === 'true'
					? true
					: false,
			poolSize: getEnvironmentNumber('SECURITY_TENANT_DATABASE_POOLSIZE', 1),
			timeOutTime: getEnvironmentNumber(
				'SECURITY_TENANT_DATABASE_TIMEOUT',
				3000
			),
			isPublic: true,
			tenant: new Tenant({ name: 'security', id: 0, ownerUser: 0 }),
			//SSL data
			sslCertificateAuthority:
				process.env.SECURITY_TENANT_DATABASE_SSL_CERTIFICATE_AUTHORITY,
			sslPrivateKey: process.env.SECURITY_TENANT_DATABASE_SSL_PRIVATE_KEY,
			sslCertificate: process.env.SECURITY_TENANT_DATABASE_SSL_CERTIFICATE
		});

		if (
			databaseCredential.checkDatabaseCredential(databaseCredential) == false ||
			tenantCredentialId == undefined
		) {
			throw new Error(
				'Missing data on environment variables to connect Security Tenant.'
			);
		}

		const tenantConnectionAccessService: TenantConnectionAccessService =
			TenantConnectionAccessService.instance;

		let tenantConnection: TenantConnection | null =
			tenantConnectionAccessService.tenantConnectionCache.get(
				tenantCredentialId
			);

		if (tenantConnection != null) {
			console.log('GetSecurityTenantConnectionUseCase: cache hit');
			return tenantConnection;
		}

		try {
			console.log('GetSecurityTenantConnectionUseCase: connecting to database');
			tenantConnection = await connectToDatabase(databaseCredential, true);
		} catch (error) {
			console.error(
				'GetSecurityTenantConnectionUseCase: initial connection failed',
				error
			);
			let databaseInitializer: DatabaseInitializer;

			if (databaseCredential.type === 'mongodb') {
				databaseInitializer = new MongooseDatabaseInitializer();
			} else {
				databaseInitializer = new SequelizeDatabaseInitializer();
			}
			await databaseInitializer.createDatabaseIfNotExists(
				databaseCredential.name!,
				databaseCredential.username!,
				databaseCredential.password!,
				databaseCredential.host!,
				Number(databaseCredential.port),
				databaseCredential.type
			);

			tenantConnection = await connectToDatabase(databaseCredential, true);
		}

		tenantConnection!.models = await this.getModelsSecurity(
			databaseCredential.type!,
			tenantConnection!
		);

		tenantConnectionAccessService.tenantConnectionCache.set(
			tenantCredentialId,
			tenantConnection!
		);

		try {
			const tenantConnectionAccessService: TenantConnectionAccessService =
				TenantConnectionAccessService.instance;
			tenantConnectionAccessService.tenantConnectionCache.saveUserAccessOnMemory(
				tenantConnection
			);
			console.log('GetSecurityTenantConnectionUseCase: cache updated');
		} catch (error) {
			throw new InternalServerError(
				'Error on save users access tenants on memory.',
				{ cause: error }
			);
		}

		console.log(
			'Connection established with the Security database. Responsible for managing Tenants.'
		);
		return tenantConnection!;
	}

	/**
	 * Define os models da banco de dados Security na conexão
	 * @param databaseType Tipo de banco de dados
	 * @param connection Instância da conexão com o banco de dados
	 * @returns
	 */
	getModelsSecurity(
		databaseType: string,
		tenantConnection: TenantConnection
	): any {
		if (databaseType === 'mongodb') {
			return getMongooseSecurityModels(tenantConnection);
		} else {
			return getSequelizeSecurityModels(tenantConnection);
		}
	}
}
