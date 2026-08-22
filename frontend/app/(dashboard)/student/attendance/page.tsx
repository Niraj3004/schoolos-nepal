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

  const records = (attendanceRes as any)?.data || [];

  const presentCount = records.filter((r: any) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r: any) => r.status === 'ABSENT').length;
  const lateCount = records.filter((r: any) => r.status === 'LATE').length;
  const totalDays = records.length;
  const attendancePercentage = totalDays === 0 ? 0 : Math.round((presentCount / totalDays) * 100);

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

          <Card>
            <CardHeader><CardTitle>Recent Records</CardTitle></CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No attendance records found yet.</div>
              ) : (
                <div className="space-y-4">
                  {records.slice(0, 10).map((r: any) => (
                    <div key={r._id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium text-gray-900">{r.dateBS}</p>
                        <p className="text-xs text-gray-500">Recorded on {new Date(r.dateAD).toLocaleDateString()}</p>
                      </div>
                      <div>
                        {r.status === 'PRESENT' && <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">Present</span>}
                        {r.status === 'ABSENT' && <span className="bg-danger/10 text-danger px-3 py-1 rounded-full text-sm font-medium">Absent</span>}
                        {r.status === 'LATE' && <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-medium">Late</span>}
                        {r.status === 'HALF_DAY' && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">Half Day</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
