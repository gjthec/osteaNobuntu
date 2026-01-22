import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';
import { IRequestLog, IRequestLogDataBaseModel, RequestLog } from '../entities/requestLog.model';

export default class RequestLogRepository extends BaseRepository<
  IRequestLogDataBaseModel,
  RequestLog
> {
  constructor(tenantConnection: TenantConnection) {
    const _adapter: IDatabaseAdapter<IRequestLog, RequestLog> =
      createDbAdapter<IRequestLog, RequestLog>(
        tenantConnection.models!.get('RequestLog'),
        tenantConnection.databaseType,
        tenantConnection.connection,
        RequestLog.fromJson
      );
    super(_adapter, tenantConnection);
  }
}