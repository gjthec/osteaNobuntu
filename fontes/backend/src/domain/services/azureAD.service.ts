import axios from 'axios';
import { SignInOutputDTO } from '../../useCases/authentication/signIn.useCase';
import { GetUserProfilePhotoOutputDTO } from '../../useCases/user/getUserProfilePhoto.useCase';
import { IUser } from '../entities/user.model';
import { IidentityService } from './Iidentity.service';
import { NotFoundError, ValidationError } from '../../errors/client.error';
import { BadGatewayError, InternalServerError } from '../../errors/internal.error';

export interface IAzureAdUser {
	businessPhones: string[];
	displayName: string;
	givenName: string;
	jobTitle?: string;
	mail: string;
	mobilePhone?: string;
	officeLocation?: string;
	preferredLanguage?: string;
	surname: string;
	userPrincipalName: string;
	id: string;
}

export interface IAzureUserGroup {
	id: string;
	displayName: string;
}

export class AzureADService implements IidentityService {
	private graphAPIUrl = `https://graph.microsoft.com/`;

	//Dados necessários para realizar as requisições na Azure
	private clientId: string;
	private clientSecret: string;
	private tenantID: string;
	private tenantDomain: string;
	private scope: string;
	private domainName: string;
	private authenticationFlowDomainName: string;

	constructor() {
		const {
			CLIENT_ID,
			CLIENT_SECRET,
			TENANT_ID,
			TENANT_DOMAIN,
			SCOPE,
			DOMAIN_NAME,
			AUTHENTICATION_FLOW_DOMAIN_NAME
		} = process.env;

		const authEnvStatus = {
			CLIENT_ID: CLIENT_ID !== undefined,
			CLIENT_SECRET: CLIENT_SECRET !== undefined,
			TENANT_ID: TENANT_ID !== undefined,
			TENANT_DOMAIN: TENANT_DOMAIN !== undefined,
			SCOPE: SCOPE !== undefined,
			DOMAIN_NAME: DOMAIN_NAME !== undefined,
			AUTHENTICATION_FLOW_DOMAIN_NAME:
				AUTHENTICATION_FLOW_DOMAIN_NAME !== undefined
		};

		if (Object.values(authEnvStatus).some((value) => value === false)) {
			console.error('Azure auth environment variables status:', authEnvStatus);
			throw new InternalServerError('AUTH_CONFIG_MISSING', {
				cause:
					'Dados relacionados as requisições nos serviços da Azure não estão contidos nas variáveis ambiente'
			});
		}

		this.clientId = CLIENT_ID as string;
		this.clientSecret = CLIENT_SECRET as string;
		this.tenantID = TENANT_ID as string;
		this.tenantDomain = TENANT_DOMAIN as string;
		this.scope = SCOPE as string;
		this.domainName = DOMAIN_NAME as string;
		this.authenticationFlowDomainName =
			AUTHENTICATION_FLOW_DOMAIN_NAME as string;
	}

	/**
	 * obter o token de acesso da Microsoft Graph API
	 * @returns Retorna o token de acesso da Microsoft Graph API
	 */
	async getAccessToken(): Promise<string> {
		try {
			const getTokenUrl = `https://login.microsoftonline.com/${this.tenantID}/oauth2/v2.0/token`;

			const urlSearchParams = new URLSearchParams({
				client_id: this.clientId,
				client_secret: this.clientSecret,
				scope: 'https://graph.microsoft.com/.default',
				grant_type: 'client_credentials'
			});

			// Obter o access token
			const tokenResponse = await axios.post(
				getTokenUrl,
				urlSearchParams.toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			const accessToken: string = tokenResponse.data.access_token;
			return accessToken;
		} catch (error: any) {
			if (error.response) {
				console.log(error.response.data);
			}
			throw new Error(
				'Erro ao obter o accessToken do serviço Azure. Detalhes: ' + error
			);
		}
	}

	async getUserGroups(userId: string): Promise<IAzureUserGroup[]> {
		try {
			const accessToken: string = await this.getAccessToken();
			console.log(userId);
			const userResponse = await axios.get(
				this.graphAPIUrl + `v1.0/users/` + userId + `/memberOf`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json'
					}
				}
			);

			//É retornado pela Azure um Array com todos os grupos que o usuário faz parte
			if (
				userResponse.data.value.length > 0 &&
				userResponse.data.value[0] != null
			) {
				const userGroups: IAzureUserGroup[] = [];

				userResponse.data.value.forEach((group: any) => {
					userGroups.push({
						id: group.id,
						displayName: group.displayName
					});
				});

				return userGroups;
			}

			throw new NotFoundError('NOT_FOUND', {
				cause: 'Nenhum usuário encontrado'
			});
		} catch (error: any) {
			console.log(error.data);
			console.dir(error, { depth: null });
			throw error;
		}
	}

	async refreshToken(refreshToken: string): Promise<SignInOutputDTO> {
		try {
			const tokenEndpoint = `https://${this.authenticationFlowDomainName}/${this.tenantID}/oauth2/v2.0/token?p=b2c_1_ropc`;

			const urlSearchParams = new URLSearchParams({
				grant_type: 'refresh_token',
				client_id: this.clientId,
				refresh_token: refreshToken,
				scope: this.scope + ' openid offline_access'
			});

			// Realiza a requisição no servidor da Azure para obter o novo access token
			const tokenResponse = await axios.post(
				tokenEndpoint,
				urlSearchParams.toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			//Informações detalhadas do perfil do usuário autenticado.
			const userData = this.parseJwt(tokenResponse.data.access_token);

			const accessData: SignInOutputDTO = {
				user: {
					identityProviderUID: userData.sub,
					tenantUID: '',
					userName: userData.name,
					firstName: userData.given_name,
					lastName: userData.family_name,
					email: ''
				},
				tokens: {
					accessToken: tokenResponse.data.access_token,
					refreshToken: tokenResponse.data.refresh_token,
					tokenType: tokenResponse.data.token_type,
					expiresIn: tokenResponse.data.expires_in,
					expiresOn: tokenResponse.data.expires_on,
					refreshTokenExpiresIn: tokenResponse.data.refresh_token_expires_in
				}
			};

			return accessData;
		} catch (error: any) {
			if (error.response) {
				console.log(error.response.data);
			}

			throw new Error(
				'Erro ao obter o accessToken do serviço Azure. Detalhes: ' + error
			);
		}
	}

	async getUserByEmail(email: string): Promise<IUser> {
		const accessToken: string = await this.getAccessToken();
		console.log(accessToken);
		const userResponse = await axios.get(
			this.graphAPIUrl +
				`v1.0/users?$filter=mail eq '${email}' or userPrincipalName eq '${email}' or otherMails/any(x:x eq '${email}')`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			}
		);
		//TODO tem casos que retorna mais de um, isso não pode ocorrer, ver isso na Azure.
		if (
			userResponse.data.value.length > 0 &&
			userResponse.data.value[0] != null
		) {
			return {
				email: email,
				firstName: userResponse.data.value[0].givenName,
				lastName: userResponse.data.value[0].surname,
				identityProviderUID: userResponse.data.value[0].id,
				userName: userResponse.data.value[0].displayName,
				tenantUID: this.tenantID
			};
		}

		throw new NotFoundError('NOT_FOUND', {
			cause: 'Nenhum usuário encontrado'
		});
	}

	async createUser(user: IUser): Promise<IUser> {
		try {
			const graphAPIUrl = 'https://graph.microsoft.com/v1.0/users';

			const accessToken: string = await this.getAccessToken();

			const mailNickname = this.getUsernameFromEmail(user.email!);
			const displayName =
				[user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
				user.userName ||
				mailNickname;
			const userPrincipalName = `${mailNickname}@${this.tenantDomain}`;

			const _user = {
				accountEnabled: true,
				displayName,
				mailNickname,
				userPrincipalName,
				passwordProfile: {
					forceChangePasswordNextSignIn: false, //Aqui estava como verdadeiro
					password: user.password
				},
				// No método ROPC com Azure ID não pode ser usado identities!!!!!!!
				//Como pode ser usado um domíno que não seja da Azure, teria que criar contra e associar ao dominio externo
				// identities: [
				//   {
				//     signInType: "emailAddress",
				//     issuer: domainName,
				//     issuerAssignedId: user.email,
				//   },
				// ],
				// Armazene o email informado para suportar busca por mail
				mail: user.email
			};

			// Requisição para criar o usuário no Azure AD
			const createUserResponse = await axios.post(graphAPIUrl, _user, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			});

			const responseData = createUserResponse.data;
			const resolvedDisplayName =
				responseData.displayName ||
				[responseData.givenName, responseData.surname]
					.filter(Boolean)
					.join(' ')
					.trim();
			const displayNameParts = resolvedDisplayName
				? resolvedDisplayName.split(' ')
				: [];
			const fallbackFirstName =
				responseData.givenName || displayNameParts[0] || '';
			const fallbackLastName =
				responseData.surname ||
				displayNameParts.slice(1).join(' ') ||
				'';

			return {
				email: responseData.mail || responseData.userPrincipalName,
				firstName: fallbackFirstName,
				lastName: fallbackLastName,
				identityProviderUID: responseData.id,
				userName: resolvedDisplayName || responseData.userPrincipalName
			};
		} catch (error: any) {
			if (error?.response) {
				console.error('Azure create user error:', {
					status: error.response.status,
					data: error.response.data
				});
			} else {
				console.error('Azure create user error:', error);
			}
			throw new BadGatewayError('AZURE_CREATE_USER_FAILED', { cause: error });
		}
	}

	/**
	 * Verifica se o email externo desse usuário (exemplo: carlos@gmail.com) está presente em alguma conta na Azure e retorna ela. Após isso será usada fala o acesso.
	 * A justificativa disso é que o acesso com método ROPC com email de domínio esterno ao tenant registrado na Azure não funciona.
	 * @param extenalEmail Email que o usuário usa para acessar
	 * @return Email com domínio externo usado pelo usuário para acesso a API
	 */
	async checkExternalEmail(extenalEmail: string): Promise<string> {
		try {
			const graphToken = await this.getAccessToken(); // client credentials para chamar Graph
			const response = await axios.get(
				`https://graph.microsoft.com/v1.0/users?$filter=mail eq '${extenalEmail}'`,
				{ headers: { Authorization: `Bearer ${graphToken}` } }
			);

			if (!response.data.value?.length) {
				throw new Error('User not found associated to this external email.');
			}

			const user = response.data.value[0];
			const userPrincipalName = user.userPrincipalName as string;

			return userPrincipalName;
		} catch (error) {
			throw new Error(
				'Error to check if external email exist on identity server user data.'
			);
		}
	}

	async signIn(
		username: string,
		password: string,
		useExternalEmail: boolean
	): Promise<SignInOutputDTO> {
		let userPrincipalName: string = '';

		if (useExternalEmail == true) {
			userPrincipalName = await this.checkExternalEmail(username);
		}

		const urlSearchParams = new URLSearchParams({
			grant_type: 'password',
			client_id: this.clientId,
			client_secret: this.clientSecret,
			// username: username,
			username: useExternalEmail == true ? userPrincipalName : username,
			password: password,
			// deve incluir openid para obter o token de ID e offline_access para obter o refresh token
			scope: this.scope
		});

		try {
			const signInResponse = await axios.post(
				`https://login.microsoftonline.com/${this.tenantID}/oauth2/v2.0/token`,
				urlSearchParams.toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);
			//Informações detalhadas do perfil do usuário autenticado.
			const userData = this.parseJwt(signInResponse.data.access_token);
			console.log(userData);
			const resolvedDisplayName = userData.name || '';
			const nameParts = resolvedDisplayName ? resolvedDisplayName.split(' ') : [];
			const firstName =
				userData.given_name || nameParts[0] || resolvedDisplayName || '';
			const lastName =
				userData.family_name || nameParts.slice(1).join(' ') || '';
			const email =
				userData.upn || userData.unique_name || userData.preferred_username || '';
			const identityProviderUID = userData.oid || userData.sub;
			return {
				user: {
					identityProviderUID,
					tenantUID: '',
					userName: resolvedDisplayName || email,
					firstName,
					lastName,
					email
				},
				tokens: {
					accessToken: signInResponse.data.access_token,
					refreshToken: signInResponse.data.refresh_token,
					tokenType: signInResponse.data.token_type,
					expiresIn: signInResponse.data.expires_in,
					expiresOn: signInResponse.data.expires_on,
					refreshTokenExpiresIn: signInResponse.data.refresh_token_expires_in
				}
			};
		} catch (error: any) {
			if (error.response.status == '400') {
				throw new ValidationError('VALITADION', {
					cause: 'Error to access account.'
				});
			}
			console.log(error.response);
			throw error;
		}
	}

	async signOut(
		accessToken: string,
		refreshToken: string | null
	): Promise<boolean> {
		const urlSearchParams = new URLSearchParams({
			grant_type: 'password',
			client_id: this.clientId,
			token: accessToken,
			refresh_token: refreshToken != null ? refreshToken : ''
		});

		try {
			const signInResponse = await axios.post(
				`https://${this.authenticationFlowDomainName}/${this.domainName}/oauth2/v2.0/logout?p=b2c_1_ropc`,
				urlSearchParams.toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			return true;
		} catch (error) {
			throw new Error(
				'Error to signout user on Azure Indentity Server. Detail: ' + error
			);
		}
	}

	private parseJwt(token: string): any {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join('')
		);

		return JSON.parse(jsonPayload);
	}

	async updateUser(user: IUser): Promise<IUser> {
		// // Requisição para atualizar os dados do usuário no Azure AD
		// const updateUserResponse = await axios.patch(`https://graph.microsoft.com/v1.0/users/${userDetails.userId}`, userData, {
		//   headers: {
		//     'Authorization': `Bearer ${accessToken}`,
		//     'Content-Type': 'application/json'
		//   }
		// });

		// // Verificar se a atualização foi bem-sucedida
		// if (updateUserResponse.status === 204) {

		// }
		throw new Error('Método não implementado');
	}

	async resetUserPassword(email: string, newPassword: string): Promise<IUser> {
		const accessToken: string = await this.getAccessToken();
		let userResponse;

		try {
			// Endpoint da Microsoft Graph API para buscar o usuário pelo e-mail
			userResponse = await axios.get(
				`https://graph.microsoft.com/v1.0/users?$filter=mail eq '${email}'`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json'
					}
				}
			);
		} catch (error) {
			throw new Error(
				'Error to find user on identity server. Details: ' + error
			);
		}

		// Verifica se encontrou o usuário
		if (!userResponse.data || userResponse.data.value.length === 0) {
			throw new NotFoundError('NOT_FOUND', {
				cause: 'User not found to change password.'
			});
		}

		const userId = userResponse.data.value[0].id; // Obtém o ID do usuário

		try {
			// Requisição para alterar a senha do usuário
			await axios.patch(
				`https://graph.microsoft.com/v1.0/users/${userId}`,
				{
					passwordProfile: {
						forceChangePasswordNextSignIn: true,
						password: newPassword
					}
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json'
					}
				}
			);
		} catch (error: any) {
			console.dir(error.response.data, { depth: null });
			throw new Error(
				'Error to change user password on identity server. Details: ' + error
			);
		}

		return {
			email: email,
			firstName: userResponse.data.value[0].givenName,
			lastName: userResponse.data.value[0].surname,
			identityProviderUID: userResponse.data.value[0].id,
			userName: userResponse.data.value[0].displayName,
			tenantUID: this.tenantID
		};
		/*
        try {
          const accessToken: string = await this.getAccessToken();
    
          const body = {
            "passwordProfile": {
              "forceChangePasswordNextSignIn": false,
              "password": newPassword
            }
          }
    
          // Altera senha do usuário
          const updateUserPasswordResponse = await axios.patch(this.graphAPIUrl + `v1.0/users/` + userUID, body, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
          });
    
          return userUID;
    
        } catch (error: any) {
          console.dir(error.response.data, { depth: null });
          throw new Error("Erro ao alterar senha do usuário na Azure. Detalhes: " + error);
        }
    */
	}

	async deleteUser(userID: string): Promise<string> {
		const accessToken: string = await this.getAccessToken();

		// Criará o usuário
		const updateUserResponse = await axios.post(
			this.graphAPIUrl + `v1.0/users` + userID,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			}
		);

		console.log(
			'Retorno da atualização de dados do usuário na Azure: ',
			updateUserResponse
		);

		if (updateUserResponse.status === 204) {
			return userID;
		}

		throw new Error('Erro ao fazer a remoção do usuário na Azure.');
	}

	getUsernameFromEmail(email: string): string {
		const atIndex = email.indexOf('@');

		// Se não encontrar o '@', retorne uma string vazia ou um erro
		if (atIndex === -1) {
			throw new Error('Email inválido');
		}

		return email.substring(0, atIndex);
	}

	async getDomainName(accessToken: string) {
		// Requisição para obter as informações da organização (incluindo o domínio)
		const organizationResponse = await axios.get(
			'https://graph.microsoft.com/v1.0/organization',
			{
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		);

		// Extrair o domínio principal
		const domainName = organizationResponse.data.value[0].verifiedDomains.find(
			(domain: any) => domain.isDefault
		).name;
		return domainName;
	}

	async getApplications(accessToken: string) {
		try {
			const response = await axios.get(
				'https://graph.microsoft.com/v1.0/applications',
				{
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				}
			);
			console.log('Aplicações Registradas:', response.data.value);

			return response.data.value;
		} catch (error: any) {
			console.error('Erro ao obter as aplicações:', error.response.data);
		}
	}

	async getUserProfilePhoto(
		userUID: string
	): Promise<GetUserProfilePhotoOutputDTO> {
		try {
			const accessToken: string = await this.getAccessToken();

			// Requisição para obter imagem de perfil do usuário no servidor da Azure
			const userResponse = await axios.get(
				this.graphAPIUrl + 'v1.0/users/' + userUID + '/photo/',
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json'
					}
				}
			);

			//TODO terminar essa parte para enviar o blob para o frontend
			console.dir(userResponse.data, { depth: null });

			return { imageUrl: 'ddd' };
		} catch (error: any) {
			console.dir(error.response.data, { depth: null });
			throw new NotFoundError('NOT_FOUND', {
				cause: 'Profile photo not found.'
			});
		}
	}

	//Requer permissão User.ReadWrite.All ativo
	async updateUserProfilePhoto(
		accessToken: string,
		photoBlob: Blob
	): Promise<boolean> {
		try {
			// Requisição para alterar imagem de perfil do usuário no servidor da Azure
			const userResponse = await axios.put(
				this.graphAPIUrl + 'v1.0/me/photo/$value',
				photoBlob,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'image/jpeg'
					}
				}
			);

			return true;
		} catch (error: any) {
			console.dir(error.response.data, { depth: null });
			throw error;
		}
	}
}
