import { Connection, model } from 'mongoose';
import userModel from './user.model';
import roleModel from './role.model';
import functionSystemModel from './functionSystem.model';
import functionSystemRoleModel from './functionSystemRole.model';
import userRoleModel from './userRole.model';
import tenantModel from './tenant.model';
import databaseCredentialModel from './databaseCredential.model';
import databaseCredentialUserModel from './databaseCredentialUser.model';
import databaseCredentialRoleModel from './databaseCredentialRole.model';
import verificationEmailModel from './verificationEmail.model';
import counterModel from './counter.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import { InternalServerError } from '../../../../errors/internal.error';
import RequestLogModel from './requestLog.model';

export default async function setModels(tenantConnection: TenantConnection) {
	const mongooseConnection = tenantConnection.connection;

	if (mongooseConnection instanceof Connection == false) {
		throw new InternalServerError(
			'Instance of database connection is incompatible with setModels function on mongoose.'
		);
	}

	const user = userModel(mongooseConnection); //Tabela com os usuários que usam os tenants
	const role = roleModel(mongooseConnection);
	const userRole = userRoleModel(mongooseConnection);
	const functionSystem = functionSystemModel(mongooseConnection);
	const functionSystemRole = functionSystemRoleModel(mongooseConnection);
	const tenant = tenantModel(mongooseConnection); //Tabela com tenants
	const databaseCredential = databaseCredentialModel(mongooseConnection);
	const databaseCredentialUser =
		databaseCredentialUserModel(mongooseConnection); //Tabela intermediária que informa o acesso de cada usuário para cada tenant usando uma credencial
	const databaseCredentialRole =
		databaseCredentialRoleModel(mongooseConnection);
	const verificationEmail = verificationEmailModel(mongooseConnection);
  const requestLog = RequestLogModel(mongooseConnection);
	const counter = counterModel(mongooseConnection);

	const models = new Map<string, any>();

	models.set('User', user);
	models.set('Role', role);
	//Models de controle de acesso as rotas
	models.set('UserRole', userRole);
	models.set('FunctionSystem', functionSystem);
	models.set('FunctionSystemRole', functionSystemRole);
	//Models de controle de acesso a banco de dados
	models.set('Tenant', tenant);
	models.set('DatabaseCredentialUser', databaseCredentialUser);
	models.set('DatabaseCredentialRole', databaseCredentialRole);
	models.set('DatabaseCredential', databaseCredential);

	models.set('VerificationEmail', verificationEmail);
  models.set('RequestLog', requestLog);
	models.set('Counter', counter);

	return models;
}
