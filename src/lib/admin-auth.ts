/**
 * Admin authentication middleware for API routes.
 * Extracts and verifies Bearer token, returns admin payload or error response.
 */

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

export interface AdminPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export type AdminAuthResult = 
  | { success: true; payload: AdminPayload }
  | { success: false; response: NextResponse };

export type AuthResult = 
  | { success: true; payload: AuthPayload }
  | { success: false; response: NextResponse };

/**
 * Verify admin authentication from Bearer token.
 * Returns the admin payload if valid, or a NextResponse error if not.
 */
export async function requireAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload || !['admin', 'editor'].includes(payload.role)) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { success: true, payload: payload as unknown as AdminPayload };
}

/**
 * Verify user authentication from Bearer token (any authenticated user).
 * Returns the user payload if valid, or a NextResponse error if not.
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    success: true,
    payload: {
      userId: payload.userId || (payload as any).id,
      email: payload.email || '',
      role: payload.role || 'customer',
    },
  };
}
