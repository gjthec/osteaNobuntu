import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UnauthorizedError } from '../../errors/client.error';
import { AUTH_PROVIDERS } from '../../infra/config/authProviders.config';

export interface AuthenticatedUser {
	uid: string;
	email?: string;
	provider: string;
	rawToken: DecodedToken;
	additionalData: Record<string, any>;
}

interface ValidateTokenOptions {
	issuer: string | string[]; // O emissor esperado do token
	audience?: string | string[]; // A audiência esperada (opcional) (nesse caso é o ClientId)
	jwksUri: string;
}

interface DecodedToken extends JwtPayload {
	[key: string]: any;
}

export class ValidateAccessTokenUseCase {
	constructor() {}

	async execute(
		token: string,
		options: ValidateTokenOptions
	): Promise<AuthenticatedUser> {
		const _jwksClient = jwksClient({
			jwksUri: options.jwksUri,
			cache: true,
			cacheMaxEntries: 5,
			cacheMaxAge: 600000 // 10 minutos
		});

		if (token == null) {
			throw new UnauthorizedError('UNAUTHORIZED', { cause: 'Token empty.' });
		}

		// Decodifica o token sem verificar para extrair informações do cabeçalho
		const decodedHeader = jwt.decode(token, { complete: true });
		if (!decodedHeader || typeof decodedHeader === 'string') {
			throw new UnauthorizedError('UNAUTHORIZED', {
				cause: 'Invalid token format'
			});
		}

		const keyId: string | undefined = decodedHeader.header.kid;
		const algorithm: jwt.Algorithm = decodedHeader.header.alg as jwt.Algorithm;
		if (keyId == undefined) {
			throw new UnauthorizedError('UNAUTHORIZED', {
				cause: "Token missing 'kid' in header"
			});
		}

		// Obtém a chave de assinatura correspondente
		const publicKey = await this.getSigningKey(keyId, _jwksClient);
		// Verifica e decodifica o token
		try {
			const verifiedToken = jwt.verify(token, publicKey, {
				clockTolerance: 30,
				issuer: options.issuer, //Compara se o Emissor do token é o correto
				audience: options.audience,
				algorithms: ['RS256']
			}) as DecodedToken;

			// return verifiedToken;

			// Extrair dados do usuário baseado no provedor
			const authenticatedUser = this.extractUserData(
				verifiedToken,
				options.issuer
			);

			return authenticatedUser;
		} catch (error) {
			// console.log(error);
			throw new UnauthorizedError('UNAUTHORIZED', { cause: 'Invalid token' });
		}
	}

	async getSigningKey(kid: string, jwksClient: any): Promise<string> {
		try {
			const key = await new Promise((resolve, reject) => {
				jwksClient.getSigningKey(kid, (error: Error, key: any) => {
					if (error) return reject(error);
					resolve(key);
				});
			});
			return (key as any).getPublicKey();
		} catch (error) {
			throw new Error(`Failed to get signing key: ${error}`);
		}
	}

	/**
	 *
	 * @param token
	 * @param issuer
	 * @returns Retorna dados do usuário autenticado
	 */
	private extractUserData(
		token: DecodedToken,
		issuer: string
	): AuthenticatedUser {
		const provider = this.detectProvider(issuer);
		const config = AUTH_PROVIDERS[provider] || AUTH_PROVIDERS['generic'];

		const uid = token[config.uidField];
		if (!uid) {
			throw new UnauthorizedError('UNAUTHORIZED', {
				cause: `UID field '${config.uidField}' not found in token`
			});
		}

		// Extrair campos adicionais
		const additionalData: Record<string, any> = {};
		config.additionalFields?.forEach((field) => {
			if (token[field]) {
				additionalData[field] = token[field];
			}
		});

		return {
			uid: String(uid),
			email: token.email || additionalData.email,
			provider,
			rawToken: token,
			additionalData
		};
	}

	/**
	 * Identifica o provedor de identidade
	 * @param issuer
	 * @returns Nome do provedor de identidade
	 */
	private detectProvider(issuer: string): string {
		// Primeiro tenta pela variável de ambiente
		const envProvider = process.env.AUTH_PROVIDER?.toLowerCase();
		if (envProvider && AUTH_PROVIDERS[envProvider]) {
			return envProvider;
		}

		// Se não, detecta pelo issuer
		for (const [provider, config] of Object.entries(AUTH_PROVIDERS)) {
			if (config.issuerPattern && config.issuerPattern.test(issuer)) {
				return provider;
			}
		}

		return 'generic';
	}
}
