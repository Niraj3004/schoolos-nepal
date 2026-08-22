"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '@/components/ui/Table';
import { BookOpen, Save, AlertTriangle } from 'lucide-react';

export default function TeacherExamsPage() {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [marks, setMarks] = useState<Record<string, { theory: string; practical: string; isAbsent: boolean }>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);

  // Fetch exams
  const { data: examsRes } = useQuery({
    queryKey: ['exams'],
    queryFn: () => api.get('/exams'),
  });
  const exams = (examsRes as any)?.data || [];

  // Fetch classes
  const { data: classesRes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academic/classes'),
  });
  const classes = (classesRes as any)?.data || [];

  // Fetch sections
  const { data: sectionsRes } = useQuery({
    queryKey: ['sections', classId],
    queryFn: () => api.get(`/academic/sections?classId=${classId}`),
    enabled: !!classId,
  });
  const sections = (sectionsRes as any)?.data || [];

  // Fetch subjects
  const { data: subjectsRes } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.get('/academic/subjects'),
  });
  const subjects = (subjectsRes as any)?.data || [];

  // Fetch students for the class/section
  const { data: studentsRes, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['exam-students', classId, sectionId],
    queryFn: () => api.get(`/students?classId=${classId}&sectionId=${sectionId}&limit=100&status=ENROLLED`),
    enabled: !!classId && !!sectionId,
  });
  const students = (studentsRes as any)?.data?.students || [];

  // Fetch existing marks
  const { data: existingMarksRes } = useQuery({
    queryKey: ['existing-marks', selectedExamId, classId, sectionId, subjectId],
    queryFn: () => api.get(`/exams/marks?examId=${selectedExamId}&classId=${classId}&sectionId=${sectionId}&subjectId=${subjectId}`),
    enabled: !!selectedExamId && !!classId && !!sectionId && !!subjectId,
  });

  // Get selected subject details for max marks validation
  const selectedSubject = subjects.find((s: any) => s._id === subjectId);

  // Initialize marks from students + existing data
  useEffect(() => {
    if (students.length > 0 && subjectId) {
      const existingMarks = (existingMarksRes as any)?.data || [];
      const newMarks: Record<string, { theory: string; practical: string; isAbsent: boolean }> = {};

      for (const student of students) {
        const existing = existingMarks.find((m: any) => m.studentId?._id === student._id || m.studentId === student._id);
        newMarks[student._id] = {
          theory: existing ? String(existing.theoryMarksObtained) : '',
          practical: existing ? String(existing.practicalMarksObtained) : '',
          isAbsent: existing?.isAbsent || false,
        };
      }
      setMarks(newMarks);
      setValidationErrors({});
    }
  }, [students, subjectId, existingMarksRes]);

  // Validate a single entry
  const validateEntry = (studentId: string, field: 'theory' | 'practical', value: string) => {
    if (!selectedSubject) return;
    const num = Number(value);
    const max = field === 'theory' ? selectedSubject.theoryFullMarks : selectedSubject.practicalFullMarks;

    if (value !== '' && (isNaN(num) || num < 0 || num > max)) {
      setValidationErrors(prev => ({
        ...prev,
        [`${studentId}-${field}`]: `Max: ${max}`
      }));
    } else {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[`${studentId}-${field}`];
        return copy;
      });
    }
  };

  const handleMarkChange = (studentId: string, field: 'theory' | 'practical', value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
    validateEntry(studentId, field, value);
  };

  const handleAbsentToggle = (studentId: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        isAbsent: !prev[studentId].isAbsent,
        theory: !prev[studentId].isAbsent ? '0' : prev[studentId].theory,
        practical: !prev[studentId].isAbsent ? '0' : prev[studentId].practical,
      }
    }));
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (payload: any) => api.post('/exams/marks/bulk', payload),
    onSuccess: () => {
      setToast({ title: 'Marks Saved!', description: 'All marks have been submitted successfully.', variant: 'success' });
    },
    onError: (err: any) => {
      setToast({ title: 'Save Failed', description: err.message, variant: 'error' });
    },
  });

  const handleSubmit = () => {
    if (Object.keys(validationErrors).length > 0) {
      setToast({ title: 'Validation Error', description: 'Fix marks exceeding max before submitting.', variant: 'error' });
      return;
    }

    const marksArray = Object.entries(marks).map(([studentId, entry]) => ({
      studentId,
      theoryMarksObtained: Number(entry.theory) || 0,
      practicalMarksObtained: Number(entry.practical) || 0,
      isAbsent: entry.isAbsent,
    }));

    submitMutation.mutate({
      examId: selectedExamId,
      classId,
      sectionId,
      subjectId,
      marks: marksArray,
    });
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const isReady = selectedExamId && classId && sectionId && subjectId && students.length > 0;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} variant={toast.variant} onClose={() => setToast(null)} />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Mark Entry</h2>
        <p className="text-gray-500">Select an exam and subject, then enter theory & practical marks for each student.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
              <Select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                <option value="">Select Exam</option>
                {exams.map((e: any) => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <Select value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
                <option value="">Select Class</option>
                {classes.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
                <option value="">Select Section</option>
                {sections.map((s: any) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Select Subject</option>
                {subjects.map((s: any) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Subject Max Marks Info */}
          {selectedSubject && (
            <div className="mt-3 flex items-center gap-4 text-sm bg-blue-50 border border-blue-200 rounded-md p-3">
              <span className="font-medium text-blue-800">Max Marks:</span>
              <span>Theory: <strong>{selectedSubject.theoryFullMarks}</strong></span>
              <span>Practical: <strong>{selectedSubject.practicalFullMarks}</strong></span>
              <span>Total: <strong>{selectedSubject.theoryFullMarks + selectedSubject.practicalFullMarks}</strong></span>
              <span>Credit Hours: <strong>{selectedSubject.creditHours}</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoadingStudents && classId && sectionId && (
        <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
      )}

      {/* Mark Entry Matrix */}
      {isReady && !isLoadingStudents && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="w-32">Theory ({selectedSubject?.theoryFullMarks})</TableHead>
                <TableHead className="w-32">Practical ({selectedSubject?.practicalFullMarks})</TableHead>
                <TableHead className="w-24">Total</TableHead>
                <TableHead className="w-20 text-center">Absent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any, idx: number) => {
                const entry = marks[student._id] || { theory: '', practical: '', isAbsent: false };
                const theoryNum = Number(entry.theory) || 0;
                const practicalNum = Number(entry.practical) || 0;
                const total = theoryNum + practicalNum;
                const theoryError = validationErrors[`${student._id}-theory`];
                const practicalError = validationErrors[`${student._id}-practical`];

                return (
                  <TableRow key={student._id} className={entry.isAbsent ? 'bg-gray-50 opacity-60' : ''}>
                    <TableCell className="font-mono text-sm text-gray-400">{student.rollNumber || idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                          {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                        </div>
                        <span className="font-medium text-sm">{student.firstName} {student.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Input
                          type="number"
                          min={0}
                          max={selectedSubject?.theoryFullMarks}
                          value={entry.theory}
                          onChange={(e) => handleMarkChange(student._id, 'theory', e.target.value)}
                          disabled={entry.isAbsent || submitMutation.isPending}
                          error={!!theoryError}
                          className="w-24 h-8 text-sm"
                          placeholder="0"
                        />
                        {theoryError && <span className="text-[10px] text-danger">{theoryError}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Input
                          type="number"
                          min={0}
                          max={selectedSubject?.practicalFullMarks}
                          value={entry.practical}
                          onChange={(e) => handleMarkChange(student._id, 'practical', e.target.value)}
                          disabled={entry.isAbsent || submitMutation.isPending}
                          error={!!practicalError}
                          className="w-24 h-8 text-sm"
                          placeholder="0"
                        />
                        {practicalError && <span className="text-[10px] text-danger">{practicalError}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm">{entry.isAbsent ? '—' : total}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={entry.isAbsent}
                        onChange={() => handleAbsentToggle(student._id)}
                        disabled={submitMutation.isPending}
                        className="h-4 w-4 rounded border-gray-300 text-danger focus:ring-danger cursor-pointer"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Validation Errors Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md p-3">
              <AlertTriangle className="h-4 w-4" />
              {Object.keys(validationErrors).length} mark(s) exceed the maximum. Fix before saving.
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              isLoading={submitMutation.isPending}
              disabled={Object.keys(validationErrors).length > 0 || Object.keys(marks).length === 0}
              className="px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Marks
            </Button>
          </div>
        </>
      )}

      {/* Prompt */}
      {!selectedExamId && (
        <EmptyState
          title="Select an Exam"
          description="Choose an exam, class, section, and subject to begin entering marks."
          icon={<BookOpen className="h-8 w-8" />}
        />
      )}
    </div>
  );
}
