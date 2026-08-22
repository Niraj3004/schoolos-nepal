"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users, GraduationCap, ArrowRight, CheckCircle2, XCircle,
  AlertCircle, Calendar, CreditCard, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function ChildCard({ child, index }: { child: any; index: number }) {
  const { data: attendanceRes, isLoading: attLoading } = useQuery({
    queryKey: ['child-att', child._id],
    queryFn: () => api.get(`/attendance/student/${child._id}`),
  });
  const records = (attendanceRes as any)?.data || [];
  const presentCount = records.filter((r: any) => r.status === 'PRESENT').length;
  const totalDays = records.length;
  const pct = totalDays === 0 ? 0 : Math.round((presentCount / totalDays) * 100);

  const statColor = pct >= 75 ? 'text-emerald-600' : 'text-red-500';
  const barColor = pct >= 75 ? 'bg-emerald-500' : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-all border-slate-200 overflow-hidden">
        {/* Top color strip */}
        <div className={`h-1.5 w-full ${pct >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`} />

        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
              {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base text-slate-900 truncate">
                {child.firstName} {child.lastName}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Class {child.currentClassId?.name} – {child.currentSectionId?.name} &nbsp;|&nbsp; Roll #{child.rollNumber}
              </p>
            </div>
            <Badge variant={child.status === 'ENROLLED' ? 'success' : 'default'} className="text-xs shrink-0">
              {child.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Attendance Bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500 font-medium">Attendance</span>
              {attLoading ? (
                <Spinner size="sm" />
              ) : (
                <span className={`text-xs font-bold ${statColor}`}>{pct}%</span>
              )}
            </div>
            {!attLoading && (
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            )}
            {!attLoading && pct < 75 && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <XCircle className="h-3 w-3 shrink-0" /> Below 75% — needs improvement
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-emerald-600">{presentCount}</div>
              <div className="text-[10px] text-slate-500">Present</div>
            </div>
            <div className="bg-red-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-red-500">
                {records.filter((r: any) => r.status === 'ABSENT').length}
              </div>
              <div className="text-[10px] text-slate-500">Absent</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-slate-600">{totalDays}</div>
              <div className="text-[10px] text-slate-500">Total Days</div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2">
              <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Adm: {child.admissionNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>DOB: {child.dobBS || '—'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Link href={`/parent/children/${child._id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full text-xs">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                Exams & Results
              </Button>
            </Link>
            <Link href="/parent/fees" className="flex-1">
              <Button size="sm" className="w-full text-xs">
                <CreditCard className="h-3.5 w-3.5 mr-1" />
                View Fees
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MyChildrenPage() {
  const { data: childrenRes, isLoading } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => api.get('/parents/my-children'),
  });

  const children = (childrenRes as any)?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Children</h2>
          <p className="text-gray-500 mt-1">View academic progress, attendance, and exam results for each child.</p>
        </div>
        {!isLoading && children.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
            <Users className="h-4 w-4" />
            <span>{children.length} child{children.length > 1 ? 'ren' : ''} enrolled</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No children linked</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Your account has no children linked yet. Please contact the school administration to link your children's profiles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {children.map((child: any, i: number) => (
            <ChildCard key={child._id} child={child} index={i} />
          ))}
        </div>
      )}

      {/* Quick Tips */}
      {!isLoading && children.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700">
            <strong>Tip:</strong> Click <strong>Exams & Results</strong> to view published report cards. Click <strong>View Fees</strong> to check fee status and upload payment receipts.
          </div>
        </div>
      )}
    </div>
  );
}
