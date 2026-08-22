"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';

const schema = z.object({
  name: z.enum(['Starter', 'Growth', 'Enterprise']),
  maxStudents: z.coerce.number().int().positive("Must be a positive number"),
  priceNPRPerYear: z.coerce.number().positive("Must be a positive number"),
  features: z.array(z.object({ value: z.string().min(1, "Feature cannot be empty") })).min(1, "At least one feature is required"),
});

type FormData = z.infer<typeof schema>;

export default function PlanModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: 'Starter',
      maxStudents: 100,
      priceNPRPerYear: 50000,
      features: [{ value: 'Student Management' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features"
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Flatten features array of objects to array of strings for backend
      const payload = {
        ...data,
        features: data.features.map(f => f.value)
      };
      await api.post('/saas/admin/plans', payload);
      queryClient.invalidateQueries({ queryKey: ['saasPlans'] });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to create plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add SaaS Plan">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Plan Name</label>
          <select 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
            {...register("name")}
          >
            <option value="Starter">Starter</option>
            <option value="Growth">Growth</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Students</label>
            <Input type="number" {...register("maxStudents")} />
            {errors.maxStudents && <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (NPR / Year)</label>
            <Input type="number" {...register("priceNPRPerYear")} />
            {errors.priceNPRPerYear && <p className="mt-1 text-sm text-red-600">{errors.priceNPRPerYear.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features Included</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <Input 
                {...register(`features.${index}.value`)} 
                placeholder="e.g. Attendance Tracking" 
              />
              <Button type="button" variant="outline" onClick={() => remove(index)}>
                <Trash2 className="w-4 h-4 text-danger" />
              </Button>
            </div>
          ))}
          {errors.features && <p className="mt-1 text-sm text-red-600">{errors.features.message}</p>}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })} className="mt-2">
            <Plus className="w-4 h-4 mr-1" /> Add Feature
          </Button>
        </div>

        <div className="pt-4 flex justify-end space-x-2 border-t mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save Plan</Button>
        </div>

      </form>
    </Modal>
  );
}
