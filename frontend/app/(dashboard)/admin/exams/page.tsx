"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Plus, Calendar as CalendarIcon, Globe, EyeOff, Pencil, Trash2, BookOpen, CheckCircle } from 'lucide-react';
import ExamModal from '@/components/shared/exam/ExamModal';
import { motion } from 'framer-motion';

export default function AdminExamsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [deletingExam, setDeletingExam] = useState<any>(null);
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);

  const { data: examsRes, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: () => api.get('/exams')
  });
  const exams: any[] = (examsRes as any)?.data || [];

  // Publish toggle mutation
  const publishMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/exams/${id}/publish`, {}),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      const msg = (res as any)?.message || 'Status updated';
      setToast({ title: msg, variant: 'success' });
    },
    onError: (err: any) => setToast({ title: 'Failed', description: err.message, variant: 'error' }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/exams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setDeletingExam(null);
      setToast({ title: 'Exam Deleted', description: 'The exam and all its marks have been removed.', variant: 'success' });
    },
    onError: (err: any) => setToast({ title: 'Delete Failed', description: err.message, variant: 'error' }),
  });

  // Auto-clear toast
  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const published = exams.filter(e => e.isPublished);
  const drafts = exams.filter(e => !e.isPublished);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} variant={toast.variant} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Exam Management</h2>
          <p className="text-gray-500">Create, publish, and manage school examinations.</p>
        </div>
        <Button onClick={() => { setEditingExam(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Create Exam
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Exams', val: exams.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Published', val: published.length, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Drafts', val: drafts.length, icon: EyeOff, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{isLoading ? '—' : s.val}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Examinations</CardTitle>
          <CardDescription>Manage exams, toggle publishing, and enter marks.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : error ? (
            <div className="text-danger p-4 bg-red-50 rounded-lg m-4">Failed to load exams.</div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <BookOpen className="h-12 w-12 mb-3 opacity-40" />
              <p className="font-medium">No exams created yet.</p>
              <p className="text-sm mt-1">Click "Create Exam" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3">Exam Name</th>
                    <th className="px-6 py-3">Academic Year</th>
                    <th className="px-6 py-3">Term</th>
                    <th className="px-6 py-3">Dates (BS)</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((exam: any) => (
                    <motion.tr
                      key={exam._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{exam.name}</td>
                      <td className="px-6 py-4 text-slate-600">{exam.academicYearId?.name}</td>
                      <td className="px-6 py-4 text-slate-600">{exam.termId?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <CalendarIcon className="w-3 h-3" />
                          {exam.startDateBS} → {exam.endDateBS}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {exam.isPublished
                          ? <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1 inline" />Published</Badge>
                          : <Badge variant="warning">Draft</Badge>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {/* Publish Toggle */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => publishMutation.mutate(exam._id)}
                            isLoading={publishMutation.isPending && publishMutation.variables === exam._id}
                            className={`text-xs ${exam.isPublished ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                          >
                            {exam.isPublished ? <><EyeOff className="h-3 w-3 mr-1" />Unpublish</> : <><Globe className="h-3 w-3 mr-1" />Publish</>}
                          </Button>
                          {/* Edit */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingExam(exam); setIsModalOpen(true); }}
                            className="text-xs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {/* Delete */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeletingExam(exam)}
                            className="text-xs text-red-500 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <ExamModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingExam(null); }}
        exam={editingExam}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['exams'] });
          setIsModalOpen(false);
          setEditingExam(null);
          setToast({ title: editingExam ? 'Exam Updated' : 'Exam Created', variant: 'success' });
        }}
      />

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deletingExam}
        onClose={() => setDeletingExam(null)}
        title="Delete Exam"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <Trash2 className="h-6 w-6 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">Delete "{deletingExam?.name}"?</p>
              <p className="text-sm text-slate-500 mt-0.5">This will permanently remove the exam and all associated marks. This action cannot be undone.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeletingExam(null)}>Cancel</Button>
            <Button
              onClick={() => deleteMutation.mutate(deletingExam._id)}
              isLoading={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
