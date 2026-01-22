import { createClient } from "redis";

export class RedisCache {
  private client;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => console.error("Redis Client Error", err));

    this.client.connect();
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.client.set(key, serializedValue, { EX: ttl });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushDb();
  }
}