"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import GenerateInvoiceModal from '@/components/shared/finance/GenerateInvoiceModal';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '@/components/ui/Table';
import { FileText, Plus, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminFinancePage() {
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState('');
  const [monthBS, setMonthBS] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; description?: string; variant: 'success' | 'error' } | null>(null);
  const limit = 10;

  // Fetch classes
  const { data: classesRes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academic/classes'),
  });
  const classes = (classesRes as any)?.data || [];

  // Fetch active academic year
  const { data: academicYearRes } = useQuery({
    queryKey: ['activeAcademicYear'],
    queryFn: () => api.get('/academic/years?current=true'),
  });
  const academicYears = (academicYearRes as any)?.data;
  const activeYear = Array.isArray(academicYears) ? academicYears[0] : academicYears;

  // Fetch invoices
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (classId) queryParams.set('classId', classId);
  if (monthBS) queryParams.set('monthBS', monthBS);
  if (statusFilter) queryParams.set('status', statusFilter);

  const { data: invoicesRes, isLoading } = useQuery({
    queryKey: ['invoices', page, classId, monthBS, statusFilter],
    queryFn: () => api.get(`/finance/invoices?${queryParams.toString()}`),
  });

  const invoices = (invoicesRes as any)?.data?.invoices || [];
  const total = (invoicesRes as any)?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Finance & Invoicing</h2>
          <p className="text-gray-500">Manage student fees and generate monthly invoices.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/finance/pending">
            <Button variant="outline" className="gap-2">
              <ShieldCheck className="h-4 w-4 text-warning" />
              Verification Queue
            </Button>
          </Link>
          <Button onClick={() => setShowGenerateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Invoices
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={classId} onChange={(e) => { setClassId(e.target.value); setPage(1); }} className="flex-1">
              <option value="">All Classes</option>
              {classes.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
            <Input
              value={monthBS}
              onChange={(e) => { setMonthBS(e.target.value); setPage(1); }}
              placeholder="Month BS (e.g., Baishakh)"
              className="flex-1"
            />
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="flex-1">
              <option value="">All Status</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <GenerateInvoiceModal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} />

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Try adjusting your filters or generate new monthly invoices."
          icon={<FileText className="h-8 w-8" />}
        />
      ) : (
        <>
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
                    <div className="text-xs text-gray-500">ADM: {inv.studentId?.admissionNumber}</div>
                  </TableCell>
                  <TableCell>{inv.monthBS}</TableCell>
                  <TableCell>{inv.dueDateBS}</TableCell>
                  <TableCell className="text-right font-medium text-gray-900">Rs. {inv.totalPayable}</TableCell>
                  <TableCell className="text-right text-success">Rs. {inv.paidAmount}</TableCell>
                  <TableCell className="text-center">{statusBadge(inv.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Generate Invoices Modal */}
      <GenerateInvoicesModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        classes={classes}
        activeYearId={activeYear?._id}
        onSuccess={(count: number) => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          setShowGenerateModal(false);
          setToast({ title: 'Success', description: `Generated ${count} invoices successfully.`, variant: 'success' });
        }}
      />
    </div>
  );
}

function GenerateInvoicesModal({ isOpen, onClose, classes, activeYearId, onSuccess }: any) {
  const [classId, setClassId] = useState('');
  const [monthBS, setMonthBS] = useState('');
  const [dueDateBS, setDueDateBS] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitMutation = useMutation({
    mutationFn: (payload: any) => api.post('/finance/invoices/generate-monthly', payload),
    onSuccess: (data: any) => onSuccess(data.data.generatedCount),
    onError: (err: any) => setError(err.message),
    onSettled: () => setIsSubmitting(false)
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    setError('');
    submitMutation.mutate({
      academicYearId: activeYearId,
      classId,
      monthBS,
      dueDateBS
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Monthly Invoices">
      {error && <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-md">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Class *</label>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map((c: any) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
          <p className="text-xs text-gray-500 mt-1">Fee structure must be defined for this class.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fee Month (BS) *</label>
          <Input value={monthBS} onChange={(e) => setMonthBS(e.target.value)} placeholder="e.g. Baishakh" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Date (BS) *</label>
          <Input value={dueDateBS} onChange={(e) => setDueDateBS(e.target.value)} placeholder="e.g. 2083-01-15" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!classId || !monthBS || !dueDateBS}>
          Generate
        </Button>
      </div>
    </Modal>
  );
}
