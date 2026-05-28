import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/me',
  '/api/redirects/check',
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
];

// Role-based permission map
// admin: full access to everything
// clerk: read-only for products/categories, can manage enquiries, no settings/users/media/pages/blog/banners/redirects
const ROLE_PERMISSIONS: Record<string, {
  read: string[];   // GET endpoints the role can access (prefixes)
  write: string[];  // POST/PUT/DELETE endpoints the role can access (prefixes)
}> = {
  admin: {
    read: ['*'], // wildcard = all
    write: ['*'],
  },
  clerk: {
    read: [
      '/api/products',
      '/api/categories',
      '/api/enquiries',
      '/api/banners',
      '/api/blog',
      '/api/content-pages',
      '/api/settings',
      '/api/media',
      '/api/redirects',
    ],
    write: [
      '/api/enquiries',
    ],
  },
};

// In-memory redirect cache with TTL
interface CachedRedirect {
  to: string;
  type: string;
  expiresAt: number;
}

const redirectCache = new Map<string, CachedRedirect>();
const REDIRECT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function checkPermission(role: string, method: string, pathname: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const isRead = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
  const allowedList = isRead ? permissions.read : permissions.write;

  if (allowedList.includes('*')) return true;

  return allowedList.some(prefix => pathname.startsWith(prefix));
}

async function checkRedirect(pathname: string): Promise<CachedRedirect | null> {
  // Check cache first
  const cached = redirectCache.get(pathname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  try {
    // Call internal API to check redirect
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/redirects/check?path=${encodeURIComponent(pathname)}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.found) {
        const result: CachedRedirect = {
          to: data.to,
          type: data.type,
          expiresAt: Date.now() + REDIRECT_CACHE_TTL,
        };
        redirectCache.set(pathname, result);
        return result;
      }
    }
  } catch (error) {
    console.error('Redirect check failed:', error);
  }

  // Cache negative result for shorter time
  redirectCache.set(pathname, {
    to: '',
    type: '',
    expiresAt: Date.now() + 60 * 1000, // 1 minute for negative cache
  });

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For non-API routes, check redirects first
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/') && !pathname.includes('.')) {
    const redirect = await checkRedirect(pathname);
    if (redirect && redirect.to) {
      const status = redirect.type === '302' ? 302 : 301;
      const url = request.nextUrl.clone();
      url.pathname = redirect.to;
      return NextResponse.redirect(url, status);
    }
  }

  // Only protect /api/ routes from here on
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

  const role = payload.role;

  // Check RBAC permissions
  if (!checkPermission(role, request.method, pathname)) {
    return NextResponse.json(
      { error: 'Forbidden: insufficient permissions' },
      { status: 403 }
    );
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
  matcher: '/:path*',
};
