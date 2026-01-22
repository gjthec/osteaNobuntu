import { Sequelize, DataTypes } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'function_system_roles',
		{
			roleId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'roles',
					key: 'id'
				}
			},
			functionSystemId: {
				type: DataTypes.STRING,
				references: {
					model: 'function_systems',
					key: 'id'
				}
			},
			authorized: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			},
			accessLevel: {
				type: DataTypes.STRING,
				allowNull: true
			}
		},
		{
			timestamps: true,
			indexes: [
				{
					unique: true,
					fields: ['roleId', 'functionSystemId']
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