export interface ICacheService {
	set(key: string, value: string, expiresIn: number): Promise<void>;
	get(key: string): Promise<string | null>;
}