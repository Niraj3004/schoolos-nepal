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
  numericValue: z.coerce.number().int().min(1, "Numeric value is required"),
  order: z.coerce.number().int().min(1, "Order is required"),
});

type FormData = z.infer<typeof schema>;

export default function ClassModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/academic/classes', data);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to create class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Class">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Name</label>
          <Input placeholder="e.g. Class 10, Grade 10" {...register("name")} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Numeric Value</label>
            <Input type="number" placeholder="e.g. 10" {...register("numericValue")} />
            {errors.numericValue && <p className="mt-1 text-sm text-red-600">{errors.numericValue.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Order</label>
            <Input type="number" placeholder="e.g. 10" {...register("order")} />
            {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>}
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save Class</Button>
        </div>

      </form>
    </Modal>
  );
}
