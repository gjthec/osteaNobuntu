import { DataTypes, Sequelize } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'menu_items',
		{
			name: {
				type: DataTypes.STRING,
				field: 'name'
			},
			routeUrl: {
				type: DataTypes.STRING,
				field: 'routeUrl'
			},
			icon: {
				type: DataTypes.STRING,
				field: 'icon'
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