import { verifyToken } from '@/lib/auth-edge';
import { NextRequest } from 'next/server';

export async function resolveUserId(request: NextRequest | Request): Promise<string | null> {
  const userIdHeader = (request as NextRequest).headers?.get?.('x-user-id');
  if (userIdHeader) return userIdHeader;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}
