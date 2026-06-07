import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-edge';
import { db } from '@/lib/db';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return { user: null, token: null };

  const payload = await verifyToken(token);
  if (!payload) return { user: null, token: null };

  const dbUser = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!dbUser) return { user: null, token: null };

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role || payload.role,
    },
    token,
  };
}

export default async function AdminPage() {
  const { user, token } = await getServerAuth();

  return <AdminClient initialUser={user} initialToken={token} />;
}