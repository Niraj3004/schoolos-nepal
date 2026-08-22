"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function StudentAttendancePage() {
  const { data: studentRes } = useQuery({
    queryKey: ['student-me'],
    queryFn: () => api.get('/students/me'),
  });
  
  const student = (studentRes as any)?.data;

  const { data: attendanceRes, isLoading } = useQuery({
    queryKey: ['my-attendance', student?._id],
    queryFn: () => api.get(`/attendance/student/${student._id}`),
    enabled: !!student?._id,
  });

  const attData = (attendanceRes as any)?.data || { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0 };
  const presentCount = attData.presentDays || 0;
  const absentCount = attData.absentDays || 0;
  const totalDays = attData.totalDays || 0;
  const attendancePercentage = Math.round(Number(attData.percentage || 0));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Attendance</h2>
        <p className="text-gray-500">View your daily attendance records and statistics.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                <Calendar className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{totalDays}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-success">{presentCount}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <XCircle className="h-4 w-4 text-danger" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-danger">{absentCount}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
                <AlertCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{attendancePercentage}%</div></CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
