import { Sequelize } from 'sequelize';

import userModel from './user.model';
import roleModel from './role.model';
import userRoleModel from './userRole.model';
import functionSystemModel from './functionSystem.model';
import functionSystemUserModel from './functionSystemUser.model';
import functionSystemRoleModel from './functionSystemRole.model';
import tenantModel from './tenant.model';
import databaseCredentialModel from './databaseCredential.model';
import databaseCredentialUserModel from './databaseCredentialUser.model';
import databaseCredentialRoleModel from './databaseCredentialRole.model';
import verificationEmailModel from './verificationEmail.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import { InternalServerError } from '../../../../errors/internal.error';
import requestLogModel from './requestLog.model';

/**
 * Define os modelos do banco de dados que serão usados pela parte de controle de acesso aos tenants
 * @param sequelizeConnection Instância da conexão com o banco de dados usando a biblioteca sequelize
 * @returns retorna os modelos do banco de dados para ser usado suas operações
 */
export default async function setModels(tenantConnection: TenantConnection) {
	const sequelizeConnection = tenantConnection.connection;

	if (sequelizeConnection instanceof Sequelize == false) {
		throw new InternalServerError(
			'Instance of database connection is incompatible with setModels function on sequelize.'
		);
	}

	const user = userModel(sequelizeConnection);
	const role = roleModel(sequelizeConnection);
	const userRole = userRoleModel(sequelizeConnection);
	const functionSystem = functionSystemModel(sequelizeConnection);
	const functionSystemUser = functionSystemUserModel(sequelizeConnection);
	const functionSystemRole = functionSystemRoleModel(sequelizeConnection);
	const tenant = tenantModel(sequelizeConnection);

	const databaseCredentialUser =
		databaseCredentialUserModel(sequelizeConnection);
	const databaseCredentialRole =
		databaseCredentialRoleModel(sequelizeConnection);
	const databaseCredential = databaseCredentialModel(sequelizeConnection);
	const verificationEmail = verificationEmailModel(sequelizeConnection);
  const requestLog = requestLogModel(sequelizeConnection); 

	tenant.hasOne(databaseCredential, { foreignKey: 'tenantId' });
	databaseCredential.belongsTo(tenant, {
		foreignKey: 'tenantId',
		as: 'tenant'
	});

	//Relação de muitos pra muitos entre Role e DatabaseCredential
	role.belongsToMany(databaseCredential, {
		through: databaseCredentialRole,
		foreignKey: 'roleId',
		otherKey: 'databaseCredentialId',
		as: 'databaseCredential'
	});
	databaseCredential.belongsToMany(role, {
		through: databaseCredentialRole,
		foreignKey: 'databaseCredentialId',
		otherKey: 'roleId',
		as: 'role'
	});

	//Relação de muitos pra muitos entre User e DatabaseCredential
	user.belongsToMany(databaseCredential, {
		through: databaseCredentialUser,
		foreignKey: 'userId',
		otherKey: 'databaseCredentialId',
		as: 'databaseCredential'
	});
	databaseCredential.belongsToMany(user, {
		through: databaseCredentialUser,
		foreignKey: 'databaseCredentialId',
		otherKey: 'userId',
		as: 'user'
	});

	user.belongsToMany(role, {
		through: userRole,
		foreignKey: 'userId',
		otherKey: 'roleId'
	});
	role.belongsToMany(user, {
		through: userRole,
		foreignKey: 'roleId',
		otherKey: 'userId'
	});

	//Relação de muitos pra muitos entre Role e FunctionsSystem
	role.belongsToMany(functionSystem, {
		through: functionSystemRole,
		foreignKey: 'roleId',
		otherKey: 'functionSystemId',
		as: 'functionSystem'
	});
	functionSystem.belongsToMany(role, {
		through: functionSystemRole,
		foreignKey: 'functionSystemId',
		otherKey: 'roleId',
		as: 'role'
	});
	//Relação de muitos pra muitos entre User e FunctionsSystem
	user.belongsToMany(functionSystem, {
		through: functionSystemUser,
		foreignKey: 'userId',
		otherKey: 'functionSystemId',
		as: 'functionSystem'
	});
	functionSystem.belongsToMany(user, {
		through: functionSystemUser,
		foreignKey: 'functionSystemId',
		otherKey: 'userId',
		as: 'user'
	});

	user.hasOne(tenant, { foreignKey: 'userId' });
	tenant.belongsTo(user, { foreignKey: 'userId', as: 'user' });
	//Cria as tabelas no banco de dados
	await sequelizeConnection
		.sync({ alter: false })
		.then(() => {
			// console.log("Security database created!");
		})
		.catch((error) => {
			throw new InternalServerError('Error to create Security database.', {
				cause: error
			});
		});

	user.hasOne(requestLog, {
		foreignKey: 'userId',
		as: 'ALIASuserALIASrequestLogALIAS'
	});
	requestLog.belongsTo(user, {
		foreignKey: 'userId',
		as: 'ALIASuserALIASrequestLogALIAS'
	});

	const models = new Map<string, any>();

	models.set('User', user);
	models.set('Role', role);
	//Models de controle de acesso as rotas
	models.set('UserRole', userRole);
	models.set('FunctionSystem', functionSystem);
	models.set('FunctionSystemUser', functionSystemUser);
	models.set('FunctionSystemRole', functionSystemRole);
	//Models de controle de acesso a banco de dados
	models.set('Tenant', tenant);
	models.set('DatabaseCredential', databaseCredential);
	models.set('DatabaseCredentialRole', databaseCredentialRole);
	models.set('DatabaseCredentialUser', databaseCredentialUser);

	models.set('VerificationEmail', verificationEmail);
  models.set('RequestLog', requestLog);
	return models;
}