import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

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
  '/api/health',
  '/api/dashboard',
  '/api/admin',
  '/api/enquiries',
  '/api/activity-logs',
  '/api/notifications',
  '/api/users',
  '/api/export',
  '/api/newsletter',
];

// Public POST endpoints
const PUBLIC_POST_PATHS = [
  '/api/enquiries',
  '/api/contact',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/change-password',
  '/api/auth/register',
  '/api/newsletter/subscribe',
  '/api/content-pages/seed',
];

// User-authenticated GET endpoints (require Bearer token, not admin RBAC)
const USER_AUTH_GET_PREFIXES = [
  '/api/cart',
  '/api/wishlist',
  '/api/orders',
  '/api/account',
];

// User-authenticated POST/PUT/DELETE endpoints
const USER_AUTH_MUTATION_PREFIXES = [
  '/api/cart',
  '/api/wishlist',
  '/api/orders',
  '/api/account',
];

// Role-based permission map
const ROLE_PERMISSIONS: Record<string, {
  read: string[];
  write: string[];
}> = {
  admin: {
    read: ['*'],
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
      '/api/upload',
      '/api/redirects',
      '/api/notifications',
      '/api/activity-logs',
    ],
    write: [
      '/api/enquiries',
      '/api/notifications',
      '/api/upload',
    ],
  },
};

// In-memory redirect cache with TTL (Edge-compatible)
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

async function checkRedirect(pathname: string, request: NextRequest): Promise<CachedRedirect | null> {
  // Check cache first
  const cached = redirectCache.get(pathname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.to ? cached : null;
  }

  try {
    // Fetch redirect check API (runs on Node.js runtime, not Edge)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${request.nextUrl.port || 3000}`;
    const checkUrl = `${baseUrl}/api/redirects/check?path=${encodeURIComponent(pathname)}`;
    const res = await fetch(checkUrl, {
      headers: { 'x-internal-request': 'true' },
      signal: AbortSignal.timeout(2000), // 2s timeout to avoid hanging
    });

    if (res.ok) {
      const data = await res.json();
      if (data.found && data.to) {
        const result: CachedRedirect = {
          to: data.to,
          type: data.type || '301',
          expiresAt: Date.now() + REDIRECT_CACHE_TTL,
        };
        redirectCache.set(pathname, result);
        return result;
      }
    }
  } catch {
    // Silently fail - don't block the request if redirect check fails
  }

  // Cache negative result for shorter time
  redirectCache.set(pathname, {
    to: '',
    type: '',
    expiresAt: Date.now() + 60 * 1000,
  });

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For non-API routes, check redirects first
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/') && !pathname.startsWith('/_proxy/') && !pathname.includes('.')) {
    const redirect = await checkRedirect(pathname, request);
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

  // Check user-authenticated endpoints (cart, wishlist, orders, account)
  // These require a valid token but not admin RBAC
  const isUserAuthGet = request.method === 'GET' && USER_AUTH_GET_PREFIXES.some(p => pathname.startsWith(p));
  const isUserAuthMutation = (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') && USER_AUTH_MUTATION_PREFIXES.some(p => pathname.startsWith(p));

  if (isUserAuthGet || isUserAuthMutation) {
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
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Check authorization
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  if (!payload) {
    console.log('Middleware: Invalid token', token);
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
