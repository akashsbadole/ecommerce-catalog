import { SignJWT, jwtVerify } from 'jose';
import { compare, hash } from 'bcryptjs';
import { db } from './db';

export { compare, hash };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tier?: string;
  isVerified?: boolean;
  companyId?: string | null;
  companyName?: string | null;
  taxId?: string | null;
  businessAddress?: string | null;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

let _jwtSecret: Uint8Array | null = null;
let _lastEnvValue: string | undefined;

function getJwtSecret(): Uint8Array {
  const currentEnv = process.env.JWT_SECRET;
  if (_jwtSecret && _lastEnvValue !== currentEnv) {
    _jwtSecret = null;
  }
  _lastEnvValue = currentEnv;

  if (!_jwtSecret) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set. Generate one with: openssl rand -hex 32');
    }
    _jwtSecret = new TextEncoder().encode(secret);
  }
  return _jwtSecret;
}

export async function generateToken(user: { id: string; email: string; role: string }): Promise<string> {
  return new SignJWT({ userId: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { id },
    include: { Company: true },
  });
  if (!user || !user.isActive) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tier: user.tier,
    isVerified: user.isVerified,
    companyId: user.companyId,
    companyName: user.Company?.name,
    taxId: user.Company?.taxId,
    businessAddress: user.Company?.address,
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string } | null> {
  const user = await db.user.findUnique({
    where: { email },
    include: { Company: true },
  });
  if (!user || !user.isActive) return null;

  const isValid = await compare(password, user.password);
  if (!isValid) return null;

  const token = await generateToken({ id: user.id, email: user.email, role: user.role });
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tier: user.tier,
      isVerified: user.isVerified,
      companyId: user.companyId,
      companyName: user.Company?.name,
      taxId: user.Company?.taxId,
      businessAddress: user.Company?.address,
    },
    token,
  };
}
