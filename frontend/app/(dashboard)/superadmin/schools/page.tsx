"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Building2, Mail, Phone, Calendar } from 'lucide-react';

export default function SuperadminSchoolsPage() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.get('/saas/admin/tenants')
  });

  const schools: any[] = (response as any)?.data || [];

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;
  if (error) return <div className="text-danger p-4 bg-red-50 rounded-lg">Failed to load schools.</div>;

  const StatusBadge = ({ status }: { status: string }) => {
    const getStyle = () => {
      switch (status) {
        case 'ACTIVE': return 'bg-green-100 text-green-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'SUSPENDED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyle()}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Schools (Tenants)</h2>
        <p className="text-gray-500">View and manage all registered schools on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schools</CardTitle>
          <CardDescription>Master list of all schools using SchoolOS.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {schools.length === 0 ? (
              <div className="col-span-full py-8 text-center text-gray-500 border rounded-lg border-dashed">
                No schools found on the platform yet.
              </div>
            ) : (
              schools.map((school) => (
                <div key={school._id} className="border rounded-lg p-5 flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1" title={school.name}>{school.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">Code: {school.code}</p>
                      </div>
                    </div>
                    <StatusBadge status={school.subscriptionStatus} />
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{school.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{school.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Joined: {new Date(school.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
