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
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store';
import { Bell, AlertTriangle, Paperclip, Plus, Calendar, Clock, Download } from 'lucide-react';

export default function NoticesPage() {
  const { role } = useAuthStore();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch notices
  const { data: noticesRes, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => api.get('/communication/notices'),
  });
  
  const notices = (noticesRes as any)?.data?.notices || [];

  // Clear toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} variant={toast.variant} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Notice Board</h2>
          <p className="text-gray-500">Important announcements and updates from the school.</p>
        </div>
        {(role === 'SUPERADMIN' || role === 'ADMIN' || role === 'TEACHER') && (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Post Notice
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : notices.length === 0 ? (
        <EmptyState
          title="No Notices"
          description="There are no active notices or announcements at this time."
          icon={<Bell className="h-8 w-8 text-gray-400" />}
        />
      ) : (
        <div className="space-y-4">
          {notices.map((notice: any) => (
            <Card key={notice._id} className={`overflow-hidden transition-all hover:shadow-md ${notice.isUrgent ? 'border-danger/30' : ''}`}>
              {notice.isUrgent && (
                <div className="bg-danger text-white text-xs font-bold uppercase tracking-wider px-4 py-1 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" /> Urgent Notice
                </div>
              )}
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{notice.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notice.postedBy && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                          By: {notice.postedBy.name || 'Admin'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {notice.attachmentUrl && (
                    <a 
                      href={notice.attachmentUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
                    >
                      <Download className="h-4 w-4" />
                      View Attachment
                    </a>
                  )}
                </div>

                <div 
                  className="prose prose-sm sm:prose-base max-w-none text-gray-700" 
                  dangerouslySetInnerHTML={{ __html: notice.content }} 
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateNoticeModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
            setShowCreateModal(false);
            setToast({ title: 'Success', description: 'Notice broadcasted successfully.', variant: 'success' });
          }}
        />
      )}
    </div>
  );
}

function CreateNoticeModal({ isOpen, onClose, onSuccess }: any) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      setError('Title and Content are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('isUrgent', String(isUrgent));
      formData.append('targetAudience', JSON.stringify([targetAudience]));
      
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await apiFetch('/communication/notices', {
        method: 'POST',
        body: formData,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to post notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Broadcast Notice" className="max-w-2xl">
      {error && <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-md border border-danger/20">{error}</div>}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Notice Title *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. School Closed on Friday" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content (HTML allowed) *</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={6}
            placeholder="Write your announcement here..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Target Audience</label>
            <Select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}>
              <option value="ALL">Everyone</option>
              <option value="TEACHERS">Teachers Only</option>
              <option value="STUDENTS">Students Only</option>
              <option value="PARENTS">Parents Only</option>
            </Select>
          </div>
          
          <div className="flex items-center h-full pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isUrgent} 
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-danger focus:ring-danger"
              />
              <span className="text-sm font-medium text-gray-700">Mark as Urgent</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Attachment (Optional)</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors border">
              <Paperclip className="h-4 w-4" />
              {attachment ? attachment.name : 'Choose File'}
              <input type="file" accept=".pdf,image/*,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </label>
            {attachment && (
              <button onClick={() => setAttachment(null)} className="text-sm text-danger hover:underline">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!title || !content}>
          Broadcast Notice
        </Button>
      </div>
    </Modal>
  );
}
