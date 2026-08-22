"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import {
  Users, GraduationCap, ArrowRight, CheckCircle2, XCircle,
  Calendar, CreditCard, BookOpen, TrendingUp, Bell, Sparkles, AlertCircle, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

function ChildCard({ child }: { child: any }) {
  const { data: attendanceRes, isLoading: attLoading } = useQuery({
    queryKey: ['child-attendance', child._id],
    queryFn: () => api.get(`/attendance/student/${child._id}`),
  });
  const attData = (attendanceRes as any)?.data || { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0 };
  const pct = Math.round(Number(attData.percentage || 0));

  const { data: feesRes, isLoading: feeLoading } = useQuery({
    queryKey: ['child-fees', child._id],
    queryFn: () => api.get(`/finance/invoices?studentId=${child._id}&limit=1`),
  });
  const feeInvoice = (feesRes as any)?.data?.invoices?.[0];
  const pendingFee = feeInvoice ? (feeInvoice.totalPayable - feeInvoice.paidAmount) : null;

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow border-slate-100 rounded-3xl relative overflow-hidden group bg-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        <CardHeader className="pb-4 relative z-10 border-b border-slate-50/50 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-sm group-hover:scale-105 transition-transform">
                {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">{child.firstName} {child.lastName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" className="bg-white border-slate-200 text-slate-600 shadow-sm text-xs py-0">
                    {child.currentClassId?.name} - {child.currentSectionId?.name}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400">Roll: {child.rollNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 flex-1 flex flex-col justify-between relative z-10">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`rounded-2xl p-4 text-center border transition-colors ${pct >= 75 ? 'bg-emerald-50/50 border-emerald-100 group-hover:bg-emerald-50' : 'bg-red-50/50 border-red-100 group-hover:bg-red-50'}`}>
              {attLoading ? <Spinner size="sm" className="mx-auto" /> : (
                <>
                  <div className={`text-2xl font-black mb-1 ${pct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {pct}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attendance</div>
                </>
              )}
            </div>
            <div className="bg-blue-50/50 border border-blue-100 group-hover:bg-blue-50 transition-colors rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-blue-600 mb-1">{attData.presentDays}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Days Present</div>
            </div>
            <div className={`rounded-2xl p-4 text-center border transition-colors ${pendingFee !== null && pendingFee > 0 ? 'bg-amber-50/50 border-amber-100 group-hover:bg-amber-50' : 'bg-slate-50/50 border-slate-100 group-hover:bg-slate-50'}`}>
              {feeLoading ? <Spinner size="sm" className="mx-auto" /> : (
                <>
                  {pendingFee !== null ? (
                    <>
                      <div className={`text-xl font-black mb-1 ${pendingFee > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {pendingFee > 0 ? `रू ${(pendingFee/1000).toFixed(1)}k` : 'Paid'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fee Due</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-black text-slate-400 mb-1">—</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fee Due</div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {!attLoading && attData.totalDays > 0 && (
              <div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${pct >= 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct < 75 && (
                  <p className="text-[11px] font-semibold text-red-500 mt-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <XCircle className="h-3.5 w-3.5" /> Below required attendance
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link href={`/parent/children/${child._id}`} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Academics
                </Button>
              </Link>
              <Link href="/parent/fees" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Finances
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ParentDashboard() {
  const { user } = useAuthStore();
  
  const { data: childrenRes, isLoading: childrenLoading } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => api.get('/parents/my-children'),
  });

  const children = (childrenRes as any)?.data || [];

  const { data: noticesRes } = useQuery({
    queryKey: ['notices'],
    queryFn: () => api.get('/communication/notices?limit=3'),
  });
  const notices = (noticesRes as any)?.data?.notices || (noticesRes as any)?.data || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (childrenLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-primary" />
          <p className="text-slate-500 font-medium">Loading your family dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-12">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">{greeting()}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            {user?.email?.split('@')[0] || 'Parent'} <Sparkles className="h-6 w-6 text-amber-400" />
          </h2>
          <p className="text-slate-500 mt-1">Monitor your children's academic progress, attendance, and fee statuses.</p>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'My Children', val: children.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', accent: 'bg-blue-50' },
          { label: 'Active Enrollment', val: children.filter((c: any) => c.status === 'ENROLLED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', accent: 'bg-emerald-50' },
          { label: 'School Notices', val: notices.length, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-100', accent: 'bg-amber-50' },
          { label: 'Pending Fees', val: 'Check', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100', accent: 'bg-purple-50' },
        ].map((s, i) => (
          <motion.div key={s.label} variants={itemVariants}>
            <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group rounded-3xl h-full relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 ${s.accent} rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
              <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div className="h-8 w-8 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{s.val}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Children Grid */}
        <div className="md:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Registered Wards</h3>
          </motion.div>

          {children.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="border border-slate-100 shadow-sm rounded-3xl">
                <CardContent className="p-16 text-center text-slate-500">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="text-xl font-bold text-slate-700 mb-2">No children linked yet</p>
                  <p className="text-sm max-w-sm mx-auto">Your account is not linked to any student profiles. Please contact the school administration to link your children.</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="grid gap-6 sm:grid-cols-2">
              {children.map((child: any) => (
                <ChildCard key={child._id} child={child} />
              ))}
            </motion.div>
          )}
        </div>

        {/* Notices Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-amber-500 relative">
                      <Bell className="h-5 w-5" />
                      {notices.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 bg-amber-500 rounded-full animate-pulse"></span>}
                    </div>
                    Notice Board
                  </CardTitle>
                </div>
                <Link href="/notices">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg font-semibold">
                    All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {notices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <Bell className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium">No new announcements.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notices.slice(0, 4).map((notice: any) => (
                      <div key={notice._id} className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer">
                        <p className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">{notice.title}</p>
                        <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{notice.message || notice.body}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3">
                          {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Fee Payments', href: '/parent/fees', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100' },
                { label: 'Exams', href: '#', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-3xl hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group h-full">
                    <div className={`h-12 w-12 rounded-2xl ${link.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <link.icon className={`h-5 w-5 ${link.color}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{link.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
