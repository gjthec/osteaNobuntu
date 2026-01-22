import { DataTypes, Sequelize } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'user_roles',
		{
			//Columns
			userId: {
				type: DataTypes.STRING,
				references: {
					model: 'users',
					key: 'id'
				}
			},
			roleId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'roles',
					key: 'id'
				}
			}
		},
		{
			timestamps: true,
			indexes: [
				{
					unique: true,
					fields: ['userId', 'roleId']
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