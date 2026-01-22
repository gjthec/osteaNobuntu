import { DatabaseInitializer } from '../../../domain/repositories/databaseInitializer';
import { InternalServerError } from '../../../errors/internal.error';
import { DatabaseType } from '../createDb.adapter';

export class MongooseDatabaseInitializer implements DatabaseInitializer {
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
		throw new InternalServerError('Method not implemented');
	}
}