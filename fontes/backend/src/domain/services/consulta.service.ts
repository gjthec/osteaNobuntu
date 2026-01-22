import ConsultaRepository from "../repositories/consulta.repository";
import { TenantConnection } from "../entities/tenantConnection.model"; 

export class ConsultaService{ 
  consultaRepository: ConsultaRepository; 
  tenantConnection: TenantConnection;  

  constructor(tenantConnection: TenantConnection) {   
    var repository : ConsultaRepository = new ConsultaRepository(tenantConnection);   
    this.tenantConnection = tenantConnection;  
    this.consultaRepository = repository;  
  } 
}
