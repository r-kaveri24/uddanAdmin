'use client';

import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    // Clear storage/tokens
    localStorage.clear();
    sessionStorage.clear();

    // Next.js client-side redirect to login page
    router.push('/login');
  };

  return logout;
};