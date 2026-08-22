"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Spinner } from '@/components/ui/Spinner';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait until Zustand has hydrated from localStorage
    if (!_hasHydrated) return;
    
    // Redirect to login if not authenticated
    if (!accessToken || !user) {
      router.push('/login');
    }
  }, [accessToken, user, router, _hasHydrated]);

  // Prevent hydration mismatch and flash of protected content while Zustand loads
  if (!_hasHydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!accessToken || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
