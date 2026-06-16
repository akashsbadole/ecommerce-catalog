import { db } from './db';

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
    tier: user.tier,
    isVerified: user.isVerified,
    companyId: user.companyId,
    companyName: user.Company?.name,
    taxId: user.Company?.taxId,
    businessAddress: user.Company?.address,
  };
}
