import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { isRedisCacheEnabled } from './lib/redis';

// Static files pattern
const PUBLIC_FILE = /\.(.*)$/;

// Protected routes that require authentication
const protectedRoutes = [ '/tickets', '/about', '/dashboard'];

// Public routes that are always accessible
const publicRoutes = ['/login', '/register', '/api/auth'];

// Initialize Redis client for Edge compatibility if enabled
let redis: Redis | null = null;
if (isRedisCacheEnabled() && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/auth/session') ||
    pathname.includes('/favicon.ico') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  // Allow access to public routes
  for (const route of publicRoutes) {
    if (pathname.startsWith(route)) {
      return NextResponse.next();
    }
  }
  
  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route))
  );
  
  if (!requiresAuth) {
    return NextResponse.next();
  }
  
  // Get session ID from cookie
  const sessionId = req.cookies.get('sessionId')?.value;
  
  if (!sessionId) {
    // No session found, redirect to login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', encodeURIComponent(pathname + req.nextUrl.search));
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // If Redis is disabled, allow the request (JWT tokens will be validated client-side)
    if (!isRedisCacheEnabled() || !redis) {
      return NextResponse.next();
    }
    
    // Otherwise, verify token exists in Redis
    const token = await redis.get(`session:${sessionId}`);
    
    if (!token) {
      // Invalid or expired session
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', encodeURIComponent(pathname + req.nextUrl.search));
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }
    
    // Session is valid, allow the request
    return NextResponse.next();
  } catch (error) {
    console.error('Session validation error:', error);
    
    // On Redis error, implement fallback strategy
    // Here we're allowing the request through since the JWT can be validated client-side
    if (process.env.NODE_ENV === 'development') {
      console.warn('Redis error in middleware - allowing request to proceed with client-side validation');
      return NextResponse.next();
    } else {
      // In production, redirect to login with error
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'session_verification_failed');
      return NextResponse.redirect(loginUrl);
    }
  }
}

export const config = {
  matcher: [
    // Match all paths except static assets and authentication endpoints
    '/((?!_next/static|_next/image|favicon.ico|api/auth/|images/|fonts/).*)',
  ],
};
