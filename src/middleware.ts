import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/me',
  '/api/redirects/check',
  '/api/stores', // Allow store listing/creation
];

// Public GET endpoints (no auth needed)
const PUBLIC_GET_PREFIXES = [
  '/api/products',
  '/api/categories',
  '/api/banners',
  '/api/seo',
  '/api/content-pages',
  '/api/blog',
  '/api/health',
  '/api/stores',
];

// Public POST endpoints
const PUBLIC_POST_PATHS = [
  '/api/enquiries',
  '/api/contact',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/register',
  '/api/newsletter/subscribe',
  '/api/stores', // Allow store creation
];

// User-authenticated GET endpoints (require Bearer token, not admin RBAC)
const USER_AUTH_GET_PREFIXES = [
  '/api/cart',
  '/api/wishlist',
  '/api/orders',
  '/api/account',
  '/api/quotes',
  '/api/stores',
];

// User-authenticated mutation endpoints
const USER_AUTH_MUTATION_PREFIXES = [
  '/api/cart',
  '/api/wishlist',
  '/api/orders',
  '/api/account',
  '/api/quotes',
  '/api/stores',
  '/api/auth/change-password',
];

// Platform admin paths (no store context needed)
const PLATFORM_ADMIN_PREFIXES = [
  '/api/admin',
];

// ─── Store Resolution (Edge-compatible, in-memory cache) ───

interface CachedStore {
  id: string;
  slug: string;
  expiresAt: number;
}

const storeCache = new Map<string, CachedStore>();
const STORE_CACHE_TTL = 5 * 60 * 1000;

const PLATFORM_DOMAINS = [
  process.env.PLATFORM_DOMAIN || 'localhost',
  process.env.PLATFORM_DOMAIN || 'localhost',
];

function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0];
  if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }
  for (const domain of PLATFORM_DOMAINS) {
    if (host.endsWith(`.${domain}`)) {
      const sub = host.replace(`.${domain}`, '');
      return sub || null;
    }
  }
  return null;
}

function isCustomDomain(hostname: string): boolean {
  const host = hostname.split(':')[0];
  if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return false;
  }
  return !PLATFORM_DOMAINS.some((d) => host.endsWith(`.${d}`));
}

async function resolveStoreId(hostname: string): Promise<string | null> {
  const host = hostname.split(':')[0];

  // Check cache
  const cached = storeCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.id;
  }

  let storeId: string | null = null;

  // Try subdomain
  const subdomain = extractSubdomain(hostname);
  if (subdomain) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${3000}`;
      const res = await fetch(`${baseUrl}/api/stores/resolve?slug=${encodeURIComponent(subdomain)}`, {
        headers: { 'x-internal-request': 'true' },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        storeId = data.storeId || null;
      }
    } catch { /* ignore */ }
  }

  // Try custom domain
  if (!storeId && isCustomDomain(hostname)) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${3000}`;
      const res = await fetch(`${baseUrl}/api/stores/resolve?domain=${encodeURIComponent(host)}`, {
        headers: { 'x-internal-request': 'true' },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        storeId = data.storeId || null;
      }
    } catch { /* ignore */ }
  }

  // Cache result
  if (storeId) {
    storeCache.set(host, { id: storeId, slug: subdomain || host, expiresAt: Date.now() + STORE_CACHE_TTL });
  }

  return storeId;
}

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
      '/api/payment/razorpay',
      '/api/import/shopify',
      '/api/import/woocommerce',
      '/api/admin/backup',
      '/api/admin/quotes',
    ],
    write: [
      '/api/enquiries',
      '/api/notifications',
      '/api/upload',
      '/api/payment/razorpay',
      '/api/import/shopify',
      '/api/import/woocommerce',
      '/api/admin/backup',
      '/api/admin/quotes',
    ],
  },
  editor: {
    read: ['*'],
    write: [
      '/api/products',
      '/api/categories',
      '/api/blog',
      '/api/banners',
      '/api/content-pages',
      '/api/media',
      '/api/upload',
      '/api/enquiries',
      '/api/redirects',
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
  const hostname = request.headers.get('host') || '';

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

  // ─── Store Resolution ───
  // Resolve store from hostname for all routes
  const storeId = await resolveStoreId(hostname);

  // Only protect /api/ routes from here on
  if (!pathname.startsWith('/api/')) {
    // For non-API routes, pass storeId along
    const requestHeaders = new Headers(request.headers);
    if (storeId) {
      requestHeaders.set('x-store-id', storeId);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Allow public auth endpoints
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    const requestHeaders = new Headers(request.headers);
    if (storeId) requestHeaders.set('x-store-id', storeId);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Allow public GET endpoints
  if (request.method === 'GET' && PUBLIC_GET_PREFIXES.some(p => pathname.startsWith(p))) {
    const requestHeaders = new Headers(request.headers);
    if (storeId) requestHeaders.set('x-store-id', storeId);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Allow public POST endpoints
  if (request.method === 'POST' && PUBLIC_POST_PATHS.some(p => pathname.startsWith(p))) {
    const requestHeaders = new Headers(request.headers);
    if (storeId) requestHeaders.set('x-store-id', storeId);
    return NextResponse.next({ request: { headers: requestHeaders } });
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
    if (storeId) requestHeaders.set('x-store-id', storeId);
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
    console.log('Middleware: Invalid token');
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
  if (storeId) requestHeaders.set('x-store-id', storeId);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: '/:path*',
};
