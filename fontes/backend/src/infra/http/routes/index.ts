import { Application } from 'express';
import userRoutes from './user.route';
import tenantRoutes from './tenant.route';
import roleRoutes from './role.route';
import databaseCredentialRoutes from './databaseCredential.route';
import tenantDirectoryRoutes from './tenantDirectory.route'
import applicationRoutes from './application.route';
import fileRoutes from './file.route';
import fieldFileRoutes from './fieldFile.route';
import authenticationRoutes from './authentication.route';
import dashboardRoutes from './dashboard.route'; 
import consultaRoutes from "./consulta.route"; 
import menuRoutes from "./menu.route";  
import filterSearchParameter from "./filterSearchParameter.route";  
import pacienteRoutes from "./paciente.route"; 
import avaliacaoRoutes from "./avaliacao.route"; 
import agendaRoutes from "./agenda.route"; 
/** 
 * Define as rotas da aplicação 
 * @param app Instância do aplicação Express 
 */ 
export function setRoutes(app: Application) { 

  roleRoutes(app); 
  userRoutes(app); 
  databaseCredentialRoutes(app); 
  tenantRoutes(app); 
  tenantDirectoryRoutes(app);
  applicationRoutes(app); 
  consultaRoutes(app); 
  fileRoutes(app); 
  fieldFileRoutes(app); 
  authenticationRoutes(app); 
  dashboardRoutes(app); 
  menuRoutes(app); 
  filterSearchParameter(app); 

  pacienteRoutes(app); 

  avaliacaoRoutes(app); 

  agendaRoutes(app); 

}
