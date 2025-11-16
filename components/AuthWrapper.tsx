'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PasswordGate } from './PasswordGate';
import { ReactNode } from 'react';

export function AuthWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <PasswordGate />;
  }

  return <>{children}</>;
}

