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
  name: z.string().min(1, "Name is required"),
  startDateBS: z.string().min(1, "Start Date (BS) is required"),
  endDateBS: z.string().min(1, "End Date (BS) is required"),
  isCurrent: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function AcademicYearModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/academic/academic-years', data);
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to create academic year');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Academic Year">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Year Name</label>
          <Input placeholder="e.g. 2083/2084" {...register("name")} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
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

        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="isCurrent" 
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            {...register("isCurrent")} 
          />
          <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-900">
            Set as Current Academic Year
          </label>
        </div>

        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save Year</Button>
        </div>

      </form>
    </Modal>
  );
}
