"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

const schema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branch: z.string().min(1, "Branch is required"),
  supportEmail: z.string().email("Valid email required"),
  supportPhone: z.string().min(1, "Support phone is required"),
});

type FormData = z.infer<typeof schema>;

export default function SuperadminSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => api.get('/saas/platform-qr') // Note: public endpoint used to fetch current settings
  });

  const settings = (response as any)?.data;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    if (settings) {
      reset({
        bankName: settings.bankName || '',
        accountName: settings.accountName || '',
        accountNumber: settings.accountNumber || '',
        branch: settings.branch || '',
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      if (qrFile) {
        formData.append('qrCode', qrFile);
      }

      await api.patch('/saas/admin/platform-settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      alert('Platform settings updated successfully!');
      setQrFile(null);
    } catch (error) {
      console.error(error);
      alert('Failed to update platform settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Platform Settings</h2>
        <p className="text-gray-500">Configure global billing, support, and payment QR codes for SaaS onboarding.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bank & Payment Details</CardTitle>
            <CardDescription>Schools will see these details when paying for their subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <Input {...register("bankName")} placeholder="e.g. NIC ASIA Bank" />
                {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <Input {...register("accountName")} placeholder="e.g. SchoolOS Inc." />
                {errors.accountName && <p className="mt-1 text-sm text-red-600">{errors.accountName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <Input {...register("accountNumber")} />
                  {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <Input {...register("branch")} />
                  {errors.branch && <p className="mt-1 text-sm text-red-600">{errors.branch.message}</p>}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Support Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Support Email</label>
                    <Input {...register("supportEmail")} placeholder="support@schoolos.np" />
                    {errors.supportEmail && <p className="mt-1 text-sm text-red-600">{errors.supportEmail.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Support Phone</label>
                    <Input {...register("supportPhone")} />
                    {errors.supportPhone && <p className="mt-1 text-sm text-red-600">{errors.supportPhone.message}</p>}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code Configuration</CardTitle>
            <CardDescription>Upload an Fonepay or eSewa QR code.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 mb-4 overflow-hidden relative">
              {qrFile ? (
                <img src={URL.createObjectURL(qrFile)} alt="New QR" className="object-contain w-full h-full" />
              ) : settings?.qrCodeImageUrl ? (
                <img src={settings.qrCodeImageUrl} alt="Current QR" className="object-contain w-full h-full" />
              ) : (
                <span className="text-sm text-gray-400">No QR Code Uploaded</span>
              )}
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Update QR Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" form="settings-form" isLoading={isSubmitting} className="w-full md:w-auto px-8">
          Save Platform Settings
        </Button>
      </div>

    </div>
  );
}
