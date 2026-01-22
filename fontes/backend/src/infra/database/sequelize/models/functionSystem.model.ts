import { Sequelize, DataTypes } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'function_systems',
		{
			description: {
				type: DataTypes.STRING,
				allowNull: true
			},
			route: {
				type: DataTypes.STRING,
				allowNull: false
			},
			method: {
				type: DataTypes.STRING,
				allowNull: false
			},
			className: {
				type: DataTypes.STRING,
				allowNull: false
			},
			isPublic: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			}
		},
		{
			timestamps: true,
			indexes: [
				{
					unique: true,
					fields: ['route', 'method']
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