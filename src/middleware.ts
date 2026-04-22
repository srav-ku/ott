import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Very basic in-memory rate limiter for Edge
const ipCache = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 50; // Requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Note: NextRequest.ip is removed natively in 15+, so we rely on headers
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const now = Date.now();

    const record = ipCache.get(ip);
    if (!record || now > record.resetTime) {
      ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      return NextResponse.next();
    }

    if (record.count >= RATE_LIMIT) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too Many Requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    record.count++;
    
    // Cleanup old records occasionally to prevent memory leak
    if (Math.random() < 0.05) {
       for (const [key, value] of ipCache.entries()) {
           if (now > value.resetTime) ipCache.delete(key);
       }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
