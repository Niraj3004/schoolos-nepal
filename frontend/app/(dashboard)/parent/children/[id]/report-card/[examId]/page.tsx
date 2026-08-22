"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ParentReportCardPage({ params }: { params: { id: string, examId: string } }) {
  const { id: studentId, examId } = params;

  const { data: reportRes, isLoading } = useQuery({
    queryKey: ['report-card', examId, studentId],
    queryFn: () => api.get(`/exam/report-card/${examId}/${studentId}`),
  });

  const report = (reportRes as any)?.data;

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!report) {
    return <div className="text-center p-8 text-gray-500">Report card not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <Link href={`/parent/children/${studentId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Back to {report.student.firstName}'s Details</h2>
        </div>
      </div>

      <div className="text-center border-b pb-6 mb-6">
        <h2 className="text-2xl font-bold uppercase text-gray-900">{report.exam.name}</h2>
        <p className="text-gray-500 mt-2">
          {report.student.firstName} {report.student.lastName} | 
          Roll No: {report.student.rollNumber} | 
          Class: {report.student.currentClassId?.name}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Subject</TableHead>
            <TableHead className="text-center">Full Marks</TableHead>
            <TableHead className="text-center">Pass Marks</TableHead>
            <TableHead className="text-center">Obtained</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            <TableHead className="text-center">Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.marks.map((m: any, i: number) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{m.subject}</TableCell>
              <TableCell className="text-center">{m.fullMarks}</TableCell>
              <TableCell className="text-center">{m.passMarks}</TableCell>
              <TableCell className="text-center font-semibold">{m.obtainedMarks}</TableCell>
              <TableCell className="text-center">
                <Badge variant={m.grade === 'F' ? 'danger' : 'default'} className="rounded-sm px-2">{m.grade}</Badge>
              </TableCell>
              <TableCell className="text-center text-xs text-gray-500">{m.remarks || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border p-4 rounded-md bg-gray-50 mt-8">
        <div>
          <p className="text-sm text-gray-500">Total Marks</p>
          <p className="text-lg font-bold text-gray-900">{report.summary.totalObtained} / {report.summary.totalFull}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Percentage</p>
          <p className="text-lg font-bold text-gray-900">{report.summary.percentage}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">GPA</p>
          <p className="text-lg font-bold text-gray-900">{report.summary.gpa}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Result</p>
          <p className="text-lg font-bold">
            {report.summary.resultStatus === 'PASS' ? (
              <span className="text-success">PASSED</span>
            ) : (
              <span className="text-danger">FAILED</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center print:hidden">
        <Button variant="outline" onClick={() => window.print()}>Print Report Card</Button>
      </div>
    </div>
  );
}
