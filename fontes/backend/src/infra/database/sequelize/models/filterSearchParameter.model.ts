import { Sequelize, DataTypes } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'filter_search_parameters',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			className: {
				type: DataTypes.STRING,
				allowNull: false
			},
			parameters: {
				type: DataTypes.JSONB,
				allowNull: false
			},
			isPublic: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
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
