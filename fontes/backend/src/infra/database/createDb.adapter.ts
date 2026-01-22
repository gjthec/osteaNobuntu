import { Connection } from 'mongoose';
import { IDatabaseAdapter } from './IDatabase.adapter';
import { SequelizeAdapter } from './sequelize/sequelize.adapter';
import { MongooseAdapter } from './mongoose/mongoose.adapter';
import { Sequelize } from 'sequelize';

export type DatabaseType =
	| 'mongodb'
	| 'postgres'
	| 'mysql'
	| 'sqlite'
	| 'mariadb'
	| 'mssql'
	| 'db2'
	| 'snowflake'
	| 'oracle'
	| 'firebird';

/**
 * Função que irá obter as funcionalidades de operação com banco de dados da biblioteca de acordo com o que é emitido
 * @param databaseType Tipo de banco de dados
 * @param model Modelo da entidade
 * @param jsonDataToResourceFn Função para criar uma classe com base no JSON retornado das funções
 * @returns
 */
export function createDbAdapter<TInterface, TClass>(
	model: any,
	databaseType: DatabaseType,
	databaseConnection: Connection | Sequelize,
	jsonDataToResourceFn: (jsonData: any) => TClass
): IDatabaseAdapter<TInterface, TClass> {
	if (databaseType === 'mongodb' && databaseConnection instanceof Connection) {
		return new MongooseAdapter<TInterface, TClass>(
			model,
			databaseType,
			databaseConnection,
			jsonDataToResourceFn
		);
	} else if (databaseType === 'firebird') {
		throw new Error('Method not implemented');
	} else if (databaseConnection instanceof Sequelize) {
		return new SequelizeAdapter<TInterface, TClass>(
			model,
			databaseType,
			databaseConnection,
			jsonDataToResourceFn
		);
	} else {
		throw new Error(
			'Error do create Database Adapter. Detail: Conditions not satisfied'
		);
	}
}