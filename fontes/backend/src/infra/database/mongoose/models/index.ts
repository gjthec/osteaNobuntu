import { Connection, Mongoose } from "mongoose";  
import userModel from "./user.model";
import roleModel from "./role.model";
import functionSystemModel from "./functionSystem.model";
import functionSystemRoleModel from "./functionSystemRole.model";
import userRoleModel from "./userRole.model";
import componentStructureModel from "./componentStructure.model";
import componentStructureRoleModel from "./componentStructureRole.model";
import verificationEmailModel from "./verificationEmail.model";
import { TenantConnection } from "../../../../domain/entities/tenantConnection.model"; 
import counterModel from "./counter.model";

import pacienteModel from "./paciente.model"; 
import avaliacaoModel from "./avaliacao.model"; 
import agendaModel from "./agenda.model"; 

export default async function setModels(tenantConnection: TenantConnection) { 
  const mongooseConnection = tenantConnection.connection; 
  if(mongooseConnection instanceof Connection == false){ 
    throw new Error("Instance of database connection is incompatible with setModels function on mongoose."); 
  } 

  const user = userModel(mongooseConnection); 
  const role = roleModel(mongooseConnection); 
  const userRole = userRoleModel(mongooseConnection); 
  const functionSystem = functionSystemModel(mongooseConnection); 
  const functionSystemRole = functionSystemRoleModel(mongooseConnection); 
  const componentStructure = componentStructureModel(mongooseConnection); 
  const componentStructureRole = componentStructureRoleModel(mongooseConnection); 
  const verificationEmail = verificationEmailModel(mongooseConnection); 
  const counter = counterModel(mongooseConnection); 


  const paciente = pacienteModel(mongooseConnection); 

  const avaliacao = avaliacaoModel(mongooseConnection); 

  const agenda = agendaModel(mongooseConnection); 

  const models = new Map<string, any>(); 

  models.set('User', user); 
  models.set('Role', role); 
  //Models de controle de acesso as rotas 
  models.set('UserRole', userRole); 
  models.set('FunctionSystem', functionSystem); 
  models.set('FunctionSystemRole', functionSystemRole); 
  //Models de controle de acesso a ambiente 
  models.set('ComponentStructure', componentStructure); 
  models.set('ComponentStructureRole', componentStructureRole); 
  models.set('VerificationEmail', verificationEmail); 
  models.set('Counter', counter); 
  models.set('Paciente', paciente); 
  models.set('Avaliacao', avaliacao); 
  models.set('Agenda', agenda); 

  return models; 
} 
