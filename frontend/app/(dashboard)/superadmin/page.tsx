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
  CreditCard, Users, AlertTriangle, Globe, ArrowUpRight, Sparkles, Server
} from 'lucide-react';
import ReviewRequestModal from '@/components/shared/ReviewRequestModal';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { format } from 'date-fns';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function SuperadminDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => api.get('/saas/admin/requests')
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-primary" />
          <p className="text-slate-500 font-medium">Loading platform metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center max-w-md mx-auto mt-20">
        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold">Failed to load platform data</h3>
        <p className="text-sm mt-1">Please check your connection or try again later.</p>
      </div>
    );
  }

  const requests: any[] = (response as any)?.data || [];

  const pendingRequests = requests.filter((r: any) => r.status === 'PENDING_APPROVAL');
  const activeRequests = requests.filter((r: any) => r.status === 'ACTIVE');
  const rejectedRequests = requests.filter((r: any) => r.status === 'REJECTED');
  const totalRevenue = activeRequests.reduce((sum: number, req: any) => sum + (req.amountNPR || 0), 0);

  const pieData = [
    { name: 'Active', value: activeRequests.length },
    { name: 'Pending', value: pendingRequests.length },
    { name: 'Rejected', value: rejectedRequests.length },
  ].filter(d => d.value > 0);

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
        return <Badge variant="warning" className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1 inline" /> Pending</Badge>;
      case 'ACTIVE':
        return <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="w-3 h-3 mr-1 inline" /> Active</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1 inline" /> Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Platform Operations <Server className="h-6 w-6 text-indigo-500" />
          </h2>
          <p className="text-slate-500 mt-1">Global monitoring of SchoolOS multi-tenant infrastructure.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/superadmin/schools">
            <Button variant="outline" size="sm" className="h-10 rounded-xl font-semibold border-slate-200 text-slate-700">
              <School className="h-4 w-4 mr-2" /> All Tenants
            </Button>
          </Link>
          <Link href="/superadmin/plans">
            <Button size="sm" className="h-10 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200">
              <Globe className="h-4 w-4 mr-2" /> SaaS Plans
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={containerVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Active Schools', val: activeRequests.length, icon: School, color: 'text-emerald-600', bg: 'bg-emerald-100', accent: 'bg-emerald-50' },
          { title: 'Pending Approvals', val: pendingRequests.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', accent: 'bg-amber-50', urgent: pendingRequests.length > 0 },
          { title: 'Total Revenue', val: `रू ${totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100', accent: 'bg-blue-50' },
          { title: 'Total Submissions', val: requests.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', accent: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className={`border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden group rounded-3xl h-full ${stat.urgent ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.accent} rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
              <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  {stat.urgent && (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-5">

        {/* Bar Chart — Monthly signups */}
        <motion.div variants={itemVariants} className="md:col-span-3">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden h-full">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                Growth Trajectory
              </CardTitle>
              <CardDescription className="mt-2 text-slate-500">Platform registrations over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 8, 8]} name="New Tenants" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart — Status distribution */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-emerald-500">
                  <Globe className="h-5 w-5" />
                </div>
                Health Check
              </CardTitle>
              <CardDescription className="mt-2 text-slate-500">Distribution of application statuses</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
              {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Globe className="h-12 w-12 text-slate-200" />
                  <span className="font-medium text-sm">No data available</span>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-4 mt-4 w-full justify-center flex-wrap">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-xs font-bold text-slate-700">{d.name} <span className="text-slate-400 ml-1">({d.value})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Pending Approvals Priority Section */}
      <AnimatePresence>
        {pendingRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-amber-200 shadow-md shadow-amber-100/50 rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-amber-50 border-b border-amber-100 p-6">
                <div>
                  <CardTitle className="text-xl font-bold text-amber-900 flex items-center gap-2">
                    <Clock className="h-6 w-6 text-amber-600" />
                    Action Required: Pending Approvals
                    <Badge className="bg-amber-500 text-white hover:bg-amber-600 ml-2">{pendingRequests.length}</Badge>
                  </CardTitle>
                  <CardDescription className="text-amber-700/80 mt-1 font-medium">These institutions are waiting for verification and activation.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-amber-900/60 uppercase bg-amber-50/50">
                    <tr>
                      <th className="px-6 py-4 font-bold">Institution Name</th>
                      <th className="px-6 py-4 font-bold">SaaS Plan</th>
                      <th className="px-6 py-4 font-bold text-right">Amount (NPR)</th>
                      <th className="px-6 py-4 font-bold">Submitted Date</th>
                      <th className="px-6 py-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/50">
                    {pendingRequests.map((req: any) => (
                      <tr key={req._id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                          <div className="h-8 w-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                            <School className="h-4 w-4" />
                          </div>
                          {req.schoolId?.name || 'Unknown School'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {req.planId?.name} <span className="text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded ml-1">{req.billingCycle}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-amber-600">
                          रू {req.amountNPR?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {format(new Date(req.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" onClick={() => setSelectedRequest(req)} className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm">
                            <Eye className="w-4 h-4 mr-1.5" /> Review Application
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
      </AnimatePresence>

      {/* All Requests Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 border-b border-slate-50 p-6 gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Global Registry</CardTitle>
              <CardDescription className="mt-1 text-slate-500">Complete historical log of all tenant operations.</CardDescription>
            </div>
            <Link href="/superadmin/schools">
              <Button variant="outline" size="sm" className="rounded-xl font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
                View All Tenants <ArrowUpRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <School className="h-10 w-10 text-slate-300" />
                </div>
                <p className="font-bold text-slate-600 text-lg">No records found</p>
                <p className="text-sm mt-1">When schools register, they will appear here.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Institution</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Selected Plan</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Value (NPR)</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.map((request: any) => (
                    <tr key={request._id} className="bg-white hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {request.schoolId?.name || 'Unknown School'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {request.planId?.name} <span className="text-slate-400 text-xs bg-white border border-slate-100 px-2 py-0.5 rounded ml-1 shadow-sm">{request.billingCycle}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        रू {request.amountNPR?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {format(new Date(request.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                          className="font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> Details
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
    </motion.div>
  );
}
