import { randomUUID } from 'crypto';
import { RedisCache } from '../../cache/redis';
import { IUserAccessData } from '../../../domain/entities/userAcessData.model';

export type SessionUser = {
	id?: number;
	identityProviderUID: string;
	email?: string;
	userName?: string;
	firstName?: string;
	lastName?: string;
	roles: string[];
	tenantUID?: string;
};

export type SessionData = {
	id: string;
	user: SessionUser;
	accessToken?: string;
	refreshToken?: string;
	accessTokenExpiresAt?: number;
	refreshTokenExpiresAt?: number;
	issuedAt: number;
	expiresAt: number;
};

const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || '8');
const SESSION_REFRESH_THRESHOLD_MINUTES = Number(
	process.env.SESSION_REFRESH_THRESHOLD_MINUTES || '30'
);

export function getSessionCookieName(): string {
	return process.env.SESSION_COOKIE_NAME || 'session_id';
}

export function getSessionTtlSeconds(): number {
	return SESSION_TTL_HOURS * 60 * 60;
}

export function getSessionRefreshThresholdMs(): number {
	return SESSION_REFRESH_THRESHOLD_MINUTES * 60 * 1000;
}

export function buildSessionCookieOptions(maxAgeMs: number) {
	const secureFromEnv = process.env.COOKIE_SECURE;
	const secure =
		secureFromEnv !== undefined
			? secureFromEnv.toLowerCase() === 'true'
			: process.env.NODE_ENV === 'production';
	const sameSiteEnv = process.env.COOKIE_SAMESITE || 'lax';
	const sameSite =
		sameSiteEnv === 'none' || sameSiteEnv === 'strict' || sameSiteEnv === 'lax'
			? (sameSiteEnv as 'none' | 'strict' | 'lax')
			: 'lax';
	const domain = process.env.COOKIE_DOMAIN;
	return {
		httpOnly: true,
		secure,
		sameSite,
		domain,
		path: '/',
		maxAge: maxAgeMs
	};
}

function buildSessionKey(sessionId: string): string {
	return `session:${sessionId}`;
}

export class SessionService {
	private static instance: SessionService;
	private cache: RedisCache;

	private constructor() {
		this.cache = new RedisCache();
	}

	static getInstance(): SessionService {
		if (!SessionService.instance) {
			SessionService.instance = new SessionService();
		}
		return SessionService.instance;
	}

	private resolveAccessTokenExpiry(
		issuedAt: number,
		tokens?: IUserAccessData
	): number | undefined {
		if (!tokens) {
			return undefined;
		}
		if (tokens.expiresOn) {
			const expiresOnMs = Number(tokens.expiresOn) * 1000;
			if (!Number.isNaN(expiresOnMs) && expiresOnMs > 0) {
				return expiresOnMs;
			}
		}
		if (tokens.expiresIn) {
			return issuedAt + tokens.expiresIn * 1000;
		}
		return undefined;
	}

	private resolveRefreshTokenExpiry(
		issuedAt: number,
		tokens?: IUserAccessData
	): number | undefined {
		if (!tokens || !tokens.refreshTokenExpiresIn) {
			return undefined;
		}
		return issuedAt + tokens.refreshTokenExpiresIn * 1000;
	}

	private resolveSessionExpiry(
		issuedAt: number,
		accessTokenExpiresAt?: number,
		refreshTokenExpiresAt?: number
	): number {
		if (refreshTokenExpiresAt) {
			return refreshTokenExpiresAt;
		}
		if (accessTokenExpiresAt) {
			return accessTokenExpiresAt;
		}
		return issuedAt + getSessionTtlSeconds() * 1000;
	}

	private resolveCacheTtlSeconds(expiresAt: number): number {
		const remainingMs = expiresAt - Date.now();
		const ttlSeconds = Math.floor(remainingMs / 1000);
		return ttlSeconds > 0 ? ttlSeconds : 1;
	}

	private async persistSession(sessionId: string, session: SessionData): Promise<void> {
		await this.cache.set(
			buildSessionKey(sessionId),
			session,
			this.resolveCacheTtlSeconds(session.expiresAt)
		);
	}

	async createSession(
		user: SessionUser,
		tokens?: IUserAccessData
	): Promise<SessionData> {
		const sessionId = randomUUID();
		const issuedAt = Date.now();
		const accessTokenExpiresAt = this.resolveAccessTokenExpiry(issuedAt, tokens);
		const refreshTokenExpiresAt = this.resolveRefreshTokenExpiry(issuedAt, tokens);
		const expiresAt = this.resolveSessionExpiry(
			issuedAt,
			accessTokenExpiresAt,
			refreshTokenExpiresAt
		);
		const session: SessionData = {
			id: sessionId,
			user,
			accessToken: tokens?.accessToken,
			refreshToken: tokens?.refreshToken,
			accessTokenExpiresAt,
			refreshTokenExpiresAt,
			issuedAt,
			expiresAt
		};

		await this.persistSession(sessionId, session);
		return session;
	}

	async getSession(sessionId: string): Promise<SessionData | null> {
		return this.cache.get<SessionData>(buildSessionKey(sessionId));
	}

	async refreshSession(sessionId: string): Promise<SessionData | null> {
		const existing = await this.getSession(sessionId);
		if (!existing) {
			return null;
		}
		const issuedAt = Date.now();
		const expiresAt = this.resolveSessionExpiry(
			issuedAt,
			existing.accessTokenExpiresAt,
			existing.refreshTokenExpiresAt
		);
		const refreshed: SessionData = {
			...existing,
			issuedAt,
			expiresAt
		};
		await this.persistSession(sessionId, refreshed);
		return refreshed;
	}

	async updateSessionTokens(
		sessionId: string,
		tokens: IUserAccessData
	): Promise<SessionData | null> {
		const existing = await this.getSession(sessionId);
		if (!existing) {
			return null;
		}

		const issuedAt = Date.now();
		const accessTokenExpiresAt =
			this.resolveAccessTokenExpiry(issuedAt, tokens) ??
			existing.accessTokenExpiresAt;
		const refreshTokenExpiresAt =
			this.resolveRefreshTokenExpiry(issuedAt, tokens) ??
			existing.refreshTokenExpiresAt;
		const expiresAt = this.resolveSessionExpiry(
			issuedAt,
			accessTokenExpiresAt,
			refreshTokenExpiresAt
		);

		const updated: SessionData = {
			...existing,
			accessToken: tokens.accessToken ?? existing.accessToken,
			refreshToken: tokens.refreshToken ?? existing.refreshToken,
			accessTokenExpiresAt,
			refreshTokenExpiresAt,
			issuedAt,
			expiresAt
		};

		await this.persistSession(sessionId, updated);
		return updated;
	}

	async deleteSession(sessionId: string): Promise<void> {
		await this.cache.delete(buildSessionKey(sessionId));
	}
}
