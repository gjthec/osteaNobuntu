import { TenantConnection } from "../entities/tenantConnection.model"; 
import { Sequelize } from "sequelize";

export default class ConsultaRepository { 
  tenantConnection: TenantConnection; 

  constructor(tenantConnection: TenantConnection) { 
    this.tenantConnection = tenantConnection; 
  } 
}
