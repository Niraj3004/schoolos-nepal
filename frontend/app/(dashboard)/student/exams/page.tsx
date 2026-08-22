"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { BookOpen, Calendar, Eye, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

export default function StudentExamsPage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const { data: studentRes } = useQuery({
    queryKey: ['student-me'],
    queryFn: () => api.get('/students/me'),
  });
  
  const student = (studentRes as any)?.data;

  // Since backend auto-filters by tenant and class, we just call GET /exam
  const { data: examsRes, isLoading } = useQuery({
    queryKey: ['my-exams'],
    queryFn: () => api.get('/exam'),
  });

  const exams = (examsRes as any)?.data || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Exams & Results</h2>
        <p className="text-gray-500">View your exam schedules and report cards.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Exams Scheduled</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              You currently have no upcoming exams or published results to display. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam: any) => (
            <Card key={exam._id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{exam.name}</h3>
                  <Badge variant={exam.status === 'COMPLETED' ? 'success' : exam.status === 'PUBLISHED' ? 'default' : 'warning'}>
                    {exam.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded border border-gray-100 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> 
                    <span>{exam.startDateBS} - {exam.endDateBS}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <BookOpen className="h-4 w-4" /> 
                    <span>{exam.classId?.name} (Year: {exam.academicYearId?.name})</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    disabled={exam.status !== 'PUBLISHED'}
                    onClick={() => setSelectedExamId(exam._id)}
                  >
                    <FileText className="w-4 h-4" /> 
                    {exam.status === 'PUBLISHED' ? 'View Report Card' : 'Results Pending'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedExamId && student?._id && (
        <ReportCardModal 
          examId={selectedExamId}
          studentId={student._id}
          isOpen={!!selectedExamId}
          onClose={() => setSelectedExamId(null)}
        />
      )}
    </div>
  );
}

function ReportCardModal({ examId, studentId, isOpen, onClose }: { examId: string, studentId: string, isOpen: boolean, onClose: () => void }) {
  const { data: reportRes, isLoading } = useQuery({
    queryKey: ['report-card', examId, studentId],
    queryFn: () => api.get(`/exam/report-card/${examId}/${studentId}`),
    enabled: !!examId && !!studentId && isOpen,
  });

  const report = (reportRes as any)?.data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Report Card">
      <div className="max-h-[70vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : !report ? (
          <div className="text-center p-8 text-gray-500">Report card not found for this exam.</div>
        ) : (
          <div className="space-y-6 print:space-y-4">
            
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold uppercase">{report.exam.name}</h2>
              <p className="text-sm text-gray-500">{report.student.firstName} {report.student.lastName} | Roll No: {report.student.rollNumber} | Class: {report.student.currentClassId?.name}</p>
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

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
              <div>
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="text-lg font-bold">{report.summary.totalObtained} / {report.summary.totalFull}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Percentage</p>
                <p className="text-lg font-bold">{report.summary.percentage}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">GPA</p>
                <p className="text-lg font-bold">{report.summary.gpa}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Result Status</p>
                <p className="text-lg font-bold">
                  {report.summary.resultStatus === 'PASS' ? (
                    <span className="text-success">PASSED</span>
                  ) : (
                    <span className="text-danger">FAILED</span>
                  )}
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end border-t pt-4 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>Print Report Card</Button>
      </div>
    </Modal>
  );
}
