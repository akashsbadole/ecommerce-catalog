/**
 * Admin fetch utilities for authenticated API calls.
 *
 * All admin components should use `adminFetch()` which automatically
 * attaches the JWT Bearer token from localStorage.
 */

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  // Try to get from Zustand storage first (new way)
  try {
    const storage = localStorage.getItem('app-storage');
    if (storage) {
      const parsed = JSON.parse(storage);
      const token = parsed.state?.adminToken;
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    console.error('Error parsing app-storage', e);
  }

  // Fallback to old way
  const token = localStorage.getItem('admin_token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);

  if (typeof window !== 'undefined') {
    const authHeaders = getAuthHeaders();
    if (authHeaders.Authorization) {
      headers.set('Authorization', authHeaders.Authorization);
    }
  }

  return fetch(url, { ...options, headers });
}

/** @deprecated Use adminFetch instead */
export const authFetch = adminFetch;
