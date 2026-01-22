import mongoose, { Connection } from 'mongoose';
import { Dialect, Sequelize } from 'sequelize';
import { IDatabaseCredential } from '../../domain/entities/databaseCredential.model';
import { TenantConnection } from '../../domain/entities/tenantConnection.model';
import {
	InternalServerError,
	ServiceUnavailableError
} from '../../errors/internal.error';

/**
 * Realiza a conexão com o banco de dados definido
 * @param databaseCredential Dados das credenciais do banco de dados
 * @param isTenantManagerDatabase Se a conexão é padrão (só o Security pode ser padrão)
 * @returns Retorna uma instância da TenantConnection que é a conexão com o banco de dados especificado
 */
export async function connectToDatabase(
	databaseCredential: IDatabaseCredential,
	isTenantManagerDatabase: boolean
): Promise<TenantConnection> {
	try {
		let databaseConnection;
		if (databaseCredential.type === 'mongodb') {
			databaseConnection =
				await connectToDatabaseWithMongoose(databaseCredential);
		} else if (databaseCredential.type === 'firebird') {
			databaseConnection =
				await connectToDatabaseWithFirebird(databaseCredential);
		} else {
			databaseConnection = await connectToDatabaseWithSequelize(
				databaseCredential,
				true
			);
		}

		if (databaseCredential.id == undefined) {
			throw new InternalServerError('Database credential id is null.');
		}

		return new TenantConnection(
			databaseCredential.type!,
			databaseConnection,
			databaseCredential.id,
			isTenantManagerDatabase
		);
	} catch (error) {
		throw new InternalServerError('Error to connect database.', {
			cause: error
		});
	}
}

async function connectToDatabaseWithMongoose(
	databaseCredential: IDatabaseCredential
): Promise<Connection> {
	try {
		const uri: string = buildMongoDBURI(databaseCredential);

		const connection = await mongoose.createConnection(uri).asPromise();

		return connection;
	} catch (error) {
		throw new InternalServerError('Error to connect database using Mongoose.', {
			cause: error
		});
	}
}

async function connectToDatabaseWithSequelize(
	databaseCredential: IDatabaseCredential,
	rejectUnauthorizedSSL: boolean
): Promise<Sequelize> {
	try {
		const uri: string = buildSequelizeURI(databaseCredential);

		let sequelize;

		if (databaseCredential.sslEnabled == true) {
			sequelize = new Sequelize(uri, {
				dialect: databaseCredential.type as Dialect,
				pool: {
					max: 3, // Número máximo de conexões que a pool pode ter
					min: 0, // Número mínimo de conexões que a pool mantém abertas (mesmo ociosas)
					acquire: 30000, // Tempo máximo em milisegundos que a pool tentará adquirir uma conexão antes de lançar um erro
					idle: 10000 // Tempo máximo em milisegundos que uma conexão pode ficar ociosa antes de ser liberada
				},
				logging: false,
				dialectOptions: {
					ssl: {
						require: false,
						rejectUnauthorized: rejectUnauthorizedSSL, // Rejeita certificados não confiáveis (true se for banco em produção)
						ca: databaseCredential.sslCertificateAuthority,
						key: databaseCredential.sslPrivateKey,
						cert: databaseCredential.sslCertificate
					}
				}
			});
		} else {
			sequelize = new Sequelize(uri, {
				dialect: databaseCredential.type as Dialect,
				pool: {
					max: 3, // Número máximo de conexões que a pool pode ter
					min: 0, // Número mínimo de conexões que a pool mantém abertas (mesmo ociosas)
					acquire: 30000, // Tempo máximo em milisegundos que a pool tentará adquirir uma conexão antes de lançar um erro
					idle: 10000 // Tempo máximo em milisegundos que uma conexão pode ficar ociosa antes de ser liberada
				},
				logging: false
			});
		}

		await sequelize.authenticate();
		return sequelize;
	} catch (error: any) {
		//TODO verificar o tipo de erro para aí criar um erro que tenha algo que define que o banco não existe

		const sqlState = error.parent.code;

		if (sqlState === '3D000') {
			throw new ServiceUnavailableError(
				"Error to connect database using sequelize. Database don't exist."
			);
		} else {
			throw new InternalServerError(
				'Error to connect database using Sequelize.',
				{ cause: error }
			);
		}
	}
}

async function connectToDatabaseWithFirebird(
	databaseCredential: IDatabaseCredential
): Promise<any> {
	// TODO: Implement Firebird connection
	throw new InternalServerError('Method not implemented');
}

/**
 * Realiza a contrução da string de conexão com o banco de dados mongodb
 * @param databaseCredential Dados para realizar a conexão com o banco de dados
 * @returns Retorna a string de conexão com o banco de dados mongodb
 * O formato de uma URI é por padrão: <tipo_de_banco_de_dados_usado>://<usuário>:<senha>@<host>:<porta>/<nome_do_banco>?<opções>
 */
export function buildMongoDBURI(
	databaseCredential: IDatabaseCredential
): string {
	let port: string;
	if (
		databaseCredential.name === 'mongodb' &&
		databaseCredential.port != null &&
		databaseCredential.port != undefined
	) {
		port = databaseCredential.port;
	} else {
		//Se for com uso de SRV, fica sem a porta
		port = '';
	}

	let protocol: string;
	if (databaseCredential.srvEnabled == true) {
		protocol = 'mongodb+srv';
	} else {
		protocol = 'mongodb';
	}

	//se não tiver user e senha tir
	if (databaseCredential.username == '' && databaseCredential.password == '') {
		return (
			protocol +
			'://' +
			databaseCredential.host +
			'/' +
			databaseCredential.name +
			'?' +
			databaseCredential.options
		);
	}

	return (
		protocol +
		'://' +
		databaseCredential.username +
		':' +
		databaseCredential.password +
		'@' +
		databaseCredential.host +
		'/' +
		databaseCredential.name +
		'?' +
		databaseCredential.options
	);
}

/**
 * @param databaseCredential Dados para realizar a conexão com o banco de dados
 * @returns Retorna a string de conexão com o banco de dados suportados pelo Sequelize
 */
export function buildSequelizeURI(
	databaseCredential: IDatabaseCredential
): string {
	return (
		databaseCredential.type +
		'://' +
		databaseCredential.username +
		':' +
		databaseCredential.password +
		'@' +
		databaseCredential.host +
		':' +
		databaseCredential.port +
		'/' +
		databaseCredential.name
	);
}