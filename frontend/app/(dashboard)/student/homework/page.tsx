"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen, Paperclip, Upload, CheckCircle2, Calendar, User, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function StudentHomeworkPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);

  // For STUDENTS, the backend automatically infers classId and sectionId from their profile.
  const { data: homeworkRes, isLoading } = useQuery({
    queryKey: ['my-homework'],
    queryFn: () => api.get('/homework/class'),
  });
  
  const homeworks = (homeworkRes as any)?.data || [];

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Homework</h2>
        <p className="text-gray-500">View your class assignments, download attachments, and upload your work.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : homeworks.length === 0 ? (
        <EmptyState
          title="No Homework Due!"
          description="Your teachers have not posted any new assignments."
          icon={<CheckCircle2 className="h-8 w-8 text-success" />}
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
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{hw.description}</p>
                
                <div className="space-y-2 text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-md border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due Date</span>
                    <span className="font-semibold text-danger">{hw.dueDateBS}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> Teacher</span>
                    <span className="font-medium text-gray-700">{hw.teacherId?.name}</span>
                  </div>
                </div>

                {hw.attachmentUrls?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Attachments</p>
                    <div className="space-y-1">
                      {hw.attachmentUrls.map((url: string, idx: number) => (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline bg-primary/5 p-2 rounded-md"
                        >
                          <Paperclip className="h-3 w-3 shrink-0" />
                          <span className="truncate">Download Resource {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t">
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => setSelectedHomework(hw)}
                  >
                    <Upload className="h-4 w-4" /> Submit Homework
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {selectedHomework && (
        <SubmitHomeworkModal 
          homework={selectedHomework}
          isOpen={!!selectedHomework}
          onClose={() => setSelectedHomework(null)}
          onSuccess={() => {
            setSelectedHomework(null);
            setToast({ title: 'Submitted', description: 'Your homework has been submitted to the teacher.', variant: 'success' });
          }}
        />
      )}
    </div>
  );
}

function SubmitHomeworkModal({ homework, isOpen, onClose, onSuccess }: any) {
  const [comments, setComments] = useState('');
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
    if (files.length === 0) {
      setError('Please upload at least one file for your submission.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      if (comments) formData.append('comments', comments);
      files.forEach(f => formData.append('files', f));

      await apiFetch(`/homework/${homework._id}/submit`, {
        method: 'POST',
        body: formData,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit homework.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Homework" className="max-w-xl">
      {error && <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-md border border-danger/20">{error}</div>}
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100 mb-4">
          <h4 className="font-semibold text-gray-900">{homework.title}</h4>
          <p className="text-xs text-gray-500 mt-1">Due: {homework.dueDateBS}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Files (Max 5) *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-sm font-medium text-primary hover:underline">Click to browse files</span>
              <span className="text-xs text-gray-400">PDFs, Images, or Documents</span>
              <input type="file" multiple accept=".pdf,image/*,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm border border-gray-200">
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

        <div>
          <label className="block text-sm font-medium mb-1">Add a Comment (Optional)</label>
          <textarea 
            value={comments} 
            onChange={(e) => setComments(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
            placeholder="Type any notes for your teacher here..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={files.length === 0}>
          Confirm Submission
        </Button>
      </div>
    </Modal>
  );
}
