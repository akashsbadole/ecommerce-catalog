/**
 * Admin fetch utilities for authenticated API calls.
 *
 * All admin components should use `adminFetch()` which automatically
 * attaches the JWT Bearer token from localStorage.
 *
 * Usage:
 *   const res = await adminFetch('/api/products', { method: 'POST', body: ... });
 *   const data = await res.json();
 */

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('admin_token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(url, { ...options, headers });
}

/** @deprecated Use adminFetch instead */
export const authFetch = adminFetch;
