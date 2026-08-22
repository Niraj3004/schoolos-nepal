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
  termId: z.string().min(1, "Term is required"),
  name: z.string().min(1, "Exam name is required"),
  startDateBS: z.string().min(1, "Start Date is required"),
  endDateBS: z.string().min(1, "End Date is required"),
});

type FormData = z.infer<typeof schema>;

export default function ExamModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: yearsRes } = useQuery({ queryKey: ['academicYears'], queryFn: () => api.get('/academic/academic-years') });
  const { data: termsRes } = useQuery({ queryKey: ['terms'], queryFn: () => api.get('/academic/terms') });

  const years = (yearsRes as any)?.data || [];
  const terms = (termsRes as any)?.data || [];

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/exam', data);
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to create exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Master Exam">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Exam Name</label>
          <Input {...register("name")} placeholder="e.g. First Terminal Examination 2081" />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

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
            <label className="block text-sm font-medium text-gray-700">Term</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" {...register("termId")}>
              <option value="">Select Term...</option>
              {terms.map((t: any) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            {errors.termId && <p className="mt-1 text-sm text-red-600">{errors.termId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date (BS)</label>
            <Input {...register("startDateBS")} placeholder="YYYY-MM-DD" />
            {errors.startDateBS && <p className="mt-1 text-sm text-red-600">{errors.startDateBS.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date (BS)</label>
            <Input {...register("endDateBS")} placeholder="YYYY-MM-DD" />
            {errors.endDateBS && <p className="mt-1 text-sm text-red-600">{errors.endDateBS.message}</p>}
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-2 border-t mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Create Exam</Button>
        </div>

      </form>
    </Modal>
  );
}
