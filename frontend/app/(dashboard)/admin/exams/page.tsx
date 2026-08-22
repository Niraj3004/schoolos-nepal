"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import ExamModal from '@/components/shared/exam/ExamModal';

export default function AdminExamsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: examsRes, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: () => api.get('/exam')
  });

  const exams = (examsRes as any)?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Exam Management</h2>
          <p className="text-gray-500">Create and manage master examinations.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Exam
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Master Exams</CardTitle>
          <CardDescription>All examinations created for the school.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : error ? (
            <div className="text-danger p-4 bg-red-50 rounded-lg">Failed to load exams.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Exam Name</th>
                    <th className="px-6 py-3">Academic Year</th>
                    <th className="px-6 py-3">Term</th>
                    <th className="px-6 py-3">Dates (BS)</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam: any) => (
                    <tr key={exam._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{exam.name}</td>
                      <td className="px-6 py-4">{exam.academicYearId?.name}</td>
                      <td className="px-6 py-4">{exam.termId?.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs">
                          <CalendarIcon className="w-3 h-3" /> {exam.startDateBS} to {exam.endDateBS}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {exam.isPublished 
                          ? <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Published</span>
                          : <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Draft</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {exams.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-4 text-center">No exams created yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
