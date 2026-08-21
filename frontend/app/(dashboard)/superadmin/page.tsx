"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import ReviewRequestModal from '@/components/shared/ReviewRequestModal';

export default function SuperadminDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => api.get('/saas/admin/requests')
  });

  const requests: any[] = (response as any)?.data || [];

  const pendingRequests = requests.filter((r: any) => r.status === 'PENDING_APPROVAL');
  const activeRequests = requests.filter((r: any) => r.status === 'ACTIVE');

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-danger p-4 bg-red-50 rounded-lg">Failed to load requests.</div>;
  }

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Platform Overview</h2>
        <p className="text-gray-500">Manage tenant subscriptions and school onboarding.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Active Schools</p>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <div className="text-3xl font-bold">{activeRequests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <span className="text-lg font-bold text-gray-400">रू</span>
            </div>
            <div className="text-3xl font-bold">
              {activeRequests.reduce((sum: number, req: any) => sum + (req.amountNPR || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subscription Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">School Name</th>
                  <th scope="col" className="px-6 py-3">Plan</th>
                  <th scope="col" className="px-6 py-3">Amount (NPR)</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No subscription requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((request: any) => (
                    <tr key={request._id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {request.schoolId?.name || 'Unknown School'}
                      </td>
                      <td className="px-6 py-4">
                        {request.planId?.name} ({request.billingCycle})
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        {request.amountNPR.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedRequest(request)}
                          className="flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" /> Review
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ReviewRequestModal 
        isOpen={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
        request={selectedRequest} 
      />
      
    </div>
  );
}
