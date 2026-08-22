"use client";

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Printer } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function StudentReportCardPage() {
  const { id: examId } = useParams();
  const { user, role } = useAuthStore();

  // If role is STUDENT, fetch student profile to get student ID. If PARENT, they should be passing studentId as query param ideally, but for now we'll assume student uses it.
  const { data: studentRes } = useQuery({
    queryKey: ['studentMe'],
    queryFn: () => api.get('/students/me'),
    enabled: role === 'STUDENT',
  });
  
  const studentId = (studentRes as any)?.data?._id;

  const { data: reportRes, isLoading, isError, error } = useQuery({
    queryKey: ['report-card', examId, studentId],
    queryFn: () => api.get(`/exams/report-card/${examId}/${studentId}`),
    enabled: !!examId && !!studentId,
    retry: false,
  });

  const report = (reportRes as any)?.data;
  const studentProfile = (studentRes as any)?.data;

  const handlePrint = () => {
    window.print();
  };

  if (role === 'STUDENT' && !studentId) {
    return <div className="p-8 flex justify-center"><Spinner /></div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-danger">
        <h3 className="text-lg font-semibold mb-2">Error Loading Report Card</h3>
        <p>{(error as any)?.message || 'Could not retrieve report card. The exam results may not be published yet.'}</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Print to PDF
        </Button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-card, #printable-report-card * {
            visibility: visible;
          }
          #printable-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />

      <Card id="printable-report-card" className="border-2 border-gray-800 rounded-none shadow-none text-gray-900 bg-white">
        <CardContent className="p-8 sm:p-12">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Government of Nepal</h1>
            <h2 className="text-xl font-semibold mb-1">National Examinations Board</h2>
            <h3 className="text-lg mb-4">Sanothimi, Bhaktapur</h3>
            <h4 className="text-2xl font-bold uppercase underline mb-2">Grade Sheet</h4>
            <p className="text-md font-medium uppercase">{report.examName}</p>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-y-4 mb-8 text-sm">
            <div>
              <span className="font-semibold w-32 inline-block">THE GRADE(S) SECURED BY:</span>
              <span className="font-bold border-b border-gray-400 border-dashed pb-1 uppercase">
                {studentProfile?.firstName} {studentProfile?.lastName}
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold mr-2">ROLL NO:</span>
              <span className="font-bold border-b border-gray-400 border-dashed pb-1">
                {studentProfile?.rollNumber || 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-semibold w-32 inline-block">REGISTRATION NO:</span>
              <span className="font-bold border-b border-gray-400 border-dashed pb-1">
                {studentProfile?.admissionNumber || 'N/A'}
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold mr-2">RANK:</span>
              <span className="font-bold border-b border-gray-400 border-dashed pb-1">
                {report.rank} / {report.totalStudentsInSection}
              </span>
            </div>
          </div>

          {/* Grades Table */}
          <table className="w-full border-collapse border-2 border-gray-800 mb-8 text-sm text-center">
            <thead>
              <tr className="border-b-2 border-gray-800 font-semibold bg-gray-50">
                <th className="border-r-2 border-gray-800 p-2 w-16">S.N.</th>
                <th className="border-r-2 border-gray-800 p-2 text-left">Subjects</th>
                <th className="border-r-2 border-gray-800 p-2 w-24">Credit Hours</th>
                <th className="border-r-2 border-gray-800 p-2 w-24">Grade Point</th>
                <th className="border-r-2 border-gray-800 p-2 w-24">Grade</th>
                <th className="p-2 w-32">Final Grade</th>
              </tr>
            </thead>
            <tbody>
              {report.subjectResults.map((sub: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-800">
                  <td className="border-r-2 border-gray-800 p-2">{idx + 1}</td>
                  <td className="border-r-2 border-gray-800 p-2 text-left font-medium uppercase">{sub.subject}</td>
                  <td className="border-r-2 border-gray-800 p-2 font-mono">{sub.creditHours}</td>
                  <td className="border-r-2 border-gray-800 p-2 font-mono">{sub.gradePoint.toFixed(2)}</td>
                  <td className="border-r-2 border-gray-800 p-2 font-bold">{sub.grade}</td>
                  <td className="p-2 font-bold">{sub.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* GPA Summary */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="font-semibold mb-1">Attendance: <span className="font-normal">{report.attendancePercentage}%</span></p>
              <p className="font-semibold">Remarks: <span className="font-normal">{report.remarks}</span></p>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold mb-1">GRADE POINT AVERAGE (GPA)</div>
              <div className="text-4xl font-black border-2 border-gray-800 px-6 py-2 rounded">
                {report.aggregateGPA.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 text-center pt-8 mt-12 text-sm font-semibold">
            <div>
              <div className="border-t border-gray-800 pt-2 mx-4">Prepared By</div>
            </div>
            <div>
              <div className="border-t border-gray-800 pt-2 mx-4">Checked By</div>
            </div>
            <div>
              <div className="border-t border-gray-800 pt-2 mx-4">Principal</div>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500 text-center italic">
            Note: This is a computer generated grade sheet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
