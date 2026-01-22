import { DataTypes, Sequelize } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'database_credentials',
		{
			name: {
				type: DataTypes.STRING(100),
				allowNull: false
			},
			type: {
				type: DataTypes.STRING(100),
				allowNull: false
			},
			username: {
				type: DataTypes.STRING(100),
				allowNull: true
			},
			password: {
				type: DataTypes.STRING(100),
				allowNull: true
			},
			host: {
				type: DataTypes.STRING(100),
				allowNull: false
			},
			port: {
				type: DataTypes.STRING(100),
				allowNull: true
			},
			srvEnabled: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			},
			options: {
				type: DataTypes.STRING(100),
				allowNull: true
			},
			storagePath: {
				type: DataTypes.STRING(100),
				allowNull: true
			},
			sslEnabled: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			},
			poolSize: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			timeOutTime: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			version: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			isPublic: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			},
			tenantId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'tenants',
					key: 'id'
				},
				allowNull: false
			},
			//SSL data
			sslCertificateAuthority: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			sslPrivateKey: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			sslCertificate: {
				type: DataTypes.TEXT,
				allowNull: true
			}
		},
		{
			timestamps: true,
			indexes: [
				{
					unique: true,
					fields: ['name', 'type', 'username', 'host', 'port'],
					name: 'unique_database_credential'
				}
			],
			freezeTableName: true
		}
	);

	schema.prototype.toJSON = function () {
		const values = Object.assign({}, this.get());

		values.id = values.id;
		delete values._id;
		delete values.__v;
		return values;
	};

	return schema;
}