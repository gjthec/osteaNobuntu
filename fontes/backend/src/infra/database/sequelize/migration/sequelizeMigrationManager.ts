import { Dialect, Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
const path = require('node:path');
import { IMigrationManager } from '../../IMigrationManager';
import { IDatabaseCredential } from '../../../../domain/entities/databaseCredential.model';
import { buildSequelizeURI } from '../../databaseConnection.config';

export class SequelizeMigrationManager implements IMigrationManager {
	private sequelize: Sequelize;
	private umzug: Umzug<Sequelize>;

	constructor(databaseCredential: IDatabaseCredential) {
		const uri: string = buildSequelizeURI(databaseCredential);

		if (databaseCredential.sslEnabled == true) {
			this.sequelize = new Sequelize(uri, {
				dialect: databaseCredential.type as Dialect,
				logging: false,
				dialectOptions: {
					ssl: {
						require: false,
						rejectUnauthorized: true, // Rejeita certificados não confiáveis (true se for banco em produção)
						ca: databaseCredential.sslCertificateAuthority,
						key: databaseCredential.sslPrivateKey,
						cert: databaseCredential.sslCertificate
					}
				}
			});
		} else {
			this.sequelize = new Sequelize(uri, {
				dialect: databaseCredential.type as Dialect,
				logging: false
			});
		}

		//Por convenção, os arquivos de migração geralmente têm um prefixo numérico ou de data/hora (ex: 20240714-add-users.js), então o Umzug executa as migrações na ordem alfabética dos nomes dos arquivos.
		this.umzug = new Umzug({
			migrations: {
				glob: path.join(__dirname, './migrations/*.js'),
				resolve: ({ name, path: migrationPath }) => {
					const migration = require(migrationPath || '');

					return {
						name,
						up: async () =>
							migration.up(this.sequelize.getQueryInterface(), Sequelize),
						down: async () =>
							migration.down(this.sequelize.getQueryInterface(), Sequelize)
					};
				}
			},
			context: this.sequelize,
			storage: new SequelizeStorage({
				sequelize: this.sequelize,
				tableName: 'SequelizeMeta'
			}),
			logger: console
		});
	}

	async connectAndMigrate(): Promise<void> {
		try {
			console.log('🔄 Connecting to the database...');
			await this.sequelize.authenticate();
			console.log('✅ Database connection established successfully!');

			console.log('🔍 Checking for pending migrations...');
			const pendingMigrations = await this.umzug.pending();

			console.log('pendingMigrations: ', pendingMigrations);

			if (pendingMigrations.length === 0) {
				console.log('✅ Database is already up to date!');
				return;
			}

			console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
			pendingMigrations.forEach((migration) => {
				console.log(`  - ${migration.name}`);
			});

			console.log('🚀 Running migrations...');
			await this.umzug.up();
			console.log('✅ All migrations have been executed successfully!');
		} catch (error) {
			console.error('❌ Error during connection/migration:', error);
			throw error;
		}
	}

	async getMigrationStatus(): Promise<void> {
		const executed = await this.umzug.executed();
		const pending = await this.umzug.pending();

		console.log('\n📊 Migration status:');
		console.log('✅ Executed:');
		executed.forEach((migration) => console.log(`  - ${migration.name}`));

		console.log('⏳ Pending:');
		pending.forEach((migration) => console.log(`  - ${migration.name}`));
	}

	async close(): Promise<void> {
		await this.sequelize.close();
		console.log('🔌 Database connection closed');
	}
}
