import { DatabaseType } from '../../infra/database/createDb.adapter';
import { BaseResourceModel } from './baseResource.model';
import { Tenant } from './tenant.model';

export interface IDatabaseCredentialDatabaseModel extends BaseResourceModel {
	name?: string;
	type?: DatabaseType;
	username?: string;
	password?: string;
	host?: string;
	port?: string;
	srvEnabled?: boolean; // Indica se usa protocolo SRV (mongodb)
	options?: string;
	storagePath?: string;
	sslEnabled?: boolean;
	poolSize?: number;
	timeOutTime?: number;
	version?: number;
	isPublic?: boolean;
	tenantId?: number;
	//SSL data
	sslCertificateAuthority?: string; //Serve para verificar que o certificado apresentado pelo servidor ou cliente é confiável e foi emitido por uma CA válida.
	sslPrivateKey?: string; //Usada para descriptografar mensagens recebidas e assinar mensagens enviadas. Deve ser mantido em segredo.
	sslCertificate?: string; //Informações públicas, como o domínio, entidade responsável e a CertificateAuthority que o emitiu.
}

export interface IDatabaseCredential extends BaseResourceModel {
	name?: string;
	type?: DatabaseType;
	username?: string;
	password?: string;
	host: string;
	port: string;
	srvEnabled?: boolean; // Indica se usa protocolo SRV (mongodb)
	options?: string;
	storagePath?: string;
	sslEnabled?: boolean;
	poolSize?: number;
	timeOutTime?: number;
	version?: number;
	isPublic: boolean;
	tenant: Tenant;
	//SSL data
	sslCertificateAuthority?: string; //Serve para verificar que o certificado apresentado pelo servidor ou cliente é confiável e foi emitido por uma CA válida.
	sslPrivateKey?: string; //Usada para descriptografar mensagens recebidas e assinar mensagens enviadas. Deve ser mantido em segredo.
	sslCertificate?: string; //Informações públicas, como o domínio, entidade responsável e a CertificateAuthority que o emitiu.
}

export class DatabaseCredential
	extends BaseResourceModel
	implements IDatabaseCredential
{
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
	isPublic: boolean;
	tenant: Tenant;
	//SSL data
	sslCertificateAuthority?: string;
	sslPrivateKey?: string;
	sslCertificate?: string;

	static fromJson(jsonData: IDatabaseCredential): DatabaseCredential {
		return new DatabaseCredential(jsonData);
	}

	constructor(data: IDatabaseCredential) {
		super();
		this.id = data?.id;
		this.name = data?.name || '';

		if (data.type == undefined || data.type == null) {
			throw new Error('type field are not populated.');
		}
		this.type = data.type;

		this.username = data?.username || '';
		this.password = data?.password || '';
		this.host = data.host;
		this.port = data.port;

		if (data.srvEnabled == undefined || data.srvEnabled == null) {
			throw new Error('srvEnabled field are not populated.');
		}
		this.srvEnabled = data.srvEnabled;
		this.options = data?.options || '';
		this.storagePath = data?.storagePath || '';
		this.sslEnabled = data.sslEnabled || false;
		this.poolSize = data.poolSize;
		this.timeOutTime = data.timeOutTime;

		if (data.version == undefined) {
			this.version = 0;
		} else {
			this.version = data.version;
		}

		this.isPublic = data.isPublic;
		this.tenant = data.tenant;

		// Verificação dos campos de SSL
		if (this.sslEnabled == true) {
			if (
				!this.sslCertificateAuthority ||
				!this.sslPrivateKey ||
				!this.sslCertificate
			) {
				throw new Error(
					"SSL is enabled, but the 'sslCertificateAuthorityPath', 'sslPrivateKeyPath' and 'sslCertificatePath' fields are not populated."
				);
			}
		}

		this.sslCertificateAuthority = data?.sslCertificateAuthority;
		this.sslPrivateKey = data?.sslPrivateKey;
		this.sslCertificate = data?.sslCertificate;
	}

	//TODO arrumar isso
	checkDatabaseCredential(data: IDatabaseCredential): boolean {
		return (
			data.name !== undefined &&
			data.type !== undefined &&
			data.host !== undefined &&
			data.type !== undefined &&
			data.name !== '' &&
			data.host !== ''
		);
	}
}