import { Sequelize, DataTypes } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'tenants',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			ownerUserId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'users',
					key: 'id'
				}
			}
		},
		{
			timestamps: true,
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