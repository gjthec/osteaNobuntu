import { Sequelize, DataTypes } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'filter_search_parameter_roles',
		{
			filterSearchParameterId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'filter_search_parameters',
					key: 'id'
				}
			},
			roleId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'roles',
					key: 'id'
				}
			},
			//exemplo: "read", "edit", "owner" or "admin"
			accessLevel: {
				type: DataTypes.STRING,
				allowNull: true
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
