import { randomUUID } from 'crypto';
import { RedisCache } from '../../cache/redis';

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
	return {
		httpOnly: true,
		secure: true,
		sameSite: 'lax' as const,
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

	async createSession(user: SessionUser, accessToken?: string): Promise<SessionData> {
		const sessionId = randomUUID();
		const issuedAt = Date.now();
		const ttlSeconds = getSessionTtlSeconds();
		const expiresAt = issuedAt + ttlSeconds * 1000;
		const session: SessionData = {
			id: sessionId,
			user,
			accessToken,
			issuedAt,
			expiresAt
		};

		await this.cache.set(buildSessionKey(sessionId), session, ttlSeconds);
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
		const ttlSeconds = getSessionTtlSeconds();
		const issuedAt = Date.now();
		const expiresAt = issuedAt + ttlSeconds * 1000;
		const refreshed: SessionData = {
			...existing,
			issuedAt,
			expiresAt
		};
		await this.cache.set(buildSessionKey(sessionId), refreshed, ttlSeconds);
		return refreshed;
	}

	async deleteSession(sessionId: string): Promise<void> {
		await this.cache.delete(buildSessionKey(sessionId));
	}
}
