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
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Redirect to login if not authenticated
    if (!accessToken || !user) {
      router.push('/login');
    }
  }, [accessToken, user, router]);

  // Prevent hydration mismatch and flash of protected content
  if (!mounted) {
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
