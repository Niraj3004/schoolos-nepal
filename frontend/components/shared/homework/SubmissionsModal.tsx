"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Paperclip, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeworkId: string | null;
}

export default function SubmissionsModal({ isOpen, onClose, homeworkId }: SubmissionsModalProps) {
  const queryClient = useQueryClient();
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [marks, setMarks] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  const { data: submissionsRes, isLoading } = useQuery({
    queryKey: ['submissions', homeworkId],
    queryFn: () => api.get(`/homework/${homeworkId}/submissions`),
    enabled: !!homeworkId && isOpen,
  });

  const evaluateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.patch(`/homework/submissions/${id}/evaluate`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', homeworkId] });
      setEvaluatingId(null);
      setMarks('');
      setFeedback('');
    }
  });

  const submissions = (submissionsRes as any)?.data || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Submissions" size="lg">
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : submissions.length === 0 ? (
          <EmptyState title="No Submissions Yet" description="Students haven't submitted their homework yet." icon={<CheckCircle className="h-8 w-8 text-gray-400" />} />
        ) : (
          <div className="space-y-4">
            {submissions.map((sub: any) => (
              <div key={sub._id} className="border rounded-lg p-4 bg-white shadow-sm">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{sub.studentId?.firstName} {sub.studentId?.lastName}</h4>
                    <p className="text-xs text-gray-500">Roll No: {sub.studentId?.rollNumber} | Adm: {sub.studentId?.admissionNumber}</p>
                  </div>
                  <Badge variant={sub.status === 'EVALUATED' ? 'success' : 'warning'}>
                    {sub.status}
                  </Badge>
                </div>

                {/* Submission Text */}
                {sub.submissionText && (
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-3">
                    {sub.submissionText}
                  </div>
                )}

                {/* Attachments */}
                {sub.fileUrls?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {sub.fileUrls.map((url: string, idx: number) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded hover:underline">
                        <Paperclip className="h-3 w-3" /> Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                )}

                {/* Evaluation Section */}
                <div className="mt-4 pt-3 border-t">
                  {evaluatingId === sub._id ? (
                    <div className="space-y-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="grid grid-cols-4 gap-3 items-end">
                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Marks</label>
                          <Input type="number" value={marks} onChange={(e) => setMarks(Number(e.target.value))} placeholder="e.g. 10" className="h-8 text-sm" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
                          <Input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Good job!" className="h-8 text-sm" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEvaluatingId(null)}>Cancel</Button>
                        <Button 
                          size="sm" 
                          isLoading={evaluateMutation.isPending}
                          onClick={() => evaluateMutation.mutate({ 
                            id: sub._id, 
                            data: { marksObtained: marks, feedback, status: 'EVALUATED' } 
                          })}
                        >
                          Save Evaluation
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        {sub.status === 'EVALUATED' ? (
                          <p className="text-green-700 font-medium">Marks: {sub.marksObtained} <span className="text-gray-500 font-normal">| {sub.feedback}</span></p>
                        ) : (
                          <p className="text-gray-500 italic">Not evaluated yet</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEvaluatingId(sub._id);
                        setMarks(sub.marksObtained || '');
                        setFeedback(sub.feedback || '');
                      }}>
                        {sub.status === 'EVALUATED' ? 'Edit Grades' : 'Evaluate'}
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
