import { DataTypes, Sequelize } from 'sequelize';

export default function defineModel(sequelize: Sequelize) {
  const schema = sequelize.define(
    'request_logs',
    {
      ip: {
        type: DataTypes.STRING,
        allowNull: false
      },
      route: {
        type: DataTypes.STRING,
        allowNull: false
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false
      },
      statusCode: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      responseTime: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      requestBody: {
				type: DataTypes.JSONB,
				allowNull: true
			},
      responseBody: {
				type: DataTypes.JSONB,
				allowNull: true
			},
      userId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'users',
					key: 'id'
				},
        allowNull: true
			},
      userIdentityProviderUID: {
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
