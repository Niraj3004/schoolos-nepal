"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  academicYearId: z.string().min(1, "Academic Year is required"),
  name: z.string().min(1, "Name is required"),
  termOrder: z.coerce.number().int().min(1, "Term order is required"),
  startDateBS: z.string().min(1, "Start Date (BS) is required"),
  endDateBS: z.string().min(1, "End Date (BS) is required"),
});

type FormData = z.infer<typeof schema>;

export default function TermModal({ isOpen, onClose, years }: { isOpen: boolean; onClose: () => void; years: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/academic/terms', data);
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to create term');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Term">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Academic Year</label>
          <select 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
            {...register("academicYearId")}
          >
            <option value="">Select Year...</option>
            {years.map((y) => (
              <option key={y._id} value={y._id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
            ))}
          </select>
          {errors.academicYearId && <p className="mt-1 text-sm text-red-600">{errors.academicYearId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Term Name</label>
            <Input placeholder="e.g. First Term" {...register("name")} />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Term Order</label>
            <Input type="number" placeholder="e.g. 1" {...register("termOrder")} />
            {errors.termOrder && <p className="mt-1 text-sm text-red-600">{errors.termOrder.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date (BS)</label>
            <Input type="date" {...register("startDateBS")} />
            {errors.startDateBS && <p className="mt-1 text-sm text-red-600">{errors.startDateBS.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date (BS)</label>
            <Input type="date" {...register("endDateBS")} />
            {errors.endDateBS && <p className="mt-1 text-sm text-red-600">{errors.endDateBS.message}</p>}
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save Term</Button>
        </div>

      </form>
    </Modal>
  );
}
