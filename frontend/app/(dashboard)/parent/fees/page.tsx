"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '@/components/ui/Table';
import { CreditCard, Upload, Info, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function ParentFeesPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // Fetch my invoices
  const { data: invoicesRes, isLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => api.get('/finance/invoices/my'),
  });

  const invoices = (invoicesRes as any)?.data || [];

  // Clear toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge variant="success">Paid</Badge>;
      case 'UNPAID': return <Badge variant="danger">Unpaid</Badge>;
      case 'PARTIALLY_PAID': return <Badge variant="warning">Partial</Badge>;
      case 'PENDING_VERIFICATION': return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} variant={toast.variant} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Fees & Payments</h2>
        <p className="text-gray-500">View your children's fee invoices and submit payment receipts.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="You do not have any pending or past invoices."
          icon={<CreditCard className="h-8 w-8" />}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total Payable</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv._id}>
                  <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {inv.studentId?.firstName} {inv.studentId?.lastName}
                    </div>
                  </TableCell>
                  <TableCell>{inv.monthBS}</TableCell>
                  <TableCell>{inv.dueDateBS}</TableCell>
                  <TableCell className="text-right font-medium text-gray-900">Rs. {inv.totalPayable}</TableCell>
                  <TableCell className="text-right text-success">Rs. {inv.paidAmount}</TableCell>
                  <TableCell className="text-center">{statusBadge(inv.status)}</TableCell>
                  <TableCell className="text-right">
                    {inv.status === 'UNPAID' || inv.status === 'PARTIALLY_PAID' ? (
                      <Button size="sm" onClick={() => setSelectedInvoice(inv)}>Pay Now</Button>
                    ) : inv.status === 'PENDING_VERIFICATION' ? (
                      <Button size="sm" variant="outline" disabled>Verifying</Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-success border-success/30">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Payment Modal */}
      {selectedInvoice && (
        <PaymentModal 
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
            setSelectedInvoice(null);
            setToast({ title: 'Receipt Uploaded!', description: 'Your payment is now pending verification by the school.', variant: 'success' });
          }}
        />
      )}
    </div>
  );
}

function PaymentModal({ invoice, isOpen, onClose, onSuccess }: any) {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [bankName, setBankName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const remainingAmount = invoice.totalPayable - invoice.paidAmount;

  // Auto-fill amount initially
  useEffect(() => {
    if (isOpen) {
      setAmountPaid(String(remainingAmount));
    }
  }, [isOpen, remainingAmount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      setError('Please upload a screenshot of the payment receipt.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('amountPaid', amountPaid);
      formData.append('bankName', bankName);
      formData.append('transactionReference', transactionRef);
      formData.append('receipt', receiptFile);

      await apiFetch(`/finance/invoices/${invoice._id}/upload-slip`, {
        method: 'POST',
        body: formData,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload payment receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Make Payment" className="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Col: School Details */}
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" /> Payment Instructions
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Please transfer the due amount to the school's bank account or scan the QR code using eSewa/Khalti.
            </p>
            <div className="bg-white p-3 rounded border text-sm space-y-1">
              <p><span className="text-gray-500">Bank:</span> <strong>Global IME Bank</strong></p>
              <p><span className="text-gray-500">Account Name:</span> <strong>SchoolOS Demo School</strong></p>
              <p><span className="text-gray-500">Account No:</span> <strong className="font-mono text-primary">01234567890123</strong></p>
              <p><span className="text-gray-500">Branch:</span> <strong>Kathmandu Main</strong></p>
            </div>
            
            <div className="mt-4 flex justify-center">
              {/* Mock QR Code representation */}
              <div className="border-4 border-gray-900 p-2 bg-white rounded-xl inline-block shadow-sm">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay-to-school-123" 
                  alt="QR Code" 
                  className="w-32 h-32"
                />
                <p className="text-center text-xs font-bold mt-2 uppercase tracking-widest text-gray-500">Scan to Pay</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Upload Form */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded border">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Amount Due</p>
              <p className="text-xl font-bold text-gray-900">Rs. {remainingAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold">Invoice</p>
              <p className="font-mono text-sm">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {error && <div className="p-2 bg-danger/10 text-danger text-sm rounded border border-danger/20">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Amount Paid (Rs.) *</label>
            <Input type="number" min="1" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Bank/Wallet Name</label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. eSewa, Global IME" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Transaction Ref</label>
              <Input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="e.g. 0X9A8B7C" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Receipt Screenshot *</label>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center ${receiptPreview ? 'border-primary/50 bg-primary/5' : 'border-gray-300'}`}>
              {receiptPreview ? (
                <div className="space-y-2">
                  <div className="h-32 bg-gray-100 rounded overflow-hidden">
                    <img src={receiptPreview} alt="Preview" className="h-full w-full object-contain" />
                  </div>
                  <label className="text-xs text-primary cursor-pointer hover:underline font-medium block">
                    Change file
                    <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-primary hover:underline">Click to upload</span>
                  <span className="text-xs text-gray-400">JPG or PNG (max. 5MB)</span>
                  <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          isLoading={isSubmitting} 
          disabled={!receiptFile || !amountPaid || Number(amountPaid) <= 0}
        >
          Submit Payment Receipt
        </Button>
      </div>
    </Modal>
  );
}
