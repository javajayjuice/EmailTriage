import { CacheService } from './cache-service'; // Your existing in-memory cache
import { RedisCacheService } from './redis-cache-service';

export class HybridCacheService {
  // This determines whether we should try Redis or not
  private static isServer = typeof window === 'undefined';
  
  // For client-side, we'll use the in-memory cache
  // For server-side, we'll try Redis first, then fall back to in-memory
  
  static async get<T>(key: string): Promise<T | null> {
    if (this.isServer) {
      // Try Redis first on server
      const redisResult = await RedisCacheService.get<T>(key);
      if (redisResult !== null) {
        return redisResult;
      }
    }
    
    // Fall back to in-memory cache or use it directly on client-side
    return CacheService.get<T>(key);
  }
  
  static async set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): Promise<void> {
    // Always set in-memory cache
    CacheService.set(key, data, expiresIn);
    
    // Also set in Redis if on server
    if (this.isServer) {
      await RedisCacheService.set(key, data, expiresIn);
    }
  }
  
  static async invalidate(key: string): Promise<void> {
    CacheService.invalidate(key);
    if (this.isServer) {
      await RedisCacheService.invalidate(key);
    }
  }
  
  static async invalidateAll(): Promise<void> {
    CacheService.invalidateAll();
    if (this.isServer) {
      await RedisCacheService.invalidateAll();
    }
  }

  static ensureUniqueIds<T extends Array<{id?: string | number}>>(data: T, idField: string = 'id'): T {
    return CacheService.ensureUniqueIds(data, idField);
  }
}