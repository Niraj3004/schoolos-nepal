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
  code: z.string().min(1, "Code is required"),
  creditHours: z.coerce.number().min(1, "Credit hours are required"),
  theoryFullMarks: z.coerce.number().min(0),
  theoryPassMarks: z.coerce.number().min(0),
  practicalFullMarks: z.coerce.number().min(0),
  practicalPassMarks: z.coerce.number().min(0),
  isOptional: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function SubjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      theoryFullMarks: 75,
      theoryPassMarks: 27,
      practicalFullMarks: 25,
      practicalPassMarks: 10,
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/academic/subjects', data);
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Subject">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Name</label>
            <Input placeholder="e.g. Mathematics" {...register("name")} />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Code</label>
            <Input placeholder="e.g. MAT101" {...register("code")} />
            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Credit Hours</label>
          <Input type="number" placeholder="e.g. 4" {...register("creditHours")} />
          {errors.creditHours && <p className="mt-1 text-sm text-red-600">{errors.creditHours.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 border p-3 rounded bg-gray-50">
            <p className="text-sm font-bold text-gray-700">Theory</p>
            <div>
              <label className="block text-xs font-medium text-gray-700">Full Marks</label>
              <Input type="number" {...register("theoryFullMarks")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Pass Marks</label>
              <Input type="number" {...register("theoryPassMarks")} />
            </div>
          </div>
          
          <div className="space-y-2 border p-3 rounded bg-gray-50">
            <p className="text-sm font-bold text-gray-700">Practical</p>
            <div>
              <label className="block text-xs font-medium text-gray-700">Full Marks</label>
              <Input type="number" {...register("practicalFullMarks")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Pass Marks</label>
              <Input type="number" {...register("practicalPassMarks")} />
            </div>
          </div>
        </div>

        <div className="flex items-center pt-2">
          <input 
            type="checkbox" 
            id="isOptional" 
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            {...register("isOptional")} 
          />
          <label htmlFor="isOptional" className="ml-2 block text-sm text-gray-900">
            This is an optional subject
          </label>
        </div>

        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save Subject</Button>
        </div>

      </form>
    </Modal>
  );
}
