import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { IMigrationManager } from '../../IMigrationManager';

interface MigrationDocument extends mongoose.Document {
	name: string;
	executedAt: Date;
}

const migrationSchema = new mongoose.Schema<MigrationDocument>({
	name: { type: String, required: true, unique: true },
	executedAt: { type: Date, required: true }
});

const MigrationModel = mongoose.model<MigrationDocument>(
	'Migration',
	migrationSchema
);

//TODO esse código não foi testado e nem será, baixa prioridade para mongodb
export class MongooseMigrationManager implements IMigrationManager {
	private uri: string;

	constructor() {
		this.uri = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';
	}

	async connectAndMigrate(): Promise<void> {
		try {
			console.log('🔄 Connecting to MongoDB...');
			await mongoose.connect(this.uri);
			console.log('✅ MongoDB connection established successfully!');

			console.log('🔍 Checking for pending migrations...');
			const appliedMigrations = await MigrationModel.find().lean();
			const appliedNames = appliedMigrations.map((m) => m.name);

			const migrationsDir = path.join(__dirname, './migrations');
			const migrationFiles = fs
				.readdirSync(migrationsDir)
				.filter((f) => f.endsWith('.js'));

			const pendingMigrations = migrationFiles.filter(
				(name) => !appliedNames.includes(name)
			);

			if (pendingMigrations.length === 0) {
				console.log('✅ Database is already up to date!');
				return;
			}

			console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
			pendingMigrations.forEach((name) => console.log(`  - ${name}`));

			for (const file of pendingMigrations) {
				console.log(`🚀 Running migration: ${file}`);
				const migration = require(path.join(migrationsDir, file));
				if (typeof migration.up === 'function') {
					await migration.up(mongoose);
					await MigrationModel.create({ name: file, executedAt: new Date() });
					console.log(`✅ Migration ${file} executed successfully!`);
				} else {
					console.warn(
						`⚠️ Migration ${file} does not export an 'up' function.`
					);
				}
			}
		} catch (error) {
			console.error('❌ Error during connection/migration:', error);
			throw error;
		}
	}

	async getMigrationStatus(): Promise<void> {
		const appliedMigrations = await MigrationModel.find().lean();
		const appliedNames = appliedMigrations.map((m) => m.name);

		const migrationsDir = path.join(__dirname, '../migrations-mongo');
		const migrationFiles = fs.existsSync(migrationsDir)
			? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.js'))
			: [];

		const pendingMigrations = migrationFiles.filter(
			(name) => !appliedNames.includes(name)
		);

		console.log('\n📊 Migration status:');
		console.log('✅ Executed:');
		appliedNames.forEach((name) => console.log(`  - ${name}`));
		console.log('⏳ Pending:');
		pendingMigrations.forEach((name) => console.log(`  - ${name}`));
	}

	async close(): Promise<void> {
		await mongoose.disconnect();
		console.log('🔌 MongoDB connection closed');
	}
}
