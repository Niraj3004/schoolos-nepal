"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { AttendanceGrid, AttendanceEntry, AttendanceStatus } from '@/components/shared/attendance/AttendanceGrid';
import { Calendar, CheckCircle2, Users, RotateCcw } from 'lucide-react';

export default function TeacherAttendancePage() {
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [dateAD, setDateAD] = useState(() => new Date().toISOString().split('T')[0]);
  const [dateBS, setDateBS] = useState('');
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);

  // Fetch classes
  const { data: classesRes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academic/classes'),
  });
  const classes = (classesRes as any)?.data || [];

  // Fetch sections for selected class
  const { data: sectionsRes } = useQuery({
    queryKey: ['sections', classId],
    queryFn: () => api.get(`/academic/sections?classId=${classId}`),
    enabled: !!classId,
  });
  const sections = (sectionsRes as any)?.data || [];

  // Fetch students for the selected class/section
  const { data: studentsRes, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['attendance-students', classId, sectionId],
    queryFn: () => api.get(`/students?classId=${classId}&sectionId=${sectionId}&limit=100&status=ENROLLED`),
    enabled: !!classId && !!sectionId,
  });
  const students = (studentsRes as any)?.data?.students || [];

  // Fetch existing attendance for the day
  const { data: existingRes, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['existing-attendance', classId, sectionId, dateAD],
    queryFn: () => api.get(`/attendance/class?classId=${classId}&sectionId=${sectionId}&dateBS=${dateBS || dateAD}&type=DAILY`),
    enabled: !!classId && !!sectionId && !!dateAD,
  });

  // Initialize entries: default all to PRESENT, or load existing
  useEffect(() => {
    if (students.length > 0) {
      const existingRecord = (existingRes as any)?.data;
      if (existingRecord?.entries?.length > 0) {
        // Load existing
        setEntries(
          existingRecord.entries.map((e: any) => ({
            studentId: e.studentId,
            status: e.status as AttendanceStatus,
          }))
        );
      } else {
        // Default all to PRESENT
        setEntries(
          students.map((s: any) => ({
            studentId: s._id,
            status: 'PRESENT' as AttendanceStatus,
          }))
        );
      }
      setIsInitialized(true);
    } else {
      setEntries([]);
      setIsInitialized(false);
    }
  }, [students, existingRes]);

  // Handle entry change
  const handleEntryChange = (studentId: string, status: AttendanceStatus) => {
    setEntries(prev =>
      prev.map(e => e.studentId === studentId ? { ...e, status } : e)
    );
  };

  // Bulk actions
  const markAll = (status: AttendanceStatus) => {
    setEntries(prev => prev.map(e => ({ ...e, status })));
  };

  // Fetch active academic year
  const { data: academicYearRes } = useQuery({
    queryKey: ['activeAcademicYear'],
    queryFn: () => api.get('/academic/years?current=true'),
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (payload: any) => api.post('/attendance', payload),
    onSuccess: () => {
      setToast({ title: 'Attendance Submitted!', description: 'The daily record has been saved.', variant: 'success' });
    },
    onError: (err: any) => {
      setToast({ title: 'Submission Failed', description: err.message, variant: 'error' });
    },
  });

  const handleSubmit = () => {
    const academicYears = (academicYearRes as any)?.data;
    const activeYear = Array.isArray(academicYears) ? academicYears[0] : academicYears;

    if (!activeYear?._id) {
      setToast({ title: 'No active academic year', description: 'Please set an active academic year first.', variant: 'error' });
      return;
    }

    const payload = {
      academicYearId: activeYear._id,
      classId,
      sectionId,
      dateBS: dateBS || dateAD,
      dateAD: new Date(dateAD).toISOString(),
      type: 'DAILY',
      subjectId: null,
      entries,
    };

    submitMutation.mutate(payload);
  };

  // Clear toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const isReady = classId && sectionId && isInitialized && students.length > 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} variant={toast.variant} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Take Attendance</h2>
          <p className="text-gray-500">Select a class and section, then mark attendance for each student.</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <Select
                id="attendance-class"
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId('');
                  setIsInitialized(false);
                }}
              >
                <option value="">Select Class</option>
                {classes.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <Select
                id="attendance-section"
                value={sectionId}
                onChange={(e) => { setSectionId(e.target.value); setIsInitialized(false); }}
                disabled={!classId}
              >
                <option value="">Select Section</option>
                {sections.map((s: any) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date (AD)</label>
              <Input
                id="attendance-date"
                type="date"
                value={dateAD}
                onChange={(e) => setDateAD(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date (BS)</label>
              <Input
                id="attendance-date-bs"
                value={dateBS}
                onChange={(e) => setDateBS(e.target.value)}
                placeholder="2083-05-06"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {(isLoadingStudents || isLoadingExisting) && classId && sectionId && (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      )}

      {/* Attendance Grid */}
      {isReady && !isLoadingStudents && (
        <>
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')}>
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-success" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => markAll('ABSENT')}>
              <Users className="h-4 w-4 mr-1.5 text-danger" />
              Mark All Absent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEntries(students.map((s: any) => ({ studentId: s._id, status: 'PRESENT' as AttendanceStatus })));
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
          </div>

          <AttendanceGrid
            students={students}
            entries={entries}
            onEntryChange={handleEntryChange}
            disabled={submitMutation.isPending}
          />

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              isLoading={submitMutation.isPending}
              disabled={entries.length === 0}
              className="px-8"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Submit Attendance
            </Button>
          </div>
        </>
      )}

      {/* Prompt to select */}
      {!classId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Select a Class</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Choose a class and section to load the student roster and begin taking attendance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
