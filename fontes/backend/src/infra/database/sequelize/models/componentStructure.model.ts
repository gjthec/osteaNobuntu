import { DataTypes, Sequelize } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'component_structures',
		{
			structure: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			componentName: {
				type: DataTypes.STRING(254),
				allowNull: false
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