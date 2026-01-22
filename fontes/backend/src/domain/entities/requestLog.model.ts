import { BaseResourceModel } from './baseResource.model';
import { User } from './user.model';

export interface IRequestLogDataBaseModel extends BaseResourceModel {
	ip: string;
	route: string;
	method: string;
	statusCode: number;
	responseTime: number;
	requestBody?: Object;
	responseBody?: Object;
	userId?: number;
  userIdentityProviderUID?: string;
}

export interface IRequestLog extends BaseResourceModel {
  ip: string;
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestBody?: Object;
  responseBody?: Object;
  user?: User;
  userIdentityProviderUID?: string;
}

export class RequestLog extends BaseResourceModel {
  ip: string;
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestBody?: Object;
  responseBody?: Object;
  user?: User;
  userIdentityProviderUID?: string;

	constructor(data: IRequestLog) {
		super();
		this.id = data.id;
    this.ip = data.ip;
		this.route = data.route;
    this.method = data.method;
    this.statusCode = data.statusCode;
    this.responseTime = data.responseTime;
    this.requestBody = data.requestBody;
    this.responseBody = data.responseBody;
    this.user = data?.user;
    this.userIdentityProviderUID = data?.userIdentityProviderUID;
	}

	static fromJson(jsonData: IRequestLog): RequestLog {
		return new RequestLog(jsonData);
	}
}
