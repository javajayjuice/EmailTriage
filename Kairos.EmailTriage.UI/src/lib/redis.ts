import { Redis } from '@upstash/redis';

// Check if Redis caching is enabled through environment variable
export const isRedisCacheEnabled = () => {
  return process.env.USE_REDIS_CACHE === 'true';
};

// Singleton pattern for Redis client
let redisClient: Redis | null = null;

/**
 * Returns a singleton instance of the Upstash Redis client
 * @returns Redis client instance or null if Redis is disabled
 */
export function getRedisClient(): Redis | null {
  // If Redis is disabled, return null
  if (!isRedisCacheEnabled()) {
    return null;
  }
  
  if (!redisClient) {
    // Validate environment variables
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('Upstash Redis environment variables are not set, but Redis is enabled');
      return null;
    }

    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      retry: {
        retries: 3,
        backoff: (retryCount) => Math.min(retryCount * 100, 3000),
      }
    });
  }
  return redisClient;
}

/**
 * Tests the Redis connection if enabled
 * @returns true if connection successful or Redis disabled, false if connection fails
 */
export async function testRedisConnection(): Promise<boolean> {
  // If Redis is disabled, return true (connection test "passes" by default)
  if (!isRedisCacheEnabled()) {
    return true;
  }
  
  try {
    const redis = getRedisClient();
    if (!redis) return false;
    
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}

/**
 * Session utilities for storage with Redis toggle support
 */
export const sessionUtils = {
  /**
   * Stores a user session
   * @param sessionId Unique session identifier
   * @param token Auth token to store
   * @param ttl Time-to-live in seconds
   * @returns true if successful
   */
  async storeSession(sessionId: string, token: string, ttl: number = 86400): Promise<boolean> {
    try {
      // If Redis is disabled, simply return success
      if (!isRedisCacheEnabled()) {
        return true;
      }
      
      const redis = getRedisClient();
      if (!redis) return false;
      
      await redis.setex(`session:${sessionId}`, ttl, token);
      return true;
    } catch (error) {
      console.error('Failed to store session:', error);
      return false;
    }
  },

  /**
   * Retrieves a session
   * @param sessionId Session identifier
   * @returns token if found, null otherwise
   */
  async getSession(sessionId: string): Promise<string | null> {
    try {
      // If Redis is disabled, we can't retrieve sessions this way
      if (!isRedisCacheEnabled()) {
        return null;
      }
      
      const redis = getRedisClient();
      if (!redis) return null;
      
      return await redis.get(`session:${sessionId}`);
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  /**
   * Removes a session
   * @param sessionId Session identifier
   * @returns true if successful
   */
  async removeSession(sessionId: string): Promise<boolean> {
    try {
      // If Redis is disabled, simply return success
      if (!isRedisCacheEnabled()) {
        return true;
      }
      
      const redis = getRedisClient();
      if (!redis) return false;
      
      await redis.del(`session:${sessionId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove session:', error);
      return false;
    }
  }
};