"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';

const schema = z.object({
  academicYearId: z.string().min(1, "Academic Year is required"),
  classId: z.string().min(1, "Class is required"),
  monthBS: z.string().min(1, "Month is required"),
  dueDateBS: z.string().min(1, "Due Date is required"),
});

type FormData = z.infer<typeof schema>;

export default function GenerateInvoiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: yearsRes } = useQuery({ queryKey: ['academicYears'], queryFn: () => api.get('/academic/academic-years') });
  const { data: classesRes } = useQuery({ queryKey: ['classes'], queryFn: () => api.get('/academic/classes') });

  const years = (yearsRes as any)?.data || [];
  const classes = (classesRes as any)?.data || [];

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/finance/invoices/generate-monthly', data);
      alert(`Generated ${(res as any).data.generatedCount} invoices successfully.`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      reset();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to generate invoices. Ensure fee structure is defined for this class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Monthly Invoices">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Year</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" {...register("academicYearId")}>
              <option value="">Select Year...</option>
              {years.map((y: any) => (
                <option key={y._id} value={y._id}>{y.name} {y.isCurrent && '(Current)'}</option>
              ))}
            </select>
            {errors.academicYearId && <p className="mt-1 text-sm text-red-600">{errors.academicYearId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" {...register("classId")}>
              <option value="">Select Class...</option>
              {classes.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Billing Month (BS)</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" {...register("monthBS")}>
              <option value="">Select Month...</option>
              {['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {errors.monthBS && <p className="mt-1 text-sm text-red-600">{errors.monthBS.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date (BS)</label>
            <Input {...register("dueDateBS")} placeholder="YYYY-MM-DD" />
            {errors.dueDateBS && <p className="mt-1 text-sm text-red-600">{errors.dueDateBS.message}</p>}
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-2 border-t mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Generate Invoices</Button>
        </div>

      </form>
    </Modal>
  );
}
