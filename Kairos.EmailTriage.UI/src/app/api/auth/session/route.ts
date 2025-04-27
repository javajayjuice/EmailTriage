import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { isRedisCacheEnabled, sessionUtils } from '@/lib/redis';

// Session TTL in seconds (1 day)
const SESSION_TTL = 86400;

export async function POST(req: NextRequest) {
  try {
    const { token, useRedisCache } = await req.json();
    
    if (!token) {
      console.error('No token provided in session creation request');
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }
    
    const sessionId = uuidv4();
    
    // Override environment setting with request parameter if provided
    const shouldUseRedis = useRedisCache !== undefined ? useRedisCache : isRedisCacheEnabled();
    
    // Store session in Redis if enabled
    if (shouldUseRedis) {
      const success = await sessionUtils.storeSession(sessionId, token, SESSION_TTL);
      
      if (!success) {
        console.error('Failed to store session in Redis');
        // In production, fail if Redis storage fails when explicitly requested
        if (process.env.NODE_ENV === 'production' && useRedisCache === true) {
          return NextResponse.json(
            { success: false, message: 'Failed to create session in Redis' },
            { status: 500 }
          );
        }
        // Otherwise continue with cookie only
        console.warn('Continuing with session cookie only (Redis storage failed)');
      }
    }
    
    // Set session cookie regardless of Redis status
    (await
          // Set session cookie regardless of Redis status
          cookies()).set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL,
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json({ success: true, usingRedis: shouldUseRedis });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const sessionId = (await cookies()).get('sessionId')?.value;
    
    if (sessionId && isRedisCacheEnabled()) {
      await sessionUtils.removeSession(sessionId);
    }
    
    // Clear the cookie regardless of Redis status
    (await
          // Clear the cookie regardless of Redis status
          cookies()).delete('sessionId');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete session' },
      { status: 500 }
    );
  }
}