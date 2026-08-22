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
  capacity: z.coerce.number().int().positive("Capacity must be positive"),
});

type FormData = z.infer<typeof schema>;

export default function SectionModal({ isOpen, onClose, classId }: { isOpen: boolean; onClose: () => void, classId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { capacity: 40 }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/academic/sections', { ...data, classId });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to create section');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Section">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Section Name</label>
          <Input placeholder="e.g. A, B, Rose, Lily" {...register("name")} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Capacity (Max Students)</label>
          <Input type="number" placeholder="e.g. 40" {...register("capacity")} />
          {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
        </div>

        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save Section</Button>
        </div>

      </form>
    </Modal>
  );
}
