"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, GraduationCap, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ParentDashboard() {
  const { data: childrenRes, isLoading } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => api.get('/parents/my-children'),
  });

  const children = (childrenRes as any)?.data || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Parent Dashboard</h2>
        <p className="text-gray-500">Welcome to your portal. Monitor your children's progress here.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
            <p>No children linked to your account yet.</p>
            <p className="text-sm">Please contact the school administration to link your children.</p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-4">My Linked Children</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {children.map((child: any) => (
              <Card key={child._id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold text-gray-900">{child.firstName} {child.lastName}</CardTitle>
                  <GraduationCap className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Class:</span> {child.currentClassId?.name} - {child.currentSectionId?.name}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Roll No:</span> {child.rollNumber}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Admission No:</span> {child.admissionNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/parent/children/${child._id}`}>
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
