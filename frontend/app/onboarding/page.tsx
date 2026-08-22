"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { CheckCircle2, UploadCloud, Building, User, CreditCard, ArrowRight, ArrowLeft, ShieldCheck, Banknote } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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

  const { register, handleSubmit, formState: { errors }, trigger, watch } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onTouched',
    defaultValues: {
      billingCycle: 'ANNUAL'
    }
  });

  const selectedPlanId = watch('planId');
  const selectedBilling = watch('billingCycle');

  useEffect(() => {
    api.get('/saas/plans', { requireAuth: false })
      .then((res: any) => {
        if (res.data) setPlans(res.data);
      })
      .catch(console.error);

    api.get('/saas/platform-qr', { requireAuth: false })
      .then((res: any) => {
        if (res.data) setQrCodeData(res.data);
      })
      .catch(console.error);
  }, []);

  const handleNextStep = async () => {
    if (step === 1) {
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
      if (err.data?.error?.details && Array.isArray(err.data.error.details)) {
        const details = err.data.error.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ');
        if (details) errorMsg = `${errorMsg} - ${details}`;
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 selection:bg-primary/20 selection:text-primary">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
          <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Registration Submitted!</h2>
          <p className="text-slate-500 mb-8 text-lg leading-relaxed">
            Your application is currently <strong className="text-amber-500 font-semibold">Pending Verification</strong>. 
            Our team will review your payment receipt and activate your dedicated workspace shortly. Keep an eye on your email inbox!
          </p>
          <Link href="/">
            <Button className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              Return to Homepage
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden selection:bg-blue-500/20 selection:text-blue-700">
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500 opacity-[0.07] blur-[120px]"></div>
        <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500 opacity-[0.07] blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center hover:scale-105 transition-transform bg-white/50 p-2 rounded-xl border border-white/40 ring-1 ring-slate-900/5">
            <img src="/logo.png" alt="SchoolOS Logo" className="h-8 w-auto" />
          </Link>
          <div className="text-sm font-bold text-slate-500">
            Need help? <Link href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Contact Support</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl w-full">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Set up your institution</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Get your digital infrastructure up and running in less than 5 minutes. No complex setups required.</p>
          </div>

          {/* Premium Stepper */}
          <div className="mb-12 relative max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full" 
                initial={{ width: "0%" }}
                animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            
            <div className="relative flex justify-between">
              {[
                { num: 1, label: "Details", icon: Building },
                { num: 2, label: "Payment", icon: Banknote },
                { num: 3, label: "Verify", icon: ShieldCheck }
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                    step > s.num ? 'bg-primary text-white border-none' : 
                    step === s.num ? 'bg-white border-2 border-primary text-primary ring-4 ring-primary/10' : 
                    'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <span className={`mt-3 text-sm font-semibold transition-colors ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden relative">
            {/* Subtle Top Glare */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
            
            <div className="p-8 sm:p-12">
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Details */}
                  {step === 1 && (
                    <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                      
                      {/* School Info Section */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center"><Building className="h-5 w-5 text-blue-600" /></div>
                          <h3 className="text-xl font-bold text-slate-900">Institution Details</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">School Name *</label>
                            <Input {...register('schoolName')} placeholder="e.g., Valley View Academy" className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-medium" error={!!errors.schoolName} />
                            {errors.schoolName && <p className="text-xs font-bold text-red-500 ml-1">{errors.schoolName.message}</p>}
                          </div>
                          <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">School Portal URL *</label>
                            <div className="relative flex items-center">
                              <Input {...register('schoolCode')} placeholder="valleyview" className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-medium pr-28" error={!!errors.schoolCode} />
                              <span className="absolute right-4 text-slate-400 font-bold text-sm pointer-events-none">.schoolos.com</span>
                            </div>
                            {errors.schoolCode && <p className="text-xs font-bold text-red-500 ml-1">{errors.schoolCode.message}</p>}
                          </div>
                          <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">Address</label>
                            <Input {...register('schoolAddress')} placeholder="Kathmandu, Nepal" className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-medium" />
                          </div>
                          <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">Contact Phone</label>
                            <Input {...register('schoolPhone')} placeholder="+977 1-4XXXXXX" className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-medium" />
                          </div>
                        </div>
                      </section>

                      <hr className="border-slate-100" />

                      {/* Admin Credentials */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center"><User className="h-5 w-5 text-emerald-600" /></div>
                          <h3 className="text-xl font-bold text-slate-900">Administrator Account</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">Full Name *</label>
                            <Input {...register('adminName')} placeholder="Ramesh Sharma" className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-medium" error={!!errors.adminName} />
                            {errors.adminName && <p className="text-xs font-bold text-red-500 ml-1">{errors.adminName.message}</p>}
                          </div>
                          <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">Work Email *</label>
                            <Input type="email" {...register('adminEmail')} placeholder="admin@valleyview.edu.np" className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-medium" error={!!errors.adminEmail} />
                            {errors.adminEmail && <p className="text-xs font-bold text-red-500 ml-1">{errors.adminEmail.message}</p>}
                          </div>
                          <div className="space-y-2 group md:col-span-2 max-w-md">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">Secure Password *</label>
                            <Input type="password" {...register('adminPassword')} placeholder="••••••••" className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-mono tracking-widest font-bold" error={!!errors.adminPassword} />
                            {errors.adminPassword && <p className="text-xs font-bold text-red-500 ml-1">{errors.adminPassword.message}</p>}
                          </div>
                        </div>
                      </section>

                      <hr className="border-slate-100" />

                      {/* Plan Selection */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center"><CreditCard className="h-5 w-5 text-purple-600" /></div>
                          <h3 className="text-xl font-bold text-slate-900">Subscription Plan</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">Select Plan *</label>
                            <Select {...register('planId')} className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-medium">
                              <option value="">Choose a plan...</option>
                              {plans.map(plan => (
                                <option key={plan._id} value={plan._id}>{plan.name} - रू {plan.priceNPRPerYear}/yr</option>
                              ))}
                              {plans.length === 0 && <option value="fallback-plan-id">Enterprise Plan - Custom Pricing</option>}
                            </Select>
                            {errors.planId && <p className="text-xs font-bold text-red-500 ml-1">{errors.planId.message}</p>}
                          </div>
                          <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">Billing Cycle *</label>
                            <Select {...register('billingCycle')} className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-medium">
                              <option value="ANNUAL">Billed Annually (Save 20%)</option>
                              <option value="SEMI_ANNUAL">Billed Semi-Annually</option>
                            </Select>
                            {errors.billingCycle && <p className="text-xs font-bold text-red-500 ml-1">{errors.billingCycle.message}</p>}
                          </div>
                        </div>
                      </section>

                      <div className="flex justify-end pt-6">
                        <Button type="button" onClick={handleNextStep} className="h-12 px-8 text-base font-bold rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all group">
                          Continue to Payment <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Payment */}
                  {step === 2 && (
                    <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center py-4">
                      
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Secure Payment</h2>
                        <p className="text-slate-500 mt-2">Scan the QR code below using your preferred digital wallet.</p>
                      </div>

                      {qrCodeData?.qrCodeImageUrl ? (
                        <div className="p-6 bg-white border-2 border-dashed border-slate-200 rounded-3xl shadow-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Image 
                            src={qrCodeData.qrCodeImageUrl} 
                            alt="Platform QR Code" 
                            width={280} 
                            height={280} 
                            style={{ width: 'auto', height: 'auto' }}
                            className="rounded-2xl relative z-10"
                          />
                        </div>
                      ) : (
                        <div className="w-[328px] h-[328px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                          <Spinner size="lg" className="mb-4 text-primary" />
                          <p className="font-medium">Generating secure QR code...</p>
                        </div>
                      )}
                      
                      <div className="text-center max-w-sm mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex justify-center gap-4 mb-4">
                          <Badge variant="default" className="bg-white border-slate-200 text-slate-600 px-3 py-1">eSewa</Badge>
                          <Badge variant="default" className="bg-white border-slate-200 text-slate-600 px-3 py-1">Khalti</Badge>
                          <Badge variant="default" className="bg-white border-slate-200 text-slate-600 px-3 py-1">Fonepay</Badge>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {qrCodeData?.instructions || "Complete the transfer for your selected plan. Please save a screenshot of the successful transaction receipt."}
                        </p>
                        {qrCodeData?.upiId && (
                          <div className="mt-4 p-3 bg-white text-slate-800 rounded-xl text-sm border border-slate-200 font-mono font-bold shadow-sm flex items-center justify-center gap-2">
                            UPI: <span className="text-primary">{qrCodeData.upiId}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between w-full mt-12 pt-6 border-t border-slate-100">
                        <Button variant="outline" type="button" onClick={() => setStep(1)} className="h-12 px-6 rounded-xl font-semibold border-slate-200 hover:bg-slate-50">
                          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                        </Button>
                        <Button type="button" onClick={handleNextStep} className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 group">
                          I've made the payment <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Receipt Upload */}
                  {step === 3 && (
                    <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="py-4">
                      
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Verify Payment</h2>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">Upload the screenshot of your transaction receipt to finalize your registration.</p>
                      </div>

                      <div className="max-w-md mx-auto">
                        <div className={`border-2 border-dashed ${receiptFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'} rounded-3xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden group`}>
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          
                          {receiptFile ? (
                            <>
                              <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                              </div>
                              <p className="font-bold text-slate-900 mb-1 text-center line-clamp-1">{receiptFile.name}</p>
                              <p className="text-sm text-emerald-600 font-medium">Ready to upload</p>
                            </>
                          ) : (
                            <>
                              <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="h-8 w-8 text-primary" />
                              </div>
                              <p className="font-bold text-slate-700 mb-1">Click to upload receipt</p>
                              <p className="text-sm text-slate-500">PNG, JPG or PDF (Max 5MB)</p>
                            </>
                          )}
                        </div>

                        <div className="mt-8 space-y-2 group">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors ml-1">Transaction Reference (Optional)</label>
                          <Input {...register('transactionReference')} placeholder="e.g. 000123456789" className="h-12 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm text-base font-mono font-bold" />
                          <p className="text-xs font-medium text-slate-500 mt-1 ml-1">Entering this speeds up the verification process.</p>
                        </div>

                        {error && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 font-medium mt-6 flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-red-600 shrink-0" />
                            {error}
                          </motion.div>
                        )}
                      </div>

                      <div className="flex items-center justify-between w-full mt-12 pt-6 border-t border-slate-100">
                        <Button variant="outline" type="button" onClick={() => setStep(2)} disabled={isSubmitting} className="h-12 px-6 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 shadow-sm transition-all hover:-translate-y-0.5">
                          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !receiptFile} className="h-12 px-8 text-base font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 transition-all group">
                          {isSubmitting ? (
                            <><Spinner size="sm" className="mr-2 text-white" /> Processing...</>
                          ) : (
                            <>Submit Registration <CheckCircle2 className="ml-2 h-5 w-5" /></>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                </AnimatePresence>
              </form>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
