"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toast } from '@/components/ui/Toast';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '@/components/ui/Table';
import {
  Search, Plus, Users, ChevronLeft, ChevronRight, Upload, Eye, UserPlus
} from 'lucide-react';

type StudentStatus = 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED' | 'SUSPENDED';

const STATUS_BADGE_MAP: Record<StudentStatus, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
  ENROLLED: { variant: 'success', label: 'Enrolled' },
  TRANSFERRED: { variant: 'default', label: 'Transferred' },
  GRADUATED: { variant: 'default', label: 'Graduated' },
  SUSPENDED: { variant: 'danger', label: 'Suspended' },
};

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; variant: 'success' | 'error' } | null>(null);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch classes for filter dropdown
  const { data: classesRes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academic/classes'),
  });

  // Fetch sections filtered by class
  const { data: sectionsRes } = useQuery({
    queryKey: ['sections', classFilter],
    queryFn: () => api.get(`/academic/sections?classId=${classFilter}`),
    enabled: !!classFilter,
  });

  const classes = (classesRes as any)?.data || [];
  const sections = (sectionsRes as any)?.data || [];

  // Fetch students
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (debouncedSearch) queryParams.set('search', debouncedSearch);
  if (classFilter) queryParams.set('classId', classFilter);
  if (sectionFilter) queryParams.set('sectionId', sectionFilter);
  if (statusFilter) queryParams.set('status', statusFilter);

  const { data: studentsRes, isLoading } = useQuery({
    queryKey: ['students', page, debouncedSearch, classFilter, sectionFilter, statusFilter],
    queryFn: () => api.get(`/students?${queryParams.toString()}`),
  });

  const students = (studentsRes as any)?.data?.students || [];
  const total = (studentsRes as any)?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Status toggle mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/students/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setToast({ title: 'Student status updated', variant: 'success' });
    },
    onError: () => {
      setToast({ title: 'Failed to update status', variant: 'error' });
    },
  });

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ENROLLED' ? 'SUSPENDED' : 'ENROLLED';
    statusMutation.mutate({ id, status: newStatus });
  };

  // Clear toast after 3s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <Toast
            title={toast.title}
            variant={toast.variant}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Students</h2>
          <p className="text-gray-500">Manage student enrollment and records.</p>
        </div>
        <Button onClick={() => setShowEnrollModal(true)} id="enroll-student-btn">
          <UserPlus className="mr-2 h-4 w-4" />
          Enroll Student
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="student-search"
                placeholder="Search by name or admission #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              id="class-filter"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setSectionFilter('');
                setPage(1);
              }}
            >
              <option value="">All Classes</option>
              {classes.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
            <Select
              id="section-filter"
              value={sectionFilter}
              onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }}
              disabled={!classFilter}
            >
              <option value="">All Sections</option>
              {sections.map((s: any) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Select>
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="ENROLLED">Enrolled</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="GRADUATED">Graduated</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          description={debouncedSearch ? "Try adjusting your search or filters." : "Start by enrolling your first student."}
          icon={<Users className="h-8 w-8" />}
          action={
            !debouncedSearch ? (
              <Button onClick={() => setShowEnrollModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Enroll Student
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission #</TableHead>
                <TableHead>Class / Section</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => {
                const statusInfo = STATUS_BADGE_MAP[student.status as StudentStatus] || STATUS_BADGE_MAP.ENROLLED;
                return (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="h-9 w-9 rounded-full object-cover border-2 border-gray-100"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-gray-500">Roll #{student.rollNumber || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{student.admissionNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {student.currentClassId?.name || '—'} / {student.currentSectionId?.name || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{student.gender?.toLowerCase()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(student._id, student.status)}
                          disabled={statusMutation.isPending}
                          className="text-xs"
                        >
                          {student.status === 'ENROLLED' ? 'Suspend' : 'Re-enroll'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} students
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Enroll Student Modal */}
      <EnrollStudentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        classes={classes}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['students'] });
          setShowEnrollModal(false);
          setToast({ title: 'Student enrolled successfully!', variant: 'success' });
        }}
      />
    </div>
  );
}

/* ─────────── Enroll Student Modal ─────────── */

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: any[];
  onSuccess: () => void;
}

function EnrollStudentModal({ isOpen, onClose, classes, onSuccess }: EnrollModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [form, setForm] = useState({
    // Student
    firstName: '', lastName: '', admissionNumber: '', rollNumber: '',
    gender: 'MALE', dobBS: '', bloodGroup: '', address: '',
    // Academic
    currentClassId: '', currentSectionId: '',
    // Parent
    fatherName: '', motherName: '', primaryPhone: '',
    secondaryPhone: '', parentOccupation: '', parentAddress: '',
  });

  // Fetch sections for selected class
  const { data: sectionsRes } = useQuery({
    queryKey: ['modal-sections', selectedClassId],
    queryFn: () => api.get(`/academic/sections?classId=${selectedClassId}`),
    enabled: !!selectedClassId,
  });

  const sections = (sectionsRes as any)?.data || [];

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'currentClassId') {
      setSelectedClassId(value);
      setForm(prev => ({ ...prev, currentClassId: value, currentSectionId: '' }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      // Add all form fields
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      // Add avatar
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await api.post('/students/enroll', formData);

      // Reset
      setStep(1);
      setForm({
        firstName: '', lastName: '', admissionNumber: '', rollNumber: '',
        gender: 'MALE', dobBS: '', bloodGroup: '', address: '',
        currentClassId: '', currentSectionId: '',
        fatherName: '', motherName: '', primaryPhone: '',
        secondaryPhone: '', parentOccupation: '', parentAddress: '',
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setSelectedClassId('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset on close
  const handleClose = () => {
    setStep(1);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Enroll Student" className="max-w-lg">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
              ${s === step ? 'bg-primary text-white' : s < step ? 'bg-success text-white' : 'bg-gray-200 text-gray-500'}
            `}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-success' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 mb-4">
        {step === 1 && 'Student Information'}
        {step === 2 && 'Academic Details'}
        {step === 3 && 'Parent / Guardian'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Student Info */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover border-2 border-primary" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center text-sm font-medium text-primary hover:underline">
                Upload Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <Input value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)} placeholder="Ram" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <Input value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)} placeholder="Sharma" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission # *</label>
              <Input value={form.admissionNumber} onChange={(e) => updateForm('admissionNumber', e.target.value)} placeholder="ADM-2083-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <Input type="number" value={form.rollNumber} onChange={(e) => updateForm('rollNumber', e.target.value)} placeholder="1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <Select value={form.gender} onChange={(e) => updateForm('gender', e.target.value)}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (BS)</label>
              <Input value={form.dobBS} onChange={(e) => updateForm('dobBS', e.target.value)} placeholder="2068-01-15" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <Select value={form.bloodGroup} onChange={(e) => updateForm('bloodGroup', e.target.value)}>
                <option value="">Select</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Input value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Kathmandu" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Academic Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
            <Select value={form.currentClassId} onChange={(e) => updateForm('currentClassId', e.target.value)}>
              <option value="">Select Class</option>
              {classes.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
            <Select
              value={form.currentSectionId}
              onChange={(e) => updateForm('currentSectionId', e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">Select Section</option>
              {sections.map((s: any) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Select>
            {!selectedClassId && <p className="text-xs text-gray-400 mt-1">Select a class first</p>}
          </div>
        </div>
      )}

      {/* Step 3: Parent Details */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
              <Input value={form.fatherName} onChange={(e) => updateForm('fatherName', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
              <Input value={form.motherName} onChange={(e) => updateForm('motherName', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone *</label>
              <Input value={form.primaryPhone} onChange={(e) => updateForm('primaryPhone', e.target.value)} placeholder="98XXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
              <Input value={form.secondaryPhone} onChange={(e) => updateForm('secondaryPhone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <Input value={form.parentOccupation} onChange={(e) => updateForm('parentOccupation', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Address</label>
            <Input value={form.parentAddress} onChange={(e) => updateForm('parentAddress', e.target.value)} />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && (!form.firstName || !form.lastName || !form.admissionNumber || !form.gender)) ||
              (step === 2 && (!form.currentClassId || !form.currentSectionId))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!form.primaryPhone}
          >
            Enroll Student
          </Button>
        )}
      </div>
    </Modal>
  );
}
