import { compare, hash } from 'bcryptjs';
import { SignJWT } from 'jose';
import { db } from './db';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findFirst({
    where: { OR: [{ id }, { clerkId: id }] },
    include: { Company: true },
  });
  if (!user || !user.isActive) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

async function getJwtSecret(): Promise<Uint8Array> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

export { compare, hash };

export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: string } | null> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password) return null;

  const valid = await compare(password, user.password);
  if (!valid) return null;

  const secret = await getJwtSecret();
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(secret);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
}
