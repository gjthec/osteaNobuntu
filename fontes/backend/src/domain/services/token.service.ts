import axios from 'axios';
import jwt, { Jwt } from 'jsonwebtoken';
import { InternalServerError } from '../../errors/internal.error';
const jwkToPem = require('jwk-to-pem');

export class TokenService {
	private JWKsURI: string;

	constructor(JWKsURI: string) {
		//Obtem o link do JWKs
		this.JWKsURI = JWKsURI;
	}

	async getJWKs(JWKsURI: string) {
		try {
			const response = await axios.get(JWKsURI);
			return response.data.keys;
		} catch (error) {
			throw new InternalServerError('Error to get JWKs.', { cause: error });
		}
	}

	async verifyToken(token: string): Promise<boolean> {
		const jwks = await this.getJWKs(this.JWKsURI);
		const pem = jwkToPem(jwks);

		try {
			// Passo o token e a key no formato pem para decodificar o token
			const decoded = jwt.verify(token, pem) as any;

			const now = Math.floor(Date.now() / 1000);
			// Verifica se o token não expirou
			if (decoded.exp < now) {
				throw new Error('Expired Token.');
			}

			// Verifica se o token ainda não é válido (antes do momento atual)
			if (decoded.nbf && decoded.nbf > now) {
				throw new Error('Invlaid Token.');
			}

			return decoded.sub;
		} catch (error) {
			console.error('Erro ao validar o token:', error);
			// return null;
			throw new Error('Error to verify token. Detail: ' + error);
		}
	}
}
