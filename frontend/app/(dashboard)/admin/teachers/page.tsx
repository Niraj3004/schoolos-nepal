"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
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
  Search, Plus, Users, ChevronLeft, ChevronRight, UserPlus, Phone, MapPin
} from 'lucide-react';

type TeacherStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';

const STATUS_BADGE_MAP: Record<TeacherStatus, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  ACTIVE: { variant: 'success', label: 'Active' },
  ON_LEAVE: { variant: 'warning', label: 'On Leave' },
  TERMINATED: { variant: 'danger', label: 'Terminated' },
};

export default function AdminTeachersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; variant: 'success' | 'error' } | null>(null);
  const limit = 10;

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch teachers
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (debouncedSearch) queryParams.set('search', debouncedSearch);

  const { data: teachersRes, isLoading } = useQuery({
    queryKey: ['teachers', page, debouncedSearch],
    queryFn: () => api.get(`/staff/teachers?${queryParams.toString()}`),
  });

  const teachers = (teachersRes as any)?.data?.teachers || [];
  const total = (teachersRes as any)?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Clear toast
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
        <div className="fixed top-4 right-4 z-50">
          <Toast title={toast.title} variant={toast.variant} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Teachers</h2>
          <p className="text-gray-500">Manage teaching staff and their assignments.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} id="add-teacher-btn">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="teacher-search"
              placeholder="Search by name or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          title="No teachers found"
          description={debouncedSearch ? "Try adjusting your search." : "Start by adding your first teacher."}
          icon={<Users className="h-8 w-8" />}
          action={
            !debouncedSearch ? (
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher: any) => {
                const statusInfo = STATUS_BADGE_MAP[teacher.status as TeacherStatus] || STATUS_BADGE_MAP.ACTIVE;
                return (
                  <TableRow key={teacher._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {teacher.avatarUrl ? (
                          <img
                            src={teacher.avatarUrl}
                            alt={`${teacher.firstName} ${teacher.lastName}`}
                            className="h-9 w-9 rounded-full object-cover border-2 border-gray-100"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-[#f4b400]/10 flex items-center justify-center text-[#f4b400] font-semibold text-sm">
                            {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{teacher.firstName} {teacher.lastName}</p>
                          <p className="text-xs text-gray-500">{teacher.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{teacher.employeeId}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{teacher.designation}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5" />
                        {teacher.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{teacher.joinDateBS || '—'}</span>
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
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} teachers
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) { pageNum = i + 1; }
                  else if (page <= 3) { pageNum = i + 1; }
                  else if (page >= totalPages - 2) { pageNum = totalPages - 4 + i; }
                  else { pageNum = page - 2 + i; }
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
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['teachers'] });
          setShowAddModal(false);
          setToast({ title: 'Teacher added successfully!', variant: 'success' });
        }}
      />
    </div>
  );
}

/* ─────────── Add Teacher Modal ─────────── */

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddTeacherModal({ isOpen, onClose, onSuccess }: AddTeacherModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', employeeId: '', phone: '',
    department: 'ACADEMIC', designation: 'TEACHER',
    address: '', joinDateBS: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/staff/teachers', form);
      setForm({
        firstName: '', lastName: '', employeeId: '', phone: '',
        department: 'ACADEMIC', designation: 'TEACHER',
        address: '', joinDateBS: '',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Teacher" className="max-w-lg">
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <Input value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)} placeholder="Hari" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <Input value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)} placeholder="Prasad" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
            <Input value={form.employeeId} onChange={(e) => updateForm('employeeId', e.target.value)} placeholder="EMP-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <Input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="98XXXXXXXX" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <Select value={form.department} onChange={(e) => updateForm('department', e.target.value)}>
              <option value="ACADEMIC">Academic</option>
              <option value="ADMINISTRATIVE">Administrative</option>
              <option value="SUPPORT">Support</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <Select value={form.designation} onChange={(e) => updateForm('designation', e.target.value)}>
              <option value="TEACHER">Teacher</option>
              <option value="HEAD_TEACHER">Head Teacher</option>
              <option value="COORDINATOR">Coordinator</option>
              <option value="VICE_PRINCIPAL">Vice Principal</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <Input value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Lalitpur" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Join Date (BS)</label>
          <Input value={form.joinDateBS} onChange={(e) => updateForm('joinDateBS', e.target.value)} placeholder="2080-01-15" />
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!form.firstName || !form.lastName || !form.employeeId || !form.phone}
        >
          Add Teacher
        </Button>
      </div>
    </Modal>
  );
}
