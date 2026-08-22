"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { BookOpen, Calendar, GraduationCap, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function StudentDashboard() {
  const { data: studentRes, isLoading } = useQuery({
    queryKey: ['student-me'],
    queryFn: () => api.get('/students/me'),
  });

  const student = (studentRes as any)?.data;

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!student) {
    return <div className="p-8 text-center text-gray-500">Student profile not found. Please contact administration.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome, {student.firstName}!</h2>
          <p className="text-gray-500">Here is your academic overview.</p>
        </div>
        <Badge variant={student.status === 'ENROLLED' ? 'success' : 'default'} className="text-sm px-3 py-1">
          {student.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Class</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{student.currentClassId?.name}</div>
            <p className="text-xs text-gray-500">Section {student.currentSectionId?.name}</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Roll Number</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{student.rollNumber}</div>
            <p className="text-xs text-gray-500">Adm No: {student.admissionNumber}</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gender</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 capitalize">{student.gender?.toLowerCase() || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Date of Birth</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{student.dateOfBirthBS || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-center py-8 text-gray-500">
               <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
               <p>No new announcements.</p>
             </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-center py-8 text-gray-500">
               <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
               <p>No upcoming exams scheduled.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
