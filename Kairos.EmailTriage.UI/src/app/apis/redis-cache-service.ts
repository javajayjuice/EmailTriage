import { createClient } from 'redis';

interface CacheItem<T> {
  data: T;
  expiresAt: number; // timestamp when this item expires
}

export class RedisCacheService {
  private static client: ReturnType<typeof createClient> | null = null;
  private static connecting: Promise<void> | null = null;

  // Initialize Redis connection
  private static async getClient() {
    if (!this.client) {
      if (!this.connecting) {
        this.connecting = this.initializeClient();
      }
      await this.connecting;
    }
    return this.client;
  }

  private static async initializeClient() {
    try {
      // Create Redis client with your configuration
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        // Add any Redis configuration options here
      });

      // Set up error handling
      this.client.on('error', (err) => {
        console.error('Redis Client Error', err);
      });

      // Connect to Redis
      await this.client.connect();
      console.log('Connected to Redis successfully');
    } catch (error) {
      console.error('Failed to connect to Redis', error);
      this.client = null;
    } finally {
      this.connecting = null;
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      if (!client) {
        console.warn('Redis client not available, falling back to local cache');
        return null;
      }

      const data = await client.get(key);
      if (!data) return null;

      const cachedItem = JSON.parse(data) as CacheItem<T>;
      
      // Check if item is expired
      if (cachedItem.expiresAt < Date.now()) {
        await this.invalidate(key);
        return null;
      }

      return cachedItem.data;
    } catch (error) {
      console.error('Error retrieving from Redis cache:', error);
      return null;
    }
  }

  static async set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) {
        console.warn('Redis client not available, cache not set');
        return;
      }

      const cacheItem: CacheItem<T> = {
        data,
        expiresAt: Date.now() + expiresIn,
      };

      // Store in Redis with expiration
      await client.set(key, JSON.stringify(cacheItem), {
        PX: expiresIn, // Set expiration in milliseconds
      });
    } catch (error) {
      console.error('Error setting Redis cache:', error);
    }
  }

  static async invalidate(key: string): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) return;

      await client.del(key);
    } catch (error) {
      console.error('Error invalidating Redis cache:', error);
    }
  }

  static async invalidateAll(): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) return;

      await client.flushDb();
    } catch (error) {
      console.error('Error clearing Redis cache:', error);
    }
  }

  // Ensure array data has unique IDs
  static ensureUniqueIds<T extends Array<{id?: string | number}>>(data: T, idField: string = 'id'): T {
    const seenIds = new Set<string | number>();
    const uniqueData = data.filter(item => {
      const itemId = item[idField as keyof typeof item];
      
      if (itemId === undefined || itemId === null) {
        console.warn('Item without ID found in array', item);
        return true;
      }
      
      if (seenIds.has(itemId)) {
        console.warn(`Duplicate ID detected: ${itemId}. Item excluded from results.`, item);
        return false;
      }
      
      seenIds.add(itemId);
      return true;
    });
    
    return uniqueData as T;
  }

  // Close Redis connection when done
  static async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}