import { createClient, RedisClientType } from "redis";

type CacheEntry = {
  value: string;
  expiresAt?: number;
};

export class RedisCache {
  private client?: RedisClientType;
  private isConnected = false;
  private memoryCache: Map<string, CacheEntry> = new Map();

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const shouldUseRedis =
      redisUrl !== undefined &&
      redisUrl !== "" &&
      redisUrl.toLowerCase() !== "disabled";

    if (!shouldUseRedis) {
      return;
    }

    this.client = createClient({ url: redisUrl });

    this.client.on("error", (err) => {
      console.error("Redis Client Error", err);
      this.isConnected = false;
    });

    this.client
      .connect()
      .then(() => {
        this.isConnected = true;
      })
      .catch((err) => {
        console.error("Redis Client Error", err);
        this.isConnected = false;
      });
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (this.isConnected && this.client) {
      await this.client.set(key, serializedValue, { EX: ttl });
      return;
    }
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
    this.memoryCache.set(key, { value: serializedValue, expiresAt });
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    }
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value ? JSON.parse(entry.value) : null;
  }

  async delete(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.del(key);
      return;
    }
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.flushDb();
      return;
    }
    this.memoryCache.clear();
  }
}
