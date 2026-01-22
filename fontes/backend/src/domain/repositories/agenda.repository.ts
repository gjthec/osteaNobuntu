import { createDbAdapter } from "../../infra/database/createDb.adapter";
import { IDatabaseAdapter } from "../../infra/database/IDatabase.adapter";
import { TenantConnection } from "../entities/tenantConnection.model"; 
import BaseRepository from "./base.repository";
import { IAgenda, Agenda } from "../entities/agenda.model"; 

export default class AgendaRepository extends BaseRepository<IAgenda, Agenda>{ 

  constructor(tenantConnection: TenantConnection){ 
    const _adapter : IDatabaseAdapter<IAgenda, Agenda> = createDbAdapter<IAgenda, Agenda>(tenantConnection.models!.get("Agenda"), tenantConnection.databaseType, tenantConnection.connection, Agenda.fromJson);
    super(_adapter, tenantConnection); 
  } 

}
