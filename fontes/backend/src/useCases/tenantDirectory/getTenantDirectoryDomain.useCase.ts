import axios from 'axios';

export class GetTenantDomainUseCase {
	constructor() {}

	async execute(): Promise<any | Error> {
		const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;

		const clientId = process.env.CLIENT_ID;
		const clientSecret = process.env.CLIENT_SECRET;

		if (clientId == undefined || clientSecret == undefined) {
			return new Error('Client ID or Client Secret is not defined');
		}

		const data = new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: clientId,
			client_secret: clientSecret,
			scope: 'https://graph.microsoft.com/.default'
		});

		try {
			// Obter o access token
			const tokenResponse = await axios.post(tokenUrl, data.toString(), {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});

			const accessToken = tokenResponse.data.access_token;

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
			const domainName =
				organizationResponse.data.value[0].verifiedDomains.find(
					(domain: any) => domain.isDefault
				).name;

			// Retornar o domínio principal
			return {
				message: 'Tenant domain retrieved successfully',
				domain: domainName
			};
		} catch (error) {
			throw new Error('Failed to retrieve tenant domain: ' + error);
		}
	}
}