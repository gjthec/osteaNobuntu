export interface IMigrationManager {
	connectAndMigrate(): Promise<void>;
	getMigrationStatus(): Promise<void>;
	close(): Promise<void>;
}
