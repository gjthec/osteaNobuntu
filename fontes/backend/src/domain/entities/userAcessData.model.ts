import { IUser } from './user.model';

export interface IUserAccessData {
	accessToken?: string;
	refreshToken?: string;
	tokenType?: string;
	expiresIn?: number; //Quanto tempo tem de tempo o token de acesso até expirar
	expiresOn?: number; //Quando irá expirar exatamente o token de acesso
	refreshTokenExpiresIn?: number;
	user?: IUser;
}