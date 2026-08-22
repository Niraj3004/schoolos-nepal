"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen, Calendar, GraduationCap, Clock, Users,
  CheckCircle2, XCircle, ClipboardList, TrendingUp, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 }
  })
} as any;

export default function StudentDashboard() {
  const { data: studentRes, isLoading: studentLoading } = useQuery({
    queryKey: ['student-me'],
    queryFn: () => api.get('/students/me'),
  });

  const student = (studentRes as any)?.data;

  // Fetch attendance summary
  const { data: attendanceRes, isLoading: attLoading } = useQuery({
    queryKey: ['my-attendance', student?._id],
    queryFn: () => api.get(`/attendance/student/${student._id}`),
    enabled: !!student?._id,
  });
  const attData = (attendanceRes as any)?.data || { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0 };
  const presentCount = attData.presentDays || 0;
  const totalDays = attData.totalDays || 0;
  const absentCount = attData.absentDays || 0;
  const attendancePct = Math.round(Number(attData.percentage || 0));

  // Fetch exams
  const { data: examsRes } = useQuery({
    queryKey: ['exams-list'],
    queryFn: () => api.get('/exams'),
  });
  const exams = (examsRes as any)?.data || [];
  const upcomingExams = exams.filter((e: any) => !e.isPublished).slice(0, 3);

  // Fetch homework
  const { data: hwRes } = useQuery({
    queryKey: ['my-homework', student?.currentClassId?._id, student?.currentSectionId?._id],
    queryFn: () => api.get(`/homework/class?classId=${student.currentClassId._id}&sectionId=${student.currentSectionId._id}&limit=5`),
    enabled: !!student?.currentClassId?._id && !!student?.currentSectionId?._id,
  });
  const homeworks = (hwRes as any)?.data || [];
  const pendingHW = homeworks.filter((h: any) => new Date(h.dueDate) >= new Date()).length;

  // Fetch notices
  const { data: noticesRes } = useQuery({
    queryKey: ['notices'],
    queryFn: () => api.get('/communication/notices?limit=3'),
  });
  const notices = (noticesRes as any)?.data?.notices || (noticesRes as any)?.data || [];

  const isLoading = studentLoading;

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <GraduationCap className="h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600">Student profile not found</h3>
        <p className="text-sm text-slate-400 mt-1">Please contact administration to link your account.</p>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = [
    {
      title: 'Attendance',
      value: `${attendancePct}%`,
      icon: CheckCircle2,
      color: attendancePct >= 75 ? 'text-emerald-600' : 'text-red-500',
      bg: attendancePct >= 75 ? 'bg-emerald-50' : 'bg-red-50',
      sub: `${presentCount}/${totalDays} days present`,
      href: '/student/attendance'
    },
    {
      title: 'Current Class',
      value: student.currentClassId?.name || 'N/A',
      icon: GraduationCap,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: `Section ${student.currentSectionId?.name || '—'}`,
      href: '/student/attendance'
    },
    {
      title: 'Pending Homework',
      value: pendingHW,
      icon: ClipboardList,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      sub: 'Due soon',
      href: '/student/homework'
    },
    {
      title: 'Upcoming Exams',
      value: upcomingExams.length,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      sub: 'Scheduled exams',
      href: '/student/exams'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary mb-1">{greeting()}</p>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {student.firstName} {student.lastName} 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Roll No. {student.rollNumber} • Adm. {student.admissionNumber}
          </p>
        </div>
        <Badge variant={student.status === 'ENROLLED' ? 'success' : 'default'} className="text-sm px-4 py-1.5 self-start sm:self-end">
          {student.status}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <Link href={stat.href}>
              <Card className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-0.5">{attLoading && stat.title === 'Attendance' ? <Spinner size="sm" /> : stat.value}</div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Attendance bar + Notices */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Attendance Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Attendance Overview
              </CardTitle>
              <Link href="/student/attendance" className="text-xs text-primary hover:underline">View All →</Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Overall Attendance</span>
                <span className={`text-sm font-bold ${attendancePct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{attendancePct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${attendancePct >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
              {attendancePct < 75 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span>Your attendance is below 75%. Please improve your regularity.</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'Total Days', val: totalDays, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Present', val: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Absent', val: absentCount, color: 'text-red-500', bg: 'bg-red-50' },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                    <div className={`text-xl font-bold ${item.color}`}>{item.val}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Notices */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recent Notices
              </CardTitle>
              <Link href="/notices" className="text-xs text-primary hover:underline">View All →</Link>
            </CardHeader>
            <CardContent className="pt-0">
              {notices.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No new announcements.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.slice(0, 3).map((notice: any) => (
                    <div key={notice._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="font-medium text-slate-800 text-sm line-clamp-1">{notice.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notice.message || notice.body}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(notice.createdAt).toLocaleDateString('en-NP')}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Exams */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Upcoming Exams
            </CardTitle>
            <Link href="/student/exams" className="text-xs text-primary hover:underline">My Results →</Link>
          </CardHeader>
          <CardContent className="pt-0">
            {upcomingExams.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No upcoming exams scheduled.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {upcomingExams.map((exam: any) => (
                  <div key={exam._id} className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <p className="font-semibold text-slate-800 text-sm">{exam.name}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {exam.startDateBS}
                    </p>
                    <Badge variant="default" className="text-xs mt-2 border-purple-200 text-purple-700">Upcoming</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Homework */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              Recent Assignments
            </CardTitle>
            <Link href="/student/homework" className="text-xs text-primary hover:underline">View All →</Link>
          </CardHeader>
          <CardContent className="pt-0">
            {homeworks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ClipboardList className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No assignments yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {homeworks.slice(0, 5).map((hw: any) => {
                  const isOverdue = hw.dueDate && new Date(hw.dueDate) < new Date();
                  return (
                    <div key={hw._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{hw.title}</p>
                        <p className="text-xs text-slate-500">{hw.subjectId?.name || 'General'}</p>
                      </div>
                      <Badge
                        variant={isOverdue ? 'danger' : 'default'}
                        className="text-xs shrink-0 ml-2"
                      >
                        {isOverdue ? 'Overdue' : `Due ${new Date(hw.dueDate).toLocaleDateString('en-NP')}`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
