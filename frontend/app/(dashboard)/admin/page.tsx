"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Users, BookOpen, UserCheck, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

export default function AdminDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/analytics/admin-dashboard')
  });

  if (isLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg">Failed to load dashboard data.</div>;
  }

  const data = (response as any)?.data;
  const demographics = data?.demographics || { totalStudents: 0, totalTeachers: 0, totalParents: 0 };
  const finance = data?.finance || { totalCollected: 0, totalPending: 0, pendingVerificationSlips: 0 };
  const recentExams = data?.recentExams || [];
  
  // Format finance data for Recharts
  const financeChartData = [
    {
      name: 'Fees Overview',
      Collected: finance.totalCollected || 0,
      Pending: finance.totalPending || 0,
    }
  ];

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-500">Overview of your school's performance and analytics.</p>
      </div>
      
      {/* Top Row: Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Students */}
        <Card className="border-l-4 border-l-[#f4b400]">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-yellow-50 rounded-full">
              <Users className="h-6 w-6 text-[#f4b400]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold">{demographics.totalStudents.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Teachers */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Teachers</p>
              <h3 className="text-2xl font-bold">{demographics.totalTeachers.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Total Parents */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-full">
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Parents</p>
              <h3 className="text-2xl font-bold">{demographics.totalParents.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <h3 className="text-2xl font-bold">रू {finance.totalCollected.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Middle Row: Charts & Notices */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Bar Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Fee Collection vs Pending</CardTitle>
            <CardDescription>Financial overview for the current academic year.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `रू${value}`} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} formatter={(value: any) => `रू ${Number(value).toLocaleString()}`} />
                  <Legend iconType="circle" />
                  <Bar dataKey="Collected" fill="#1a2238" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="Pending" fill="#f4b400" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities / Notices */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>System notifications & exams</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              
              {finance.pendingVerificationSlips > 0 && (
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <span className="flex h-3 w-3 rounded-full bg-warning"></span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Pending Fee Verifications</p>
                    <p className="text-sm text-gray-500">You have {finance.pendingVerificationSlips} offline payment slips waiting to be verified.</p>
                  </div>
                </div>
              )}

              {recentExams.map((exam: any, idx: number) => (
                <div key={idx} className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <span className="flex h-3 w-3 rounded-full bg-primary"></span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Exam Published</p>
                    <p className="text-sm text-gray-500">Results for "{exam.name}" have been published.</p>
                  </div>
                </div>
              ))}

              {recentExams.length === 0 && finance.pendingVerificationSlips === 0 && (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No recent activities to show.
                </div>
              )}
              
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Calendar Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-medium py-2 px-4 bg-gray-50 rounded-md">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-500 text-xs mb-2">
            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for start of month offset */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-gray-50/50 rounded-md border border-dashed border-gray-200"></div>
            ))}
            
            {/* Days of month */}
            {daysInMonth.map((day, i) => (
              <div 
                key={i} 
                className={`
                  h-24 p-2 rounded-md border transition-colors hover:bg-gray-50
                  ${isToday(day) ? 'bg-primary/5 border-primary border-2' : 'border-gray-200'}
                `}
              >
                <div className={`text-xs font-semibold ${isToday(day) ? 'text-primary' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
                {/* Mock Event Dot */}
                {i % 8 === 0 && i > 0 && (
                  <div className="mt-1 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded truncate">
                    School Event
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
