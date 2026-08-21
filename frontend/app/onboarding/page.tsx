"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { CheckCircle2, UploadCloud, Building, User, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';

const onboardingSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  schoolCode: z.string().min(3, 'Slug must be at least 3 chars').regex(/^[a-z0-9-]+$/, 'Lowercase alphanumeric only (e.g., my-school)'),
  schoolAddress: z.string().optional(),
  schoolPhone: z.string().optional(),
  
  adminName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
  
  planId: z.string().min(1, 'Please select a plan'),
  billingCycle: z.enum(['ANNUAL', 'SEMI_ANNUAL']),
  transactionReference: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [qrCodeData, setQrCodeData] = useState<{ qrCodeImageUrl: string, upiId?: string, instructions?: string } | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isValid }, trigger, watch } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onTouched',
    defaultValues: {
      billingCycle: 'ANNUAL'
    }
  });

  const selectedPlanId = watch('planId');

  useEffect(() => {
    // Fetch available plans on mount
    api.get('/saas/plans', { requireAuth: false })
      .then((res: any) => {
        if (res.data) setPlans(res.data);
      })
      .catch(console.error);

    // Fetch Platform QR Code
    api.get('/saas/platform-qr', { requireAuth: false })
      .then((res: any) => {
        if (res.data) setQrCodeData(res.data);
      })
      .catch(console.error);
  }, []);

  const handleNextStep = async () => {
    if (step === 1) {
      // Validate step 1 fields before moving to step 2
      const isStep1Valid = await trigger([
        'schoolName', 'schoolCode', 'schoolAddress', 'schoolPhone',
        'adminName', 'adminEmail', 'adminPassword', 'planId', 'billingCycle'
      ]);
      if (isStep1Valid) setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!receiptFile) {
      setError("Please upload a payment receipt screenshot.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      formData.append('receipt', receiptFile);

      await api.post('/saas/register-school', formData, { requireAuth: false });
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      
      let errorMsg = err.message || "Failed to register school";
      
      // If it's a validation error, extract the specific field errors
      if (err.data?.error?.details && Array.isArray(err.data.error.details)) {
        const details = err.data.error.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ');
        if (details) {
          errorMsg = `${errorMsg} - ${details}`;
        }
      }
      
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center border-none shadow-xl">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful</h2>
            <p className="text-gray-600 mb-8">
              Your registration is currently <strong className="text-warning">Pending SuperAdmin Verification</strong>. 
              We will review your payment receipt and activate your tenant space shortly. You will receive an email upon activation.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Progress Stepper */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-center text-primary mb-8">Onboard Your School</h1>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'bg-white border-gray-300 text-gray-400'}`}>
                1
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">Details</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'bg-white border-gray-300 text-gray-400'}`}>
                2
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">Payment</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 3 ? 'bg-primary border-primary text-primary-foreground' : 'bg-white border-gray-300 text-gray-400'}`}>
                3
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">Verify</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* Step 1: Details */}
          <div className={step === 1 ? 'block' : 'hidden'}>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> School & Admin Details</CardTitle>
                <CardDescription>Enter the primary information for your institution.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">School Info</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">School Name *</label>
                      <Input {...register('schoolName')} placeholder="e.g., Valley View Academy" error={!!errors.schoolName} />
                      {errors.schoolName && <p className="text-xs text-danger">{errors.schoolName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">School URL Slug *</label>
                      <Input {...register('schoolCode')} placeholder="valleyview" error={!!errors.schoolCode} />
                      {errors.schoolCode && <p className="text-xs text-danger">{errors.schoolCode.message}</p>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Address</label>
                      <Input {...register('schoolAddress')} placeholder="Kathmandu, Nepal" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Phone</label>
                      <Input {...register('schoolPhone')} placeholder="+977 1-4XXXXXX" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2"><User className="h-5 w-5"/> Admin Credentials</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Admin Name *</label>
                      <Input {...register('adminName')} placeholder="Ramesh Sharma" error={!!errors.adminName} />
                      {errors.adminName && <p className="text-xs text-danger">{errors.adminName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Admin Email *</label>
                      <Input type="email" {...register('adminEmail')} placeholder="admin@valleyview.edu.np" error={!!errors.adminEmail} />
                      {errors.adminEmail && <p className="text-xs text-danger">{errors.adminEmail.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Admin Password *</label>
                    <Input type="password" {...register('adminPassword')} placeholder="••••••••" error={!!errors.adminPassword} />
                    {errors.adminPassword && <p className="text-xs text-danger">{errors.adminPassword.message}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2"><CreditCard className="h-5 w-5"/> Plan Selection</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">SaaS Plan *</label>
                      <Select {...register('planId')}>
                        <option value="">Select a plan...</option>
                        {plans.map(plan => (
                          <option key={plan._id} value={plan._id}>{plan.name} - रू {plan.priceNPRPerYear}/yr</option>
                        ))}
                        {plans.length === 0 && <option value="fallback-plan-id">Growth Plan - रू 35,000</option>}
                      </Select>
                      {errors.planId && <p className="text-xs text-danger">{errors.planId.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Billing Cycle *</label>
                      <Select {...register('billingCycle')}>
                        <option value="ANNUAL">Annual (Recommended)</option>
                        <option value="SEMI_ANNUAL">Semi-Annual</option>
                      </Select>
                      {errors.billingCycle && <p className="text-xs text-danger">{errors.billingCycle.message}</p>}
                    </div>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="justify-end bg-gray-50 rounded-b-lg border-t mt-4 p-4">
                <Button type="button" onClick={handleNextStep}>Continue to Payment <CheckCircle2 className="ml-2 h-4 w-4"/></Button>
              </CardFooter>
            </Card>
          </div>

          {/* Step 2: Payment */}
          <div className={step === 2 ? 'block' : 'hidden'}>
            <Card className="border-none shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Complete Payment</CardTitle>
                <CardDescription>Scan the QR code below using eSewa, Khalti, or Mobile Banking.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                
                {qrCodeData?.qrCodeImageUrl ? (
                  <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                    <Image 
                      src={qrCodeData.qrCodeImageUrl} 
                      alt="Platform QR Code" 
                      width={250} 
                      height={250} 
                      className="rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500">
                    <Spinner size="lg" className="mb-4" />
                    <p>Loading QR Code...</p>
                  </div>
                )}
                
                <div className="text-center max-w-sm">
                  <p className="font-semibold text-lg text-gray-800">
                    Pay via Fonepay / eSewa
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {qrCodeData?.instructions || "Please complete the payment for the selected plan. Save the screenshot of the successful transaction to upload in the next step."}
                  </p>
                  {qrCodeData?.upiId && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100 font-mono">
                      UPI ID: {qrCodeData.upiId}
                    </div>
                  )}
                </div>

              </CardContent>
              <CardFooter className="justify-between bg-gray-50 rounded-b-lg border-t mt-4 p-4">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>Back</Button>
                <Button type="button" onClick={handleNextStep}>I have made the payment</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Step 3: Receipt Upload */}
          <div className={step === 3 ? 'block' : 'hidden'}>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Upload Receipt</CardTitle>
                <CardDescription>Attach the screenshot of your successful transaction.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="font-medium text-gray-700 mb-1">
                    {receiptFile ? receiptFile.name : "Click or drag file to upload"}
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG or PDF (Max 5MB)</p>
                  
                  {receiptFile && (
                    <Badge variant="success" className="mt-4">File Selected</Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Transaction Reference Number (Optional)</label>
                  <Input {...register('transactionReference')} placeholder="e.g. 1234567890" />
                  <p className="text-xs text-gray-500">Entering this helps us verify your payment faster.</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                    {error}
                  </div>
                )}

              </CardContent>
              <CardFooter className="justify-between bg-gray-50 rounded-b-lg border-t mt-4 p-4">
                <Button variant="outline" type="button" onClick={() => setStep(2)} disabled={isSubmitting}>Back</Button>
                <Button type="submit" disabled={isSubmitting || !receiptFile}>
                  {isSubmitting ? (
                    <><Spinner size="sm" className="mr-2" /> Submitting...</>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

        </form>
      </div>
    </div>
  );
}
