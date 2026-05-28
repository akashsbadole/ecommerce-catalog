import { compare } from 'bcryptjs';
import { db } from './db';

export { compare };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Simple token-based auth helper.
 * In production, replace with proper JWT.
 */
export function generateToken(userId: string): string {
  return `mock-token-${userId}`;
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string } | null> {
  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    return null;
  }

  const token = generateToken(user.id);
  const { id, name, role } = user;

  return { user: { id, email: user.email, name, role }, token };
}
