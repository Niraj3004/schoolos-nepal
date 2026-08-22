"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Users, BookOpen, UserCheck, CreditCard, ChevronLeft, ChevronRight, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f4b400', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1'];

export default function AdminDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sendingFees, setSendingFees] = useState(false);
  const [sendingAbsences, setSendingAbsences] = useState(false);

  const handleSendFeeReminders = async () => {
    try {
      setSendingFees(true);
      const res: any = await api.post('/communication/reminders/fees');
      toast.success(res.data?.message || 'Fee reminders sent');
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
      toast.success(res.data?.message || 'Absence reminders sent');
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
    return <div className="flex h-[80vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg">Failed to load dashboard data.</div>;
  }

  const data = (response as any)?.data;
  const demographics = data?.demographics || { totalStudents: 0, totalTeachers: 0, totalParents: 0 };
  const finance = data?.finance || { totalCollected: 0, totalPending: 0, pendingVerificationSlips: 0 };
  const recentExams = data?.recentExams || [];
  
  // Format finance data
  const financeChartData = [
    {
      name: 'Fees Overview',
      Collected: finance.totalCollected || 0,
      Pending: finance.totalPending || 0,
    }
  ];

  // Format attendance data
  const attendancePulseData = data?.attendancePulse?.map((item: any) => ({
    name: item.className,
    Present: item.presentCount,
    Absent: item.absentCount,
    Rate: Math.round(item.attendancePercentage || 0)
  })) || [];

  // Format workload data
  const workloadData = (workloadRes as any)?.data?.map((item: any) => ({
    name: item.teacherName,
    value: item.assignedClassesCount
  })) || [];

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-500">Overview of your school's performance and analytics.</p>
      </div>
      
      {/* Top Row: Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Students */}
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="h-16 w-16 text-[#f4b400]" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Users className="h-5 w-5 text-[#f4b400]" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900">{demographics.totalStudents.toLocaleString()}</h3>
          </CardContent>
        </Card>
        
        {/* Total Teachers */}
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <BookOpen className="h-16 w-16 text-blue-500" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900">{demographics.totalTeachers.toLocaleString()}</h3>
          </CardContent>
        </Card>

        {/* Total Parents */}
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <UserCheck className="h-16 w-16 text-green-500" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Parents</p>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900">{demographics.totalParents.toLocaleString()}</h3>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard className="h-16 w-16 text-purple-500" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900">रू {finance.totalCollected.toLocaleString()}</h3>
          </CardContent>
        </Card>

      </div>

      {/* Row 2: Finance & Workload */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Finance Bar Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-md"><CreditCard className="h-4 w-4 text-slate-700" /></div>
              <CardTitle>Fee Collection vs Pending</CardTitle>
            </div>
            <CardDescription>Financial liquidity overview for the current academic year.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `रू${value}`} />
                  <RechartsTooltip 
                    cursor={{ fill: 'transparent' }} 
                    formatter={(value: any) => `रू ${Number(value).toLocaleString()}`} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="Collected" fill="#10b981" radius={[6, 6, 0, 0]} barSize={50} />
                  <Bar dataKey="Pending" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Workload Pie Chart */}
        <Card className="border-none shadow-sm bg-white flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-md"><PieChartIcon className="h-4 w-4 text-slate-700" /></div>
              <CardTitle>Teacher Workload</CardTitle>
            </div>
            <CardDescription>Classes assigned per teacher.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            {workloadData.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workloadData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {workloadData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value} classes`, 'Assigned']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-gray-400 text-sm py-12">No workload data available.</div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Row 3: Attendance Pulse & Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Attendance Area Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-md"><Activity className="h-4 w-4 text-slate-700" /></div>
              <CardTitle>Daily Attendance Pulse</CardTitle>
            </div>
            <CardDescription>Present vs Absent statistics across all classes for today.</CardDescription>
          </CardHeader>
          <CardContent>
            {attendancePulseData.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendancePulseData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="Present" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                    <Area type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAbsent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                No attendance data recorded today.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="flex flex-col border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>System notifications & exams</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              
              {finance.pendingVerificationSlips > 0 && (
                <div className="flex p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-orange-900">Pending Fee Verifications</p>
                    <p className="text-sm text-orange-700/80 mt-1">You have {finance.pendingVerificationSlips} offline payment slips waiting to be verified.</p>
                  </div>
                </div>
              )}

              {recentExams.map((exam: any, idx: number) => (
                <div key={idx} className="flex p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex-shrink-0 mt-1.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-slate-800">Exam Published</p>
                    <p className="text-sm text-slate-500 mt-0.5">Results for "{exam.name}" have been published.</p>
                  </div>
                </div>
              ))}

              {recentExams.length === 0 && finance.pendingVerificationSlips === 0 && (
                <div className="text-center text-gray-500 py-12 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No recent activities to show.
                </div>
              )}
              
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Calendar & Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Widget */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <CardTitle>Event Calendar</CardTitle>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0 rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm font-bold text-slate-700 min-w-[120px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0 rounded-full"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-xs mb-3 uppercase tracking-wider">
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {/* Empty slots for start of month offset */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 bg-slate-50/50 rounded-xl border border-dashed border-slate-200"></div>
              ))}
              
              {/* Days of month */}
              {daysInMonth.map((day, i) => (
                <div 
                  key={i} 
                  className={`
                    relative h-24 p-2 rounded-xl border transition-all hover:bg-slate-50 group
                    ${isToday(day) ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'border-slate-200'}
                  `}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday(day) ? 'text-blue-600' : 'text-slate-700'}`}>
                    {format(day, 'd')}
                  </div>
                  {/* Mock Event Dot */}
                  {i % 8 === 0 && i > 0 && (
                    <div className="px-1.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md truncate group-hover:bg-amber-200 transition-colors">
                      School Event
                    </div>
                  )}
                  {isToday(day) && (
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-none shadow-sm bg-white flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Trigger system notifications</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button 
              onClick={handleSendFeeReminders} 
              disabled={sendingFees}
              className="w-full flex items-center justify-between h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="font-semibold">Send Fee Reminders</span>
              </div>
              {sendingFees ? <Spinner size="sm" className="text-indigo-700" /> : <Send className="h-4 w-4 text-indigo-500" />}
            </Button>
            
            <Button 
              onClick={handleSendAbsenceReminders} 
              disabled={sendingAbsences}
              className="w-full flex items-center justify-between h-12 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Send Absence Alerts</span>
              </div>
              {sendingAbsences ? <Spinner size="sm" className="text-rose-700" /> : <Send className="h-4 w-4 text-rose-500" />}
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
