/**
 * adminFetch - A wrapper around fetch() that automatically includes
 * the JWT Bearer token from localStorage for admin API calls.
 *
 * Usage:
 *   const res = await adminFetch('/api/products', { method: 'POST', body: ... });
 *   const data = await res.json();
 */
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
