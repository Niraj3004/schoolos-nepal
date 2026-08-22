"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import SubmissionsModal from '@/components/shared/homework/SubmissionsModal';
import { Plus, BookOpen, Paperclip, Trash2, Calendar, Users, ExternalLink, X, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function TeacherHomeworkPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  
  // State for filtering viewed homework
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');

  // Fetch Teacher's allocated classes
  const { data: allocationsRes } = useQuery({
    queryKey: ['myAllocations'],
    queryFn: () => api.get('/academic/allocations/my-classes'),
  });
  const allocations = (allocationsRes as any)?.data || [];

  // Extract unique classes for filter
  const uniqueClasses = Array.from(new Map(allocations.map((item: any) => [item.classId?._id, item.classId])).values()) as any[];
  
  // Extract sections based on selected class filter
  const availableSections = allocations
    .filter((a: any) => a.classId?._id === filterClassId)
    .map((a: any) => a.sectionId)
    .filter((v: any, i: number, a: any[]) => a.findIndex(t => (t._id === v._id)) === i); // Unique sections

  // Fetch homework
  const { data: homeworkRes, isLoading } = useQuery({
    queryKey: ['homework', filterClassId, filterSectionId],
    queryFn: () => api.get(`/homework/class?classId=${filterClassId}&sectionId=${filterSectionId}`),
    enabled: !!filterClassId && !!filterSectionId,
  });
  
  const homeworks = (homeworkRes as any)?.data || [];

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/homework/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      setToast({ title: 'Deleted', description: 'Homework removed successfully.', variant: 'success' });
    }
  });

  // Clear toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Homework Assignments</h2>
          <p className="text-gray-500">Post assignments, attach files, and manage submissions.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterClassId} onChange={(e) => { setFilterClassId(e.target.value); setFilterSectionId(''); }} className="flex-1">
              <option value="">Select Class to View</option>
              {uniqueClasses.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
            <Select 
              value={filterSectionId} 
              onChange={(e) => setFilterSectionId(e.target.value)} 
              className="flex-1"
              disabled={!filterClassId}
            >
              <option value="">Select Section</option>
              {availableSections.map((s: any) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {!filterClassId || !filterSectionId ? (
         <EmptyState
          title="Select a Class and Section"
          description="Please choose a class and section above to view posted homework."
          icon={<BookOpen className="h-8 w-8 text-gray-400" />}
        />
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : homeworks.length === 0 ? (
        <EmptyState
          title="No Homework Found"
          description="You haven't posted any homework for this section yet."
          icon={<BookOpen className="h-8 w-8 text-gray-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homeworks.map((hw: any) => (
            <Card key={hw._id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{hw.title}</h3>
                  <Badge variant="default" className="bg-primary/5 text-primary shrink-0">{hw.subjectId?.name}</Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{hw.description}</p>
                
                <div className="space-y-2 text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> 
                    <span>Due: <span className="font-medium text-danger">{hw.dueDateBS}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> 
                    <span>{hw.classId?.name} - {hw.sectionId?.name}</span>
                  </div>
                </div>

                {hw.attachments?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Attachments</p>
                    <div className="space-y-1">
                      {hw.attachments.map((att: any, idx: number) => (
                        <a 
                          key={idx} 
                          href={att.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline bg-primary/5 p-2 rounded-md"
                        >
                          <Paperclip className="h-3 w-3 shrink-0" />
                          <span className="truncate">{att.filename || 'Attachment'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedHomeworkId(hw._id);
                      setSubmissionsModalOpen(true);
                    }}
                  >
                    <ListChecks className="w-4 h-4 mr-1" /> Submissions
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-danger hover:bg-danger hover:text-white border-danger/30"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this homework?')) {
                        deleteMutation.mutate(hw._id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateHomeworkModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          allocations={allocations}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['homework'] });
            setShowCreateModal(false);
            setToast({ title: 'Success', description: 'Homework created successfully.', variant: 'success' });
          }}
        />
      )}

      <SubmissionsModal 
        isOpen={submissionsModalOpen} 
        onClose={() => {
          setSubmissionsModalOpen(false);
          setSelectedHomeworkId(null);
        }} 
        homeworkId={selectedHomeworkId} 
      />
    </div>
  );
}

function CreateHomeworkModal({ isOpen, onClose, allocations, onSuccess }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allocationId, setAllocationId] = useState('');
  const [dueDateBS, setDueDateBS] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        setError('Maximum 5 files allowed.');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title || !description || !allocationId || !dueDateBS) {
      setError('Please fill all required fields.');
      return;
    }
    
    const allocation = allocations.find((a: any) => a._id === allocationId);
    if (!allocation) return;

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('classId', allocation.classId._id);
      formData.append('sectionId', allocation.sectionId._id);
      formData.append('subjectId', allocation.subjectId._id);
      formData.append('dueDateBS', dueDateBS);

      files.forEach(f => formData.append('attachments', f));

      await apiFetch('/homework', {
        method: 'POST',
        body: formData,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create homework.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Homework Assignment" className="max-w-2xl">
      {error && <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-md border border-danger/20">{error}</div>}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Class/Subject *</label>
          <Select value={allocationId} onChange={(e) => setAllocationId(e.target.value)}>
            <option value="">Select Assignment Scope</option>
            {allocations.map((a: any) => (
              <option key={a._id} value={a._id}>
                {a.classId.name} - {a.sectionId.name} ({a.subjectId.name})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 4 Exercises" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={4}
            placeholder="Instructions for the students..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date (BS) *</label>
          <Input value={dueDateBS} onChange={(e) => setDueDateBS(e.target.value)} placeholder="e.g. 2083-01-15" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Attachments (Optional, Max 5)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
            <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
              <Paperclip className="h-6 w-6 text-gray-400" />
              <span className="text-sm font-medium text-primary hover:underline">Click to browse files</span>
              <span className="text-xs text-gray-400">PDFs, Images, or Documents</span>
              <input type="file" multiple accept=".pdf,image/*,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Paperclip className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(idx)} className="text-gray-500 hover:text-danger p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!title || !description || !allocationId || !dueDateBS}>
          Post Homework
        </Button>
      </div>
    </Modal>
  );
}
