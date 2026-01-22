import { createDbAdapter } from "../../infra/database/createDb.adapter";
import { IDatabaseAdapter } from "../../infra/database/IDatabase.adapter";
import { TenantConnection } from "../entities/tenantConnection.model"; 
import BaseRepository from "./base.repository";
import { IPaciente, Paciente } from "../entities/paciente.model"; 

export default class PacienteRepository extends BaseRepository<IPaciente, Paciente>{ 

  constructor(tenantConnection: TenantConnection){ 
    const _adapter : IDatabaseAdapter<IPaciente, Paciente> = createDbAdapter<IPaciente, Paciente>(tenantConnection.models!.get("Paciente"), tenantConnection.databaseType, tenantConnection.connection, Paciente.fromJson);
    super(_adapter, tenantConnection); 
  } 

}
