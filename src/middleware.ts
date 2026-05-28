import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/me',
];

// Public GET endpoints (no auth needed)
const PUBLIC_GET_PREFIXES = [
  '/api/products',
  '/api/categories',
  '/api/banners',
  '/api/seo',
  '/api/settings',
  '/api/content-pages',
  '/api/blog',
  '/api/media',
  '/api/redirects',
];

// Public POST endpoints
const PUBLIC_POST_PATHS = [
  '/api/enquiries',
  '/api/contact',
  '/api/upload',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /api/ routes
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  // Allow public auth endpoints
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow public GET endpoints
  if (request.method === 'GET' && PUBLIC_GET_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow public POST endpoints
  if (request.method === 'POST' && PUBLIC_POST_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check authorization
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-email', payload.email);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: '/api/:path*',
};
