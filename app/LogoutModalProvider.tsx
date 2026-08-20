'use client';

import { useState, useEffect } from 'react';
import LogoutModal from './LogoutModal';
import { useLogout } from '@/lib/auth';

export default function LogoutModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const logout = useLogout();

  useEffect(() => {
    const handleOpenModal = () => setShowLogoutModal(true);
    window.addEventListener('open-logout-modal', handleOpenModal);

    return () => window.removeEventListener('open-logout-modal', handleOpenModal);
  }, []);

  return (
    <>
      {children}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </>
  );
}