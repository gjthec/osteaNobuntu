import { DataTypes, Sequelize } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'database_credential_roles',
		{
			roleId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'roles',
					key: 'id'
				},
				allowNull: false
			},
			databaseCretendialId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'database_credentials',
					key: 'id'
				},
				allowNull: false
			},
			isAdmin: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			},
			accessLevel: {
				type: DataTypes.STRING(100),
				allowNull: true
			}
		},
		{
			timestamps: true,
			indexes: [
				{
					unique: true,
					fields: ['roleId', 'databaseCretendialId']
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
