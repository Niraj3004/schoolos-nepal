"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginAction = useAuthStore(state => state.login);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') {
        const parts = host.split('.');
        if (parts.length > 1) {
          setSubdomain(parts[0].toUpperCase());
        }
      }
    }
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res: any = await api.post('/auth/login', data, { requireAuth: false });
      const { user, accessToken } = res.data;
      
      loginAction({ 
        user, 
        role: user.role, 
        schoolId: user.schoolId || null, 
        accessToken 
      });

      switch (user.role) {
        case 'SUPERADMIN': router.push('/superadmin'); break;
        case 'ADMIN': router.push('/admin'); break;
        case 'TEACHER': router.push('/teacher'); break;
        case 'PARENT': router.push('/parent'); break;
        case 'STUDENT': router.push('/student'); break;
        default: router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden selection:bg-blue-500/20 selection:text-blue-700">
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-[0.15] blur-[100px]"></div>
        <div className="absolute right-[-10%] top-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-purple-500 opacity-[0.1] blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500 opacity-[0.1] blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24 min-h-[calc(100vh-4rem)] py-12">
        
        {/* Left Typography & Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left"
        >
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center hover:scale-105 transition-transform bg-white/50 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-white/40 ring-1 ring-slate-900/5">
              <img src="/logo.png" alt="SchoolOS Logo" className="h-12 w-auto" />
            </Link>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            The standard for <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              modern education.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10">
            Access your institution's unified workspace. Manage operations, academics, and communications with unparalleled elegance and speed.
          </p>

          <div className="hidden lg:flex flex-col gap-6">
            {[
              { icon: ShieldCheck, title: "Enterprise-grade Security", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: Zap, title: "Lightning Fast Turbopack", color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: Sparkles, title: "AI-Powered Analytics", color: "text-purple-500", bg: "bg-purple-500/10" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1), duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <div className={`h-12 w-12 rounded-2xl ${feature.bg} flex items-center justify-center shadow-sm border border-white`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <span className="text-slate-700 font-semibold text-lg">{feature.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Glass Card Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-1/2 max-w-md mx-auto"
        >
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60 relative overflow-hidden">
            {/* Inner subtle glare */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
            
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                {subdomain ? `Sign in to the ${subdomain} portal` : 'Enter your credentials to access your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-blue-600 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input 
                    {...register('email')} 
                    type="email" 
                    placeholder="name@school.edu.np" 
                    className="pl-12 h-14 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm hover:border-slate-300 text-base font-medium"
                    error={!!errors.email}
                  />
                </div>
                {errors.email && <p className="text-xs font-bold text-red-500 ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2 group pt-2">
                <div className="flex justify-between items-center ml-1 pr-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-blue-600">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input 
                    {...register('password')} 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••" 
                    className="pl-12 pr-12 h-14 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all shadow-sm hover:border-slate-300 text-base font-mono tracking-widest font-bold"
                    error={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:text-blue-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs font-bold text-red-500 ml-1">{errors.password.message}</p>}
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50/80 backdrop-blur-md text-red-700 text-sm rounded-2xl border border-red-100 flex items-start gap-3 mt-4"
                >
                  <ShieldCheck className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="font-bold">{error}</p>
                </motion.div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 text-base font-bold rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-2 group border-0" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Spinner size="sm" className="text-white" /> Authenticating...</>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200/50 text-center">
              <p className="text-slate-500 text-sm font-medium">
                Don't have an institution account?
              </p>
              <Link href="/onboarding" className="inline-flex items-center justify-center mt-3 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors group">
                Register your school <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
