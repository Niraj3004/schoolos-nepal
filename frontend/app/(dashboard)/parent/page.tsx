"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users, GraduationCap, ArrowRight, CheckCircle2, XCircle,
  Calendar, CreditCard, BookOpen, TrendingUp, Bell
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function ChildCard({ child }: { child: any }) {
  const { data: attendanceRes, isLoading: attLoading } = useQuery({
    queryKey: ['child-attendance', child._id],
    queryFn: () => api.get(`/attendance/student/${child._id}`),
  });
  const records = (attendanceRes as any)?.data || [];
  const presentCount = records.filter((r: any) => r.status === 'PRESENT').length;
  const totalDays = records.length;
  const attendancePct = totalDays === 0 ? 0 : Math.round((presentCount / totalDays) * 100);

  const { data: feesRes } = useQuery({
    queryKey: ['child-fees', child._id],
    queryFn: () => api.get(`/finance/invoices?studentId=${child._id}&limit=1`),
  });
  const feeInvoice = (feesRes as any)?.data?.invoices?.[0];
  const pendingFee = feeInvoice ? (feeInvoice.totalPayable - feeInvoice.paidAmount) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="hover:shadow-lg transition-shadow border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow">
                {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-base text-slate-900">{child.firstName} {child.lastName}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {child.currentClassId?.name} – {child.currentSectionId?.name} &nbsp;•&nbsp; Roll #{child.rollNumber}
                </p>
              </div>
            </div>
            <Badge variant={child.status === 'ENROLLED' ? 'success' : 'default'} className="text-xs">
              {child.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              {attLoading ? <Spinner size="sm" /> : (
                <>
                  <div className={`text-xl font-bold ${attendancePct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {attendancePct}%
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Attendance</div>
                </>
              )}
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{presentCount}</div>
              <div className="text-xs text-slate-500 mt-0.5">Days Present</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              {pendingFee !== null ? (
                <>
                  <div className={`text-xl font-bold ${pendingFee > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {pendingFee > 0 ? `रू ${pendingFee.toLocaleString()}` : 'Paid'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Fee Due</div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-slate-400">—</div>
                  <div className="text-xs text-slate-500 mt-0.5">Fee Due</div>
                </>
              )}
            </div>
          </div>

          {/* Attendance bar */}
          {!attLoading && totalDays > 0 && (
            <div className="mb-4">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${attendancePct >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
              {attendancePct < 75 && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Attendance below 75% — needs improvement
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link href={`/parent/children/${child._id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <GraduationCap className="h-4 w-4 mr-1.5" />
                View Details
              </Button>
            </Link>
            <Link href="/parent/fees" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <CreditCard className="h-4 w-4 mr-1.5" />
                View Fees
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ParentDashboard() {
  const { data: childrenRes, isLoading } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => api.get('/parents/my-children'),
  });

  const children = (childrenRes as any)?.data || [];

  const { data: noticesRes } = useQuery({
    queryKey: ['notices'],
    queryFn: () => api.get('/communication/notices?limit=3'),
  });
  const notices = (noticesRes as any)?.data?.notices || (noticesRes as any)?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Parent Dashboard</h2>
        <p className="text-gray-500 mt-1">Monitor your children's academic progress, attendance, and fees.</p>
      </div>

      {/* Summary stats */}
      {!isLoading && children.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Children', val: children.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Enrolled', val: children.filter((c: any) => c.status === 'ENROLLED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'New Notices', val: notices.length, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Quick Links', val: '—', icon: ArrowRight, color: 'text-slate-500', bg: 'bg-slate-50' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{s.val}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Children cards */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
            <p className="font-medium">No children linked to your account yet.</p>
            <p className="text-sm mt-1">Please contact the school administration.</p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            My Children
          </h3>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {children.map((child: any) => (
              <ChildCard key={child._id} child={child} />
            ))}
          </div>
        </div>
      )}

      {/* Notices */}
      {notices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                School Notices
              </CardTitle>
              <Link href="/notices" className="text-xs text-primary hover:underline">View All →</Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {notices.slice(0, 3).map((notice: any) => (
                  <div key={notice._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-medium text-slate-800 text-sm">{notice.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notice.message || notice.body}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(notice.createdAt).toLocaleDateString('en-NP')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'My Children', href: '/parent/children', icon: Users },
            { label: 'Fee Payments', href: '/parent/fees', icon: CreditCard },
            { label: 'Notice Board', href: '/notices', icon: Bell },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                <link.icon className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-slate-700">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
