"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  BookOpen, Calendar, GraduationCap, Clock, Users,
  CheckCircle2, XCircle, ClipboardList, TrendingUp, ChevronRight, Sparkles, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { format } from 'date-fns';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

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
    queryFn: () => api.get(`/homework/class?classId=${student?.currentClassId?._id}&sectionId=${student?.currentSectionId?._id}&limit=5`),
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
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-primary" />
          <p className="text-slate-500 font-medium">Loading your student dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Student profile not found</h3>
        <p className="text-slate-500">Please contact administration to properly link your account to a student profile.</p>
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
      bg: attendancePct >= 75 ? 'bg-emerald-100' : 'bg-red-100',
      accent: attendancePct >= 75 ? 'bg-emerald-50' : 'bg-red-50',
      sub: `${presentCount}/${totalDays} days present`,
      href: '/student/attendance'
    },
    {
      title: 'Current Class',
      value: student.currentClassId?.name || 'N/A',
      icon: GraduationCap,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      accent: 'bg-blue-50',
      sub: `Section ${student.currentSectionId?.name || '—'}`,
      href: '/student/attendance'
    },
    {
      title: 'Pending Homework',
      value: pendingHW,
      icon: ClipboardList,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      accent: 'bg-amber-50',
      sub: 'Assignments due soon',
      href: '/student/homework'
    },
    {
      title: 'Upcoming Exams',
      value: upcomingExams.length,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      accent: 'bg-purple-50',
      sub: 'Scheduled term exams',
      href: '/student/exams'
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">{greeting()}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            {student.firstName} {student.lastName} <Sparkles className="h-6 w-6 text-amber-400" />
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="default" className="bg-slate-50 text-slate-600 border-slate-200">Roll No: {student.rollNumber || 'N/A'}</Badge>
            <Badge variant="default" className="bg-slate-50 text-slate-600 border-slate-200">Adm No: {student.admissionNumber || 'N/A'}</Badge>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-end">
          <Badge variant={student.status === 'ENROLLED' ? 'success' : 'default'} className="px-4 py-1.5 text-sm shadow-sm bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> {student.status}
          </Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={containerVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Link href={stat.href}>
              <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group rounded-3xl h-full relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.accent} rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
                <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="h-8 w-8 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.title}</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                      {attLoading && stat.title === 'Attendance' ? <Spinner size="sm" /> : stat.value}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-2">{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Attendance bar + Notices */}
      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">

        {/* Attendance Progress */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-emerald-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Attendance Health
                </CardTitle>
                <CardDescription className="mt-2 text-slate-500">Your presence across the academic year</CardDescription>
              </div>
              <Link href="/student/attendance">
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold">
                  Details <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Rate</span>
                <span className={`text-xl font-black ${attendancePct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{attendancePct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 mb-6 shadow-inner overflow-hidden border border-slate-200/50">
                <div
                  className={`h-full transition-all duration-1000 ease-out relative ${attendancePct >= 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                  style={{ width: `${attendancePct}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                </div>
              </div>
              
              <AnimatePresence>
                {attendancePct < 75 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium shadow-sm">
                      <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <span>Your attendance is below the 75% required threshold. Please improve your regularity.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Days', val: totalDays, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100' },
                  { label: 'Present', val: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
                  { label: 'Absent', val: absentCount, color: 'text-red-500', bg: 'bg-red-50/50', border: 'border-red-100' },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} border ${item.border} rounded-2xl p-4 text-center hover:scale-[1.02] transition-transform`}>
                    <div className={`text-2xl font-black ${item.color} mb-1`}>{item.val}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Notices */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-500 relative">
                    <Clock className="h-5 w-5" />
                    {notices.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>}
                  </div>
                  Notice Board
                </CardTitle>
                <CardDescription className="mt-2 text-slate-500">Important school announcements</CardDescription>
              </div>
              <Link href="/notices">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg font-semibold">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">No new announcements.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notices.slice(0, 3).map((notice: any) => (
                    <div key={notice._id} className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer">
                      <p className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">{notice.title}</p>
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{notice.message || notice.body}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3">
                        {format(new Date(notice.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Exams */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-purple-500">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  Upcoming Exams
                </CardTitle>
                <CardDescription className="mt-2 text-slate-500">Check your exam schedules</CardDescription>
              </div>
              <Link href="/student/exams">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg font-semibold">
                  Results <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">No upcoming exams scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingExams.map((exam: any) => (
                    <div key={exam._id} className="flex items-center gap-4 p-4 bg-purple-50 border border-purple-100 rounded-2xl group hover:border-purple-200 transition-colors">
                      <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-purple-100 flex items-center justify-center shrink-0">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{exam.name}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                          <Calendar className="h-3 w-3 text-purple-400" />
                          {exam.startDateBS}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-white border-purple-200 text-purple-700 text-xs shrink-0 shadow-sm">Upcoming</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Homework */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-amber-500">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  My Homework
                </CardTitle>
                <CardDescription className="mt-2 text-slate-500">Keep track of your assignments</CardDescription>
              </div>
              <Link href="/student/homework">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg font-semibold">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {homeworks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">No assignments yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {homeworks.slice(0, 5).map((hw: any) => {
                    const isOverdue = hw.dueDate && new Date(hw.dueDate) < new Date();
                    return (
                      <div key={hw._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${isOverdue ? 'bg-red-100' : 'bg-amber-100'}`}>
                            <ClipboardList className={`h-5 w-5 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{hw.title}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{hw.subjectId?.name || 'General'}</p>
                          </div>
                        </div>
                        <Badge
                          variant={isOverdue ? 'danger' : 'default'}
                          className={`text-[10px] ml-4 shrink-0 font-bold tracking-wide py-0.5 shadow-sm ${!isOverdue && 'bg-slate-50 text-slate-600 border-slate-200'}`}
                        >
                          {isOverdue ? 'Overdue' : `Due: ${format(new Date(hw.dueDate), 'MMM d')}`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
