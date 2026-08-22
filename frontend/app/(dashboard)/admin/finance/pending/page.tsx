"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShieldCheck, CheckCircle2, XCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PendingVerificationQueue() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pending slips
  const { data: slipsRes, isLoading } = useQuery({
    queryKey: ['pending-slips'],
    queryFn: () => api.get('/finance/slips/pending'),
  });
  const slips = (slipsRes as any)?.data || [];

  // Submit action mutation
  const actionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => api.patch(`/finance/slips/${id}/verify`, payload),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['pending-slips'] });
      setSelectedSlip(null);
      setAction(null);
      setToast({ title: 'Success', description: data.message, variant: 'success' });
    },
    onError: (err: any) => {
      setToast({ title: 'Error', description: err.message, variant: 'error' });
    },
    onSettled: () => setIsSubmitting(false)
  });

  const handleVerify = () => {
    if (!selectedSlip || !action) return;
    setIsSubmitting(true);
    actionMutation.mutate({
      id: selectedSlip._id,
      payload: {
        status: action,
        rejectionReason: action === 'REJECTED' ? rejectionReason : undefined
      }
    });
  };

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
      <div className="flex flex-col gap-4">
        <Link href="/admin/finance" className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Finance
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Verification Queue</h2>
          <p className="text-gray-500">Review and verify payment receipts uploaded by parents.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : slips.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="There are no pending payment receipts to verify."
          icon={<ShieldCheck className="h-8 w-8 text-success" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slips.map((slip: any) => (
            <Card key={slip._id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <div className="aspect-video w-full bg-gray-100 relative group">
                <img 
                  src={slip.receiptImageUrl} 
                  alt="Receipt" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <a href={slip.receiptImageUrl} target="_blank" rel="noreferrer" className="text-white flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full hover:bg-black/70">
                    <ExternalLink className="h-4 w-4" /> View Full Image
                  </a>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Rs. {slip.amountPaid}</h3>
                    <p className="text-xs text-gray-500">Invoice: <span className="font-mono">{slip.invoiceId?.invoiceNumber}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {slip.studentId?.firstName} {slip.studentId?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">ADM: {slip.studentId?.admissionNumber}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-2 rounded-md text-xs text-gray-600 grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-gray-400">Month</span>
                    {slip.invoiceId?.monthBS}
                  </div>
                  <div>
                    <span className="block text-gray-400">Total Payable</span>
                    Rs. {slip.invoiceId?.totalPayable}
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-400">Bank / Ref</span>
                    {slip.bankName || 'N/A'} {slip.transactionReference ? `(${slip.transactionReference})` : ''}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    className="flex-1 bg-success hover:bg-success/90" 
                    onClick={() => { setSelectedSlip(slip); setAction('APPROVED'); }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-danger border-danger/30 hover:bg-danger/10 hover:text-danger"
                    onClick={() => { setSelectedSlip(slip); setAction('REJECTED'); }}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      <Modal 
        isOpen={!!selectedSlip} 
        onClose={() => { setSelectedSlip(null); setAction(null); setRejectionReason(''); }} 
        title={action === 'APPROVED' ? 'Approve Payment' : 'Reject Payment'}
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            {action === 'APPROVED' 
              ? `Are you sure you want to approve this payment of Rs. ${selectedSlip?.amountPaid}? This will update the invoice status.`
              : 'Please provide a reason for rejecting this payment receipt.'}
          </p>

          {action === 'REJECTED' && (
            <div>
              <label className="block text-sm font-medium mb-1">Rejection Reason *</label>
              <Input 
                value={rejectionReason} 
                onChange={(e) => setRejectionReason(e.target.value)} 
                placeholder="e.g. Receipt is blurred, Amount does not match..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => { setSelectedSlip(null); setAction(null); }}>Cancel</Button>
            <Button 
              onClick={handleVerify} 
              isLoading={isSubmitting} 
              variant={action === 'APPROVED' ? 'default' : 'danger'}
              disabled={action === 'REJECTED' && !rejectionReason}
            >
              {action === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
