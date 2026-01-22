import { DataTypes, Sequelize } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
	const schema = sequelize.define(
		'users',
		{
			identityProviderUID: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			},
			provider: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: false
			},
			tenantUID: {
				type: DataTypes.STRING,
				allowNull: false
			},
			userName: {
				type: DataTypes.STRING,
				allowNull: false
			},
			firstName: {
				type: DataTypes.STRING,
				allowNull: false
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false
			},
			isAdministrator: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			},
			memberType: {
				type: DataTypes.STRING
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false
			},
			password: {
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