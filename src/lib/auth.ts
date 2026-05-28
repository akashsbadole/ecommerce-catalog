import { SignJWT, jwtVerify } from 'jose';
import { compare, hash } from 'bcryptjs';
import { db } from './db';

export { compare, hash };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Generate one with: openssl rand -hex 32');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateToken(user: { id: string; email: string; role: string }): Promise<string> {
  return new SignJWT({ userId: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string } | null> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;

  const isValid = await compare(password, user.password);
  if (!isValid) return null;

  const token = await generateToken({ id: user.id, email: user.email, role: user.role });
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
}
