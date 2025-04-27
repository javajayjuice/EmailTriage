import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

// This runs in the Node.js environment, not Edge Runtime
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
    }
    
    const value = await redis.get(key);
    return NextResponse.json({ value });
  } catch (error) {
    console.error('Redis proxy error:', error);
    return NextResponse.json({ error: 'Redis operation failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value, ttl } = await req.json();
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }
    
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis proxy error:', error);
    return NextResponse.json({ error: 'Redis operation failed' }, { status: 500 });
  }
}