import { Dialect, Sequelize } from 'sequelize';
import { DatabaseInitializer } from '../../../domain/repositories/databaseInitializer';
import { DatabaseType } from '../createDb.adapter';
import { InternalServerError } from '../../../errors/internal.error';

export class SequelizeDatabaseInitializer implements DatabaseInitializer {
	initializeDatabase(): Promise<void> {
		throw new InternalServerError('Method not implemented.');
	}

	async createDatabaseIfNotExists(
		databaseName: string,
		databaseUser: string,
		databasePassword: string,
		databaseHost: string,
		databasePort: number,
		databaseType: DatabaseType
	): Promise<void> {
		if (databaseType == 'mongodb') {
			throw new Error('Invalid database type to create database if not exist.');
		}

		let sequelize: Sequelize | null = null;

		try {
			sequelize = new Sequelize('', databaseUser, databasePassword, {
				host: databaseHost,
				port: databasePort,
				dialect: databaseType as Dialect, // Alterar para outro dialeto, como 'postgres', se necessário
				logging: false // Desabilitar logs
			});
		} catch (error) {
			throw new Error(
				'Error to connect on database to create schema. Details: ' + error
			);
		}

		// Executar consulta para verificar se o banco de dados existe
		const [results] = await sequelize.query(
			`SELECT SCHEMA_NAME 
      FROM INFORMATION_SCHEMA.SCHEMATA 
      WHERE SCHEMA_NAME = '${databaseName}'`
		);

		if (Array.isArray(results) && results.length === 0) {
			// Se não existir, criar o banco de dados
			try {
				await sequelize.query(`CREATE DATABASE ${databaseName}`);
				console.log(`Database "${databaseName}" created.`);
				await sequelize.close();
			} catch (error) {
				throw new Error('Error to create new database. Details: ' + error);
			}
		} else {
			console.log(`Database "${databaseName}" exist.`);
		}
	}
}