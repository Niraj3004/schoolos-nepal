"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { 
  CheckCircle, XCircle, Clock, Eye, School, TrendingUp, 
  CreditCard, Users, AlertTriangle, Globe, ArrowUpRight
} from 'lucide-react';
import ReviewRequestModal from '@/components/shared/ReviewRequestModal';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

export default function SuperadminDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => api.get('/saas/admin/requests')
  });

  const requests: any[] = (response as any)?.data || [];

  const pendingRequests = requests.filter((r: any) => r.status === 'PENDING_APPROVAL');
  const activeRequests = requests.filter((r: any) => r.status === 'ACTIVE');
  const rejectedRequests = requests.filter((r: any) => r.status === 'REJECTED');
  const totalRevenue = activeRequests.reduce((sum: number, req: any) => sum + (req.amountNPR || 0), 0);

  // Chart data — subscription status distribution
  const pieData = [
    { name: 'Active', value: activeRequests.length },
    { name: 'Pending', value: pendingRequests.length },
    { name: 'Rejected', value: rejectedRequests.length },
  ].filter(d => d.value > 0);

  // Bar chart — monthly signups (last 6 months)
  const getMonthLabel = (offset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - offset);
    return d.toLocaleString('default', { month: 'short' });
  };
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = requests.filter(r => r.createdAt?.startsWith(monthStr)).length;
    return { month: getMonthLabel(5 - i), count };
  });

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1 inline" /> Pending</Badge>;
      case 'ACTIVE':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1 inline" /> Active</Badge>;
      case 'REJECTED':
        return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1 inline" /> Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
        <AlertTriangle className="h-5 w-5" /> Failed to load platform data.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Platform Overview</h2>
          <p className="text-gray-500 mt-1">Monitor school subscriptions, revenue, and onboarding across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/superadmin/schools">
            <Button variant="outline" size="sm">
              <School className="h-4 w-4 mr-2" /> All Schools
            </Button>
          </Link>
          <Link href="/superadmin/plans">
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" /> Manage Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Active Schools', val: activeRequests.length, icon: School, color: 'text-emerald-600', bg: 'bg-emerald-50', delta: '+' + activeRequests.length },
          { title: 'Pending Approvals', val: pendingRequests.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', urgent: pendingRequests.length > 0 },
          { title: 'Total Revenue', val: `रू ${totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Total Submissions', val: requests.length, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={stat.urgent ? 'border-amber-300 shadow-amber-100 shadow-md' : ''}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {stat.urgent && (
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{stat.val}</div>
                <p className="text-sm text-slate-500">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-5">

        {/* Bar Chart — Monthly signups */}
        <motion.div className="md:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Monthly Signups (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Registrations" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart — Status distribution */}
        <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {pieData.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No data yet</div>
              ) : (
                <>
                  <PieChart width={160} height={160}>
                    <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                  <div className="flex flex-col gap-1.5 mt-2 w-full">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-slate-600">{d.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Approvals Priority Section */}
      {pendingRequests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-amber-50 rounded-t-xl">
              <div>
                <CardTitle className="text-base font-semibold text-amber-800 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Pending Approvals ({pendingRequests.length})
                </CardTitle>
                <CardDescription className="text-amber-600 text-xs mt-0.5">These schools are waiting for your review.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">School Name</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3 text-right">Amount (NPR)</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.map((req: any) => (
                    <tr key={req._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{req.schoolId?.name || 'Unknown School'}</td>
                      <td className="px-4 py-3 text-slate-600">{req.planId?.name} ({req.billingCycle})</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">रू {req.amountNPR?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" onClick={() => setSelectedRequest(req)}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* All Requests Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>All Subscription Requests</CardTitle>
              <CardDescription>Complete history of school subscription activity.</CardDescription>
            </div>
            <Link href="/superadmin/schools">
              <Button variant="outline" size="sm">
                <ArrowUpRight className="h-4 w-4 mr-1.5" /> All Schools
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <School className="h-12 w-12 mb-3 opacity-40" />
                <p className="font-medium">No subscription requests yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3">School Name</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3 text-right">Amount (NPR)</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((request: any) => (
                    <tr key={request._id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {request.schoolId?.name || 'Unknown School'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {request.planId?.name} ({request.billingCycle})
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-primary">
                        रू {request.amountNPR?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <ReviewRequestModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
}
