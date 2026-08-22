"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function MyChildrenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Children</h2>
        <p className="text-gray-500">View academic progress, attendance, and reports for your children.</p>
      </div>

      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            We are currently linking student profiles to your parent account. Please check back later!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
