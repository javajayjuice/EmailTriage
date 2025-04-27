import { NextResponse } from 'next/server';
import { getRedisClient, testRedisConnection, isRedisCacheEnabled } from '@/lib/redis';

/**
 * Debug endpoint to test Redis connectivity
 */
export async function GET() {
  try {
    console.log('[Redis Debug] Endpoint called');
    
    // Check if Redis is enabled
    const redisEnabled = isRedisCacheEnabled();
    
    // If Redis is disabled, return early
    if (!redisEnabled) {
      return NextResponse.json({
        success: true,
        message: 'Redis caching is disabled by configuration',
        redisEnabled: false,
        time: new Date().toISOString(),
      });
    }
    
    // Check environment variables
    const envCheck = {
      url: !!process.env.UPSTASH_REDIS_REST_URL,
      token: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    };
    
    // Test connection only if Redis is enabled
    const isConnected = await testRedisConnection();
    
    // If connected, get additional metadata
    let metadata = {};
    if (isConnected) {
      try {
        const pingStart = performance.now();
        await getRedisClient()?.ping();
        const pingEnd = performance.now();
        metadata = { pingLatencyMs: Math.round(pingEnd - pingStart) };
      } catch (infoError) {
        console.warn('Could not retrieve Redis metadata:', infoError);
      }
    }
    
    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Redis connected successfully' : 'Redis connection failed',
      redisEnabled,
      environment: envCheck,
      metadata,
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Redis Debug] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Redis test failed with error',
        error: (error as Error).message,
        redisEnabled: isRedisCacheEnabled(),
      },
      { status: 500 }
    );
  }
}