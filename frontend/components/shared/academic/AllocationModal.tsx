"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';

const schema = z.object({
  academicYearId: z.string().min(1, "Academic Year is required"),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required")
});

type FormData = z.infer<typeof schema>;

export default function AllocationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const selectedClassId = watch('classId');

  const { data: yearsRes } = useQuery({ queryKey: ['academicYears'], queryFn: () => api.get('/academic/academic-years') });
  const { data: classesRes } = useQuery({ queryKey: ['classes'], queryFn: () => api.get('/academic/classes') });
  const { data: subjectsRes } = useQuery({ queryKey: ['subjects'], queryFn: () => api.get('/academic/subjects') });
  const { data: teachersRes } = useQuery({ queryKey: ['teachers'], queryFn: () => api.get('/staff/teachers') });
  
  const years = (yearsRes as any)?.data || [];
  const classes = (classesRes as any)?.data || [];
  const subjects = (subjectsRes as any)?.data || [];
  const teachers = (teachersRes as any)?.data?.teachers || [];
  
  const selectedClassObj = classes.find((c: any) => c._id === selectedClassId);
  const sections = selectedClassObj?.sections || [];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/academic/allocations', data);
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to allocate teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Allocate Teacher to Subject">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Academic Year</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" {...register("academicYearId")}>
            <option value="">Select Year...</option>
            {years.map((y: any) => (
              <option key={y._id} value={y._id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
            ))}
          </select>
          {errors.academicYearId && <p className="mt-1 text-sm text-red-600">{errors.academicYearId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Section</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" {...register("sectionId")} disabled={!selectedClassId}>
              <option value="">Select Section...</option>
              {sections.map((s: any) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            {errors.sectionId && <p className="mt-1 text-sm text-red-600">{errors.sectionId.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" {...register("subjectId")}>
            <option value="">Select Subject...</option>
            {subjects.map((s: any) => (
              <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
            ))}
          </select>
          {errors.subjectId && <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teacher</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" {...register("teacherId")}>
            <option value="">Select Teacher...</option>
            {teachers.map((t: any) => (
              <option key={t._id} value={t.userId?._id}>{t.firstName} {t.lastName}</option>
            ))}
          </select>
          {errors.teacherId && <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>}
        </div>

        <div className="pt-4 flex justify-end space-x-2 border-t mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Allocate</Button>
        </div>
      </form>
    </Modal>
  );
}
