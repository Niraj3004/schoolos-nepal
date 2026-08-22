"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Users, BookOpen, Clock, Calendar, AlertCircle, ChevronRight, CheckCircle2, XCircle, TrendingUp, Sparkles, Plus, GraduationCap, ClipboardList, ArrowUpRight, School
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
      bg: 'bg-blue-100',
      accent: 'bg-blue-50',
      href: '/teacher/attendance',
      desc: 'Assigned classes'
    },
    {
      title: 'Total Students',
      value: data?.totalStudents ?? 0,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      accent: 'bg-emerald-50',
      href: '/teacher/attendance',
      desc: 'Across all classes'
    },
    {
      title: 'Total Subjects',
      value: data?.totalSubjects ?? 0,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      accent: 'bg-purple-50',
      href: '/teacher/homework',
      desc: 'Subjects I teach'
    },
    {
      title: 'Pending Homework',
      value: data?.pendingHomework ?? 0,
      icon: ClipboardList,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      accent: 'bg-amber-50',
      href: '/teacher/homework',
      desc: 'Due in future'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-primary" />
          <p className="text-slate-500 font-medium">Loading your classroom dashboard...</p>
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
            {user?.email?.split('@')[0] || 'Teacher'} <Sparkles className="h-6 w-6 text-amber-400" />
          </h2>
          <p className="text-slate-500 mt-1">Here's what's happening in your classes today.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Link href="/teacher/attendance">
            <Button size="sm" className="h-10 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
              <Calendar className="h-4 w-4 mr-2" />
              Take Attendance
            </Button>
          </Link>
          <Link href="/teacher/homework">
            <Button variant="outline" size="sm" className="h-10 rounded-xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
              <ClipboardList className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm shadow-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">Could not load some dashboard data. Please refresh or contact admin if this persists.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
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
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* My Classes + Recent Homework */}
      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">

        {/* My Assigned Classes */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-500">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  My Classes
                </CardTitle>
                <CardDescription className="mt-2 text-slate-500">Your assigned homerooms</CardDescription>
              </div>
              <Link href="/teacher/attendance">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg font-semibold">
                  Take Attendance <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {(!data?.classes || data.classes.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <School className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">No classes assigned yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {data.classes.map((cls: any, idx: number) => (
                    <div key={cls._id || idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <School className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-bold text-slate-800">{cls.name}</span>
                      </div>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm">Active</Badge>
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
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-purple-500">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  Recent Assignments
                </CardTitle>
                <CardDescription className="mt-2 text-slate-500">Latest homework you've posted</CardDescription>
              </div>
              <Link href="/teacher/homework">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg font-semibold">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {(!data?.recentHomework || data.recentHomework.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">No assignments created yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {data.recentHomework.map((hw: any) => {
                    const isOverdue = hw.dueDate && new Date(hw.dueDate) < new Date();
                    return (
                      <div key={hw._id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors group">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${isOverdue ? 'bg-red-100' : 'bg-purple-100'}`}>
                          <ClipboardList className={`h-5 w-5 ${isOverdue ? 'text-red-500' : 'text-purple-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="font-bold text-slate-900 text-sm truncate">{hw.title}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                            {hw.classId?.name} • {hw.subjectId?.name}
                          </p>
                          {hw.dueDate && (
                            <div className="mt-2 flex items-center">
                              <Badge variant="default" className={`text-[10px] ml-4 shrink-0 font-bold tracking-wide py-0.5 shadow-sm ${hw.status === 'PUBLISHED' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                <Clock className="h-3 w-3 mr-1" />
                                Due: {format(new Date(hw.dueDate), 'MMM d')}
                              </Badge>
                            </div>
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
      </motion.div>

      {/* Upcoming Exams */}
      <motion.div variants={itemVariants}>
        <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6 gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-amber-500">
                  <BookOpen className="h-5 w-5" />
                </div>
                Upcoming Exams
              </CardTitle>
              <CardDescription className="mt-2 text-slate-500">Scheduled term examinations</CardDescription>
            </div>
            <Link href="/teacher/exams">
              <Button variant="outline" size="sm" className="rounded-xl font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
                Manage Marks <ArrowUpRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            {(!data?.upcomingExams || data.upcomingExams.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-medium">No upcoming exams scheduled.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.upcomingExams.map((exam: any) => (
                  <motion.div whileHover={{ y: -4 }} key={exam._id} className="p-5 bg-white border-2 border-amber-50 hover:border-amber-100 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                      <p className="font-black text-slate-900 text-lg mb-1">{exam.name}</p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mt-2">
                        <Calendar className="h-4 w-4 text-amber-400" />
                        {exam.startDateBS} — {exam.endDateBS}
                      </div>
                      <div className="mt-4">
                        <Badge variant="default" className="bg-white border-blue-200 text-blue-700 text-xs shrink-0 shadow-sm">{exam.studentsCount} Students</Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Attendance', href: '/teacher/attendance', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100' },
            { label: 'Exams', href: '/teacher/exams', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100' },
            { label: 'Homework', href: '/teacher/homework', icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-100' },
            { label: 'Notices', href: '/notices', icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-3xl hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group h-full">
                <div className={`h-14 w-14 rounded-2xl ${link.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <link.icon className={`h-6 w-6 ${link.color}`} />
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{link.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
