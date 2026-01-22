import { createDbAdapter } from "../../infra/database/createDb.adapter";
import { IDatabaseAdapter } from "../../infra/database/IDatabase.adapter";
import { TenantConnection } from "../entities/tenantConnection.model"; 
import BaseRepository from "./base.repository";
import { IAvaliacao, Avaliacao } from "../entities/avaliacao.model"; 

export default class AvaliacaoRepository extends BaseRepository<IAvaliacao, Avaliacao>{ 

  constructor(tenantConnection: TenantConnection){ 
    const _adapter : IDatabaseAdapter<IAvaliacao, Avaliacao> = createDbAdapter<IAvaliacao, Avaliacao>(tenantConnection.models!.get("Avaliacao"), tenantConnection.databaseType, tenantConnection.connection, Avaliacao.fromJson);
    super(_adapter, tenantConnection); 
  } 

}
