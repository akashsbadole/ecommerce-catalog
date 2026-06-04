'use client';

import { useRouter } from 'next/navigation';
import { B2BRegister } from '@/components/admin/B2BRegister';

export default function RegisterPage() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'login') {
      router.push('/admin');
    }
  };

  return <B2BRegister onNavigate={handleNavigate} />;
}
