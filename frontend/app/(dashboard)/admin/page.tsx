"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Users, BookOpen, UserCheck, CreditCard, ChevronLeft, ChevronRight, Activity, PieChart as PieChartIcon, Bell, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const COLORS = ['#10b981', '#3b82f6', '#f4b400', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function AdminDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sendingFees, setSendingFees] = useState(false);
  const [sendingAbsences, setSendingAbsences] = useState(false);

  const handleSendFeeReminders = async () => {
    try {
      setSendingFees(true);
      const res: any = await api.post('/communication/reminders/fees');
      toast.success(res.data?.message || 'Fee reminders sent successfully');
    } catch (e) {
      toast.error('Failed to send fee reminders');
    } finally {
      setSendingFees(false);
    }
  };

  const handleSendAbsenceReminders = async () => {
    try {
      setSendingAbsences(true);
      const res: any = await api.post('/communication/reminders/absences');
      toast.success(res.data?.message || 'Absence reminders sent successfully');
    } catch (e) {
      toast.error('Failed to send absence reminders');
    } finally {
      setSendingAbsences(false);
    }
  };

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/analytics/admin-dashboard')
  });

  const { data: workloadRes, isLoading: workloadLoading } = useQuery({
    queryKey: ['adminTeacherWorkload'],
    queryFn: () => api.get('/analytics/teacher-workload')
  });

  if (isLoading || workloadLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-primary" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center max-w-md mx-auto mt-20">
        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold">Failed to load data</h3>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  const data = (response as any)?.data;
  const demographics = data?.demographics || { totalStudents: 0, totalTeachers: 0, totalParents: 0 };
  const finance = data?.finance || { totalCollected: 0, totalPending: 0, pendingVerificationSlips: 0 };
  const recentExams = data?.recentExams || [];
  
  const financeChartData = [
    {
      name: 'Current Year',
      Collected: finance.totalCollected || 0,
      Pending: finance.totalPending || 0,
    }
  ];

  const attendancePulseData = data?.attendancePulse?.map((item: any) => ({
    name: item.className,
    Present: item.presentCount,
    Absent: item.absentCount,
    Rate: Math.round(item.attendancePercentage || 0)
  })) || [];

  const workloadData = (workloadRes as any)?.data?.map((item: any) => ({
    name: item.teacherName,
    value: item.assignedClassesCount
  })) || [];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Admin Overview <Sparkles className="h-6 w-6 text-amber-400" />
          </h2>
          <p className="text-slate-500 mt-1">Your comprehensive institutional command center.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      </motion.div>
      
      {/* Top Row: Stat Cards */}
      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        
        {/* Total Students */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden group rounded-3xl h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                  +12%
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Students</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{demographics.totalStudents.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Total Teachers */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden group rounded-3xl h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                  +2%
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Staff</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{demographics.totalTeachers.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Parents */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden group rounded-3xl h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                  +8%
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Parents</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{demographics.totalParents.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Earnings */}
        <motion.div variants={itemVariants}>
          <Card className="border border-transparent shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group rounded-3xl h-full">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/30 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-colors"></div>
            <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-emerald-300 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold border border-white/5">
                  +24%
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">YTD Revenue</p>
                <h3 className="text-4xl font-black tracking-tight flex items-baseline gap-1">
                  <span className="text-2xl text-slate-400 font-bold">रू</span>
                  {finance.totalCollected.toLocaleString()}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      {/* Row 2: Finance & Workload */}
      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
        
        {/* Finance Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden h-full">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    Financial Health
                  </CardTitle>
                  <CardDescription className="mt-2 text-slate-500">Fee collection vs pending dues for current academic year</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `रू${value/1000}k`} tick={{ fill: '#64748b', fontWeight: 500 }} dx={-10} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f8fafc' }} 
                      formatter={(value: any) => [`रू ${Number(value).toLocaleString()}`, '']} 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, color: '#475569' }} />
                    <Bar dataKey="Collected" fill="#10b981" radius={[8, 8, 8, 8]} barSize={80} name="Collected Revenue" />
                    <Bar dataKey="Pending" fill="#f59e0b" radius={[8, 8, 8, 8]} barSize={80} name="Pending Dues" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teacher Workload Pie Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-500">
                  <PieChartIcon className="h-5 w-5" />
                </div>
                Staff Workload
              </CardTitle>
              <CardDescription className="mt-2 text-slate-500">Distribution of assigned classes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
              {workloadData.length > 0 ? (
                <div className="h-[280px] w-full relative">
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-black text-slate-800">{demographics.totalTeachers}</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Teachers</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workloadData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                      >
                        {workloadData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: any) => [`${value} classes assigned`, '']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 h-full gap-3">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <PieChartIcon className="h-8 w-8 text-slate-300" />
                  </div>
                  <span className="font-medium text-sm">No workload data yet.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      {/* Row 3: Attendance Pulse & Recent Activities */}
      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
        
        {/* Attendance Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-purple-500">
                  <Activity className="h-5 w-5" />
                </div>
                Live Attendance Pulse
              </CardTitle>
              <CardDescription className="mt-2 text-slate-500">Real-time present vs absent statistics for today</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {attendancePulseData.length > 0 ? (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendancePulseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontWeight: 600, color: '#475569' }} />
                      <Area type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                      <Area type="monotone" dataKey="Absent" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorAbsent)" activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[320px] flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-slate-300" />
                  </div>
                  <span className="font-medium text-sm">No attendance recorded today.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* System Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-6 pt-6 px-6">
              <CardTitle className="text-xl flex items-center justify-between text-slate-900">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-rose-500 relative">
                    <Bell className="h-5 w-5" />
                    {(finance.pendingVerificationSlips > 0 || recentExams.length > 0) && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full animate-ping"></span>
                    )}
                  </div>
                  System Alerts
                </div>
              </CardTitle>
              <CardDescription className="mt-2 text-slate-500">Requires your attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y divide-slate-50">
                
                {finance.pendingVerificationSlips > 0 && (
                  <div className="p-5 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer group">
                    <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CreditCard className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Action Required: Fees</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        <strong className="text-amber-600">{finance.pendingVerificationSlips}</strong> offline payment slips are waiting for manual verification.
                      </p>
                    </div>
                  </div>
                )}

                {recentExams.map((exam: any, idx: number) => (
                  <div key={idx} className="p-5 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer group">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Exam Published</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Results for <strong className="text-slate-700">"{exam.name}"</strong> are now live for students and parents.
                      </p>
                    </div>
                  </div>
                ))}

                {recentExams.length === 0 && finance.pendingVerificationSlips === 0 && (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-1">No pending alerts at the moment.</p>
                  </div>
                )}
                
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bottom Row: Calendar & Actions */}
      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Widget */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-4 pt-5 px-6">
              <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-teal-500">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                Academic Calendar
              </CardTitle>
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 hover:text-primary text-slate-400"><ChevronLeft className="h-5 w-5" /></Button>
                <span className="text-sm font-bold text-slate-700 min-w-[140px] text-center tracking-wide">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 hover:text-primary text-slate-400"><ChevronRight className="h-5 w-5" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-slate-50/30">
              <div className="grid grid-cols-7 gap-2 text-center font-bold text-slate-400 text-xs mb-4 uppercase tracking-widest">
                <div className="text-rose-400">Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div className="text-indigo-400">Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 rounded-2xl border border-transparent"></div>
                ))}
                
                {daysInMonth.map((day, i) => {
                  const isCurrent = isToday(day);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const hasEvent = i % 8 === 0 && i > 0;
                  
                  return (
                    <motion.div 
                      whileHover={{ y: -4, scale: 1.02 }}
                      key={i} 
                      className={`
                        relative h-24 p-3 rounded-2xl border transition-all cursor-pointer group shadow-sm
                        ${isCurrent ? 'bg-primary border-primary shadow-primary/25' : 'bg-white border-slate-100 hover:border-slate-300'}
                      `}
                    >
                      <div className={`text-sm font-bold flex justify-between items-start ${isCurrent ? 'text-white' : isWeekend ? 'text-slate-400' : 'text-slate-700'}`}>
                        {format(day, 'd')}
                      </div>
                      
                      {hasEvent && !isCurrent && (
                        <div className="mt-2 w-full px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg truncate border border-amber-100">
                          Term Exam
                        </div>
                      )}
                      
                      {isCurrent && hasEvent && (
                        <div className="mt-2 w-full px-2 py-1 bg-white/20 text-white text-[10px] font-bold rounded-lg truncate border border-white/20">
                          Term Exam
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl h-full flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
            <CardHeader className="pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-slate-900 font-extrabold tracking-tight">Command Center</CardTitle>
              <CardDescription className="mt-1 text-slate-500">Automated communication tools</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-6 pb-6 relative z-10">
              
              <div className="group">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Financial</p>
                <Button 
                  onClick={handleSendFeeReminders} 
                  disabled={sendingFees}
                  className="w-full flex items-center justify-between h-14 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-100 hover:border-primary/50 shadow-sm transition-all rounded-2xl group-hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <span className="font-bold">Send Fee Reminders</span>
                  </div>
                  {sendingFees ? <Spinner size="sm" className="text-primary" /> : <Send className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />}
                </Button>
              </div>
              
              <div className="group mt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Academic</p>
                <Button 
                  onClick={handleSendAbsenceReminders} 
                  disabled={sendingAbsences}
                  className="w-full flex items-center justify-between h-14 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-100 hover:border-rose-400/50 shadow-sm transition-all rounded-2xl group-hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="font-bold">Send Absence Alerts</span>
                  </div>
                  {sendingAbsences ? <Spinner size="sm" className="text-rose-500" /> : <Send className="h-4 w-4 text-slate-300 group-hover:text-rose-500 transition-colors" />}
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

    </motion.div>
  );
}
