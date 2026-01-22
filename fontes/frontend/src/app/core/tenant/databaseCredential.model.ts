import { BaseResourceModel } from "app/shared/models/base-resource.model";


export type DatabaseType = "mongodb" | "postgres" | "mysql" | "sqlite" | "mariadb" | "mssql" | "db2" | "snowflake" | "oracle" | "firebird";

export interface IDatabaseCredential {
  // databaseName?: string;
  // databaseType?: string;
  // databaseUsername?: string;
  // databasePassword?: string;
  // databaseHost?: string;
  // databasePort?: string;
  // databaseConfig?: string;
  name?: string;
  type: DatabaseType;
  username?: string;
  password?: string;
  host: string;
  port: string;
  srvEnabled: boolean;
  options?: string;
  storagePath?: string;
  sslEnabled: boolean;
  poolSize?: number;
  timeOutTime?: number;
  version: number;

  //SSL data
  sslCertificateAuthority?: string;
  sslPrivateKey?: string;
  sslCertificate?: string;
}

export class DatabaseCredential extends BaseResourceModel implements IDatabaseCredential {
  // databaseName?: string;
  // databaseType?: string;
  // databaseUsername?: string;
  // databasePassword?: string;
  // databaseHost?: string;
  // databasePort?: string;
  // databaseConfig?: string;
  name?: string;
  type: DatabaseType;
  username?: string;
  password?: string;
  host: string;
  port: string;
  srvEnabled: boolean;
  options?: string;
  storagePath?: string;
  sslEnabled: boolean;
  poolSize?: number;
  timeOutTime?: number;
  version: number;

  //SSL data
  sslCertificateAuthority?: string;
  sslPrivateKey?: string;
  sslCertificate?: string;

  static fromJson(jsonData: any) : DatabaseCredential {
    return Object.assign(new DatabaseCredential(), jsonData);
  }
}