"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Calendar, BookOpen, AlertCircle, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChildDetailsPage({ params }: { params: { id: string } }) {
  const childId = params.id;

  // Fetch student details
  const { data: studentRes, isLoading: studentLoading } = useQuery({
    queryKey: ['student', childId],
    queryFn: () => api.get(`/students/${childId}`),
  });
  
  const student = (studentRes as any)?.data;

  // Fetch attendance
  const { data: attendanceRes, isLoading: attLoading } = useQuery({
    queryKey: ['attendance', childId],
    queryFn: () => api.get(`/attendance/student/${childId}`),
  });
  
  const attendanceRecords = (attendanceRes as any)?.data || [];
  
  // Calculate attendance stats
  const presentCount = attendanceRecords.filter((r: any) => r.status === 'PRESENT').length;
  const totalDays = attendanceRecords.length;
  const attendancePercentage = totalDays === 0 ? 0 : Math.round((presentCount / totalDays) * 100);

  // Fetch exams
  const { data: examsRes, isLoading: examsLoading } = useQuery({
    queryKey: ['exams', childId],
    queryFn: () => api.get('/exam'),
  });
  
  const exams = (examsRes as any)?.data || [];

  const isLoading = studentLoading || attLoading || examsLoading;

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!student) {
    return <div className="p-8 text-center">Child not found or access denied.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/parent" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{student.firstName}'s Details</h2>
          <p className="text-gray-500">View attendance and academic performance.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-gray-50 p-4 rounded-lg text-center border">
                 <p className="text-sm text-gray-500">Overall %</p>
                 <p className="text-2xl font-bold mt-1">{attendancePercentage}%</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-lg text-center border">
                 <p className="text-sm text-gray-500">Present Days</p>
                 <p className="text-2xl font-bold mt-1 text-success">{presentCount} / {totalDays}</p>
               </div>
             </div>
             
             <h4 className="text-sm font-semibold mb-3">Recent Records</h4>
             {attendanceRecords.length === 0 ? (
               <p className="text-sm text-gray-500 italic">No attendance records yet.</p>
             ) : (
               <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                 {attendanceRecords.slice(0, 5).map((r: any) => (
                    <div key={r._id} className="flex justify-between items-center p-2 border rounded text-sm">
                      <span className="font-medium text-gray-700">{r.dateBS}</span>
                      {r.status === 'PRESENT' && <span className="text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Present</span>}
                      {r.status === 'ABSENT' && <span className="text-danger flex items-center gap-1"><XCircle className="h-3 w-3" /> Absent</span>}
                      {r.status === 'LATE' && <span className="text-warning flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Late</span>}
                    </div>
                 ))}
               </div>
             )}
          </CardContent>
        </Card>

        {/* Exams Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Exam Results</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
               <div className="text-center py-8 text-gray-500">No exams or results available.</div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {exams.map((exam: any) => (
                  <div key={exam._id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{exam.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${exam.status === 'PUBLISHED' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'}`}>
                        {exam.status === 'PUBLISHED' ? 'Results Out' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{exam.startDateBS} - {exam.endDateBS}</p>
                    
                    {exam.status === 'PUBLISHED' ? (
                      <Link href={`/parent/children/${childId}/report-card/${exam._id}`} className="text-primary text-sm hover:underline font-medium block text-center bg-primary/5 py-2 rounded">
                        View Full Report Card
                      </Link>
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-2 bg-gray-50 rounded italic">Report card not generated yet.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
