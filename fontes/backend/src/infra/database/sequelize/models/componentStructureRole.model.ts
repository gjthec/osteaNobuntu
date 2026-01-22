import { DataTypes, Sequelize } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'component_structure_roles',
		{
			roleId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'roles',
					key: 'id'
				}
			},
			componentStructureId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'component_structures',
					key: 'id'
				}
			}
		},
		{
			timestamps: true,
			indexes: [
				{
					unique: true,
					fields: ['roleId', 'componentStructureId']
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