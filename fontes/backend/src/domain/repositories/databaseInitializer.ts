import { DatabaseType } from '../../infra/database/createDb.adapter';

export interface DatabaseInitializer {
	initializeDatabase(): Promise<void>;
	createDatabaseIfNotExists(
		databaseName: string,
		databaseUser: string,
		databasePassword: string,
		databaseHost: string,
		databasePort: number,
		databaseType: DatabaseType
	): Promise<void>;
}