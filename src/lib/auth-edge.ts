import { jwtVerify } from 'jose';

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

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
