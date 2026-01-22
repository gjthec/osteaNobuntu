import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import { TenantConnectionAccessService } from '../../domain/services/tenantConnection.service';
import { InternalServerError } from '../../errors/internal.error';

export async function disconnectDatabase(tenantConnection: TenantConnection) {
	const tenantConnectionAccessService: TenantConnectionAccessService =
		TenantConnectionAccessService.instance;
	tenantConnectionAccessService.tenantConnectionCache.delete(
		tenantConnection.databaseCredentialId
	);

	if (tenantConnection.databaseType === 'mongodb') {
		await disconnectToDatabaseWithMongoose(tenantConnection);
	} else if (tenantConnection.databaseType === 'firebird') {
		throw new InternalServerError('Method not implemented yet.');
	} else {
		await disconnectToDatabaseWithSequelize(tenantConnection);
	}
}

/**
 * Encerra a conexão com o banco de dados, realizando o uso da biblioteca mongoose
 * @param tenantConnection Dados para realizar a conexão com o banco de dados
 */
async function disconnectToDatabaseWithMongoose(
	tenantConnection: TenantConnection
) {
	try {
		await tenantConnection.connection.close();
		console.log(
			'Conexão encerrada com banco de dados usando a biblioteca mongoose!'
		);
	} catch (error) {
		console.warn(error);
		throw new InternalServerError("Error to disconnect database.", {cause: error});
	}
}

/**
 * Encerra a conexão com o banco de dados, realizando o uso da biblioteca sequelize
 * @param tenantConnection Dados para realizar a conexão com o banco de dados
 */
async function disconnectToDatabaseWithSequelize(
	tenantConnection: TenantConnection
) {
	try {
		await tenantConnection.connection.close();
	} catch (error) {
		throw new InternalServerError('Error on disconect function.', {
			cause: error
		});
	}
}