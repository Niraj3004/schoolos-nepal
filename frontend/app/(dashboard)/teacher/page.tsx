"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { 
  GraduationCap, Users, BookOpen, ClipboardList, 
  Calendar, Clock, ChevronRight, School, AlertCircle
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

export default function TeacherDashboard() {
  const { user } = useAuthStore();

  const { data: dashboardRes, isLoading, error } = useQuery({
    queryKey: ['teacherDashboard'],
    queryFn: () => api.get('/analytics/teacher-dashboard'),
  });

  const data = (dashboardRes as any)?.data;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = [
    {
      title: 'My Classes',
      value: data?.totalClasses ?? 0,
      icon: School,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/teacher/attendance',
      desc: 'Assigned classes'
    },
    {
      title: 'Total Students',
      value: data?.totalStudents ?? 0,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/teacher/attendance',
      desc: 'Across all classes'
    },
    {
      title: 'Total Subjects',
      value: data?.totalSubjects ?? 0,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/teacher/homework',
      desc: 'Subjects I teach'
    },
    {
      title: 'Pending Homework',
      value: data?.pendingHomework ?? 0,
      icon: ClipboardList,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/teacher/homework',
      desc: 'Due in future'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary mb-1">{greeting()}</p>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {user?.email?.split('@')[0] || 'Teacher'} 👋
          </h2>
          <p className="text-gray-500 mt-1">Here's what's happening in your classes today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/teacher/attendance">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Take Attendance
            </motion.button>
          </Link>
          <Link href="/teacher/homework">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              New Assignment
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Could not load some dashboard data. Please refresh or contact admin if this persists.</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Link href={stat.href}>
              <Card className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {isLoading ? <Spinner size="sm" /> : stat.value}
                  </div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.desc}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* My Classes + Recent Homework */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* My Assigned Classes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                My Classes
              </CardTitle>
              <Link href="/teacher/attendance" className="text-xs text-primary hover:underline">
                Take Attendance →
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {(!data?.classes || data.classes.length === 0) ? (
                <div className="text-center py-8 text-slate-400">
                  <School className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No classes assigned yet.</p>
                  <p className="text-xs mt-1">Contact admin to get assigned to classes.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.classes.map((cls: any, idx: number) => (
                    <div key={cls._id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <School className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{cls.name}</span>
                      </div>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Homework */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-500" />
                Recent Assignments
              </CardTitle>
              <Link href="/teacher/homework" className="text-xs text-primary hover:underline">
                View All →
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {(!data?.recentHomework || data.recentHomework.length === 0) ? (
                <div className="text-center py-8 text-slate-400">
                  <ClipboardList className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No assignments created yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentHomework.map((hw: any) => {
                    const isOverdue = hw.dueDate && new Date(hw.dueDate) < new Date();
                    return (
                      <div key={hw._id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-100' : 'bg-purple-100'}`}>
                          <ClipboardList className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-purple-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{hw.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {hw.classId?.name} • {hw.subjectId?.name}
                          </p>
                          {hw.dueDate && (
                            <p className={`text-xs mt-0.5 flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                              <Clock className="h-3 w-3" />
                              Due: {new Date(hw.dueDate).toLocaleDateString('en-NP')}
                              {isOverdue && ' (Overdue)'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Exams */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              Upcoming Exams
            </CardTitle>
            <Link href="/teacher/exams" className="text-xs text-primary hover:underline">
              Manage Marks →
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {(!data?.upcomingExams || data.upcomingExams.length === 0) ? (
              <div className="text-center py-8 text-slate-400">
                <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No upcoming exams scheduled.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.upcomingExams.map((exam: any) => (
                  <div key={exam._id} className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="font-semibold text-slate-800 text-sm">{exam.name}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {exam.startDateBS} — {exam.endDateBS}
                    </p>
                    <Badge variant="default" className="text-xs mt-2 border-amber-200 text-amber-700">Draft</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Take Attendance', href: '/teacher/attendance', icon: Calendar, color: 'bg-blue-500' },
            { label: 'Grade Exams', href: '/teacher/exams', icon: BookOpen, color: 'bg-purple-500' },
            { label: 'Create Homework', href: '/teacher/homework', icon: ClipboardList, color: 'bg-amber-500' },
            { label: 'Notice Board', href: '/notices', icon: AlertCircle, color: 'bg-slate-500' },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                <div className={`h-9 w-9 rounded-lg ${link.color} bg-opacity-10 flex items-center justify-center`}>
                  <link.icon className={`h-5 w-5 text-slate-700`} />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
